import * as vscode from 'vscode'

import { runKarateTest } from '../commands'
import { ResultsProvider } from './results.provider'

interface IExecutionItem {
  executionArgs: any
  quickPickItem: vscode.QuickPickItem
}

class ExecutionsProvider {

  private static executionHistory: IExecutionItem[] = []
  public static executionArgs: any = null
  private static summaryResultsData: any = null

  constructor() {
    ResultsProvider.onSummaryResults(json => {
      ExecutionsProvider.summaryResultsData = json
    })
  }

  public static addExecutionToHistory() {
    let json = ExecutionsProvider.summaryResultsData
    if (json === null) {
      return
    }
    if (ExecutionsProvider.executionArgs === null) {
      return
    }
    let executionDate: string = `${json.lastModified}`
    let executionStats: string
    let executionIcon: string

    if ("featuresPassed" in json) {
      executionStats = `Features: ${json.featuresPassed + json.featuresFailed} | Scenarios: ${json.scenariosPassed + json.scenariosfailed} | Passed: ${json.scenariosPassed} | Failed: ${json.scenariosfailed} | Elapsed: ${(json.elapsedTime / 1000).toFixed(2)}`
      executionIcon = ((json.featuresFailed + json.scenariosfailed) > 0) ? `$(error) [F]` : `$(pass) [P]`
    } else {
      executionStats = `Features: ${json.features} | Scenarios: ${json.scenarios} | Passed: ${json.passed} | Failed: ${json.failed} | Elapsed: ${(json.elapsedTime / 1000).toFixed(2)}`
      executionIcon = (json.failed > 0) ? `$(error) [F]` : `$(pass) [P]`
    }
    let executionItem: IExecutionItem = {
      executionArgs: ExecutionsProvider.executionArgs,
      quickPickItem: {
        label: `${executionIcon} ${executionDate}`,
        description: ExecutionsProvider.executionArgs.karateJarOptions,
        detail: `${executionStats}`
      }
    }
    let executionHistoryLimit: number = Number(vscode.workspace.getConfiguration('IndigoRunner.executionHistory').get('limit'))
    executionHistoryLimit = (executionHistoryLimit <= 0) ? 1 : executionHistoryLimit
    while (ExecutionsProvider.executionHistory.length >= executionHistoryLimit) {
      ExecutionsProvider.executionHistory.pop()
    }
    ExecutionsProvider.executionHistory.unshift(executionItem)
    ExecutionsProvider.summaryResultsData = null
  }

  public static async showExecutionHistory() {
    if (ExecutionsProvider.executionHistory.length <= 0) {
      return
    }
    let quickPickItems = ExecutionsProvider.executionHistory.map(item => item.quickPickItem)
    let quickPickOptions = <vscode.QuickPickOptions>{
      canPickMany: false,
      ignoreFocusOut: false,
      matchOnDescription: true,
      matchOnDetail: true,
      placeHolder: `Select execution to run from history...`
    }
    let quickPickExecution = await vscode.window.showQuickPick(quickPickItems, quickPickOptions)
    if (quickPickExecution !== undefined) {
      try {
        let execution = ExecutionsProvider.executionHistory.filter((item) => item.quickPickItem.label == quickPickExecution.label)
        runKarateTest([execution[0].executionArgs])
      } catch (e) {
        // do nothing
      }
    }
  }
}

export default ExecutionsProvider
