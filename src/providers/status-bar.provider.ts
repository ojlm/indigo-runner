import * as vscode from 'vscode'

import ProviderExecutions from './executions.provider'
import { ResultsProvider } from './results.provider'

class StatusBarProvider {

  private static statusBarItem: vscode.StatusBarItem
  private static statusBarCommand: vscode.Disposable
  private static statusBarCommandId: string = "IndigoRunner.tests.showExecutionHistory"

  constructor(context: vscode.ExtensionContext) {
    StatusBarProvider.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 50)
    StatusBarProvider.statusBarCommand = vscode.commands.registerCommand(StatusBarProvider.statusBarCommandId, ProviderExecutions.showExecutionHistory)
    StatusBarProvider.statusBarItem.command = StatusBarProvider.statusBarCommandId
    StatusBarProvider.statusBarItem.name = "Indigo Runner"
    StatusBarProvider.reset()
    context.subscriptions.push(StatusBarProvider.statusBarItem)
    context.subscriptions.push(StatusBarProvider.statusBarCommand)
    ResultsProvider.onSummaryResults((json) => { StatusBarProvider.setFromResults(json) })
  }

  public static set(passed, failed, tooltip) {
    StatusBarProvider.statusBarItem.text = `Karate $(pass) ${passed} $(error) ${failed}`
    StatusBarProvider.statusBarItem.tooltip = tooltip
    let failureActual = (passed + failed == 0) ? 0 : failed / (passed + failed)
    let failureThreshold = parseFloat(vscode.workspace.getConfiguration('IndigoRunner.statusBar').get('colorOnFailureThreshold')) / 100
    if (failureActual >= failureThreshold) {
      StatusBarProvider.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground')
    } else {
      StatusBarProvider.statusBarItem.backgroundColor = undefined
    }
    StatusBarProvider.statusBarItem.show()
  }

  public static reset() {
    StatusBarProvider.set(0, 0, "No Results")
  }

  private static setFromResults(json) {
    let resultsTime: string = `${json.lastModified}`
    let resultsStats: string
    if ("featuresPassed" in json) {
      resultsStats = `Features: ${json.featuresPassed + json.featuresFailed} | Scenarios: ${json.scenariosPassed + json.scenariosfailed} | Passed: ${json.scenariosPassed} | Failed: ${json.scenariosfailed} | Elapsed: ${(json.elapsedTime / 1000).toFixed(2)}`
    } else {
      resultsStats = `Features: ${json.features} | Scenarios: ${json.scenarios} | Passed: ${json.passed} | Failed: ${json.failed} | Elapsed: ${(json.elapsedTime / 1000).toFixed(2)}`
    }
    let resultsClassPath: any = null
    if (ProviderExecutions.executionArgs !== null) {
      resultsClassPath = `${ProviderExecutions.executionArgs.karateJarOptions}`
    }
    let tooltip: string
    if (resultsClassPath !== null) {
      tooltip = `${resultsTime}\n${resultsClassPath}\n${resultsStats}`
    } else {
      tooltip = `${resultsTime}\n${resultsStats}`
    }
    if ("featuresPassed" in json) {
      StatusBarProvider.set(json.scenariosPassed, json.scenariosfailed, tooltip)
    } else {
      StatusBarProvider.set(json.passed, json.failed, tooltip)
    }
  }
}

export default StatusBarProvider
