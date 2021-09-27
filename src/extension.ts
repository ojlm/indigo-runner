import * as vscode from 'vscode'

import * as commands from './commands'
import { RunnerCommands } from './commaon/constants'
import { createTreeViewWatcher } from './helper'
import logger from './logger'
import CodeLensProvider from './providers/code-lens.provider'
import CompletionItemProvider from './providers/completion-item.provider'
import DebugAdapterProvider from './providers/debug-adapter.provider'
import DebugConfigurationProvider from './providers/debug-configuration.provider'
import DecorationsProvider from './providers/decorations.provider'
import DefinitionProvider from './providers/definition.provider'
import ExecutionsProvider from './providers/executions.provider'
import HoverRunDebugProvider from './providers/hover-run-debug.provider'
import KarateTestsProvider from './providers/karate-tests.provider'
import ReportsProvider from './providers/reports.provider'
import { ResultsProvider } from './providers/results.provider'
import StatusBarProvider from './providers/status-bar.provider'
import { Project } from './remote/model/ide.model'
import { RemoteProjectProvider } from './remote/providers/remote-project.provider'
import { RemoteProviders } from './remote/remote-providers'

//import ProviderFoldingRange from "./providerFoldingRange"

let reportsWatcher = null
let karateTestsWatcher = null

export function activate(context: vscode.ExtensionContext) {
  const remoteProviders = new RemoteProviders(context)
  const remoteProjectProvider = new RemoteProjectProvider(remoteProviders)
  remoteProviders.http.onDidChangeClient(() => remoteProjectProvider.reresh())
  logger.show()

  //showWhatsNew(context)
  let resultsProvider = new ResultsProvider()
  let reportsProvider = new ReportsProvider()
  let karateTestsProvider = new KarateTestsProvider()
  let debugAdapterProvider = new DebugAdapterProvider()
  let debugConfigurationProvider = new DebugConfigurationProvider()
  let executionsProvider = new ExecutionsProvider()
  let statusBarProvider = new StatusBarProvider(context)
  let codeLensProvider = new CodeLensProvider()
  let definitionProvider = new DefinitionProvider()
  let hoverRunDebugProvider = new HoverRunDebugProvider(context)
  let completionItemProvider = new CompletionItemProvider()
  let decorationsProvider = new DecorationsProvider(context)
  //let foldingRangeProvider = new ProviderFoldingRange()

  let karateFile = { language: "karate", scheme: "file" }

  context.subscriptions.push(resultsProvider)

  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.remote.refresh, () => remoteProjectProvider.reresh()))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.remote.open, (project: Project) => commands.openRemoteProject(project)))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.paste, commands.smartPaste))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.getDebugFile, commands.getDebugFile))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.getDebugBuildFile, commands.getDebugBuildFile))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.debug, commands.debugKarateTest))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.debugAll, commands.debugKarateTest))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.run, commands.runKarateTest))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.runAll, commands.runAllKarateTests))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.runTag, commands.runTagKarateTests))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.reports.displayList, () => commands.displayReportsTree("List")))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.reports.displayTree, () => commands.displayReportsTree("Tree")))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.displayList, () => commands.displayTestsTree("List")))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.displayTree, () => commands.displayTestsTree("Tree")))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.displayTag, () => commands.displayTestsTree("Tag")))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.reports.open, commands.openExternalUri))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.reports.refreshTree, () => reportsProvider.refresh()))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.refreshTree, () => karateTestsProvider.refresh()))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.reports.filterTree, () => commands.filterReportsTree(context)))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.filterTree, () => commands.filterTestsTree(context)))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.clearResults, () => {
    karateTestsProvider.clearResults()
    decorationsProvider.triggerUpdateDecorations()
    StatusBarProvider.reset()
  }))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.openSettings, commands.openSettings))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.editor.toggleResultsInGutter, commands.toggleResultsInGutter))
  context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.tests.open, commands.openFileInEditor))


  context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('karate', debugAdapterProvider))
  context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('karate', debugConfigurationProvider))
  context.subscriptions.push(vscode.languages.registerCodeLensProvider(karateFile, codeLensProvider))
  context.subscriptions.push(vscode.languages.registerDefinitionProvider(karateFile, definitionProvider))
  context.subscriptions.push(vscode.languages.registerHoverProvider(karateFile, hoverRunDebugProvider))
  context.subscriptions.push(vscode.languages.registerCompletionItemProvider(karateFile, completionItemProvider, ...['\'', '\"']))
  //context.subscriptions.push(vscode.languages.registerFoldingRangeProvider(karateFile, foldingRangeProvider))

  context.subscriptions.push(vscode.window.registerTreeDataProvider('indigo-remote', remoteProjectProvider))

  createTreeViewWatcher(
    reportsWatcher,
    String(vscode.workspace.getConfiguration('IndigoRunner.reports').get('toTargetByGlob')),
    reportsProvider
  )

  createTreeViewWatcher(
    karateTestsWatcher,
    String(vscode.workspace.getConfiguration('IndigoRunner.tests').get('toTargetByGlob')),
    karateTestsProvider
  )

  vscode.workspace.onDidChangeConfiguration((e) => {
    let toggleResultsInGutter = e.affectsConfiguration("IndigoRunner.editor.toggleResultsInGutter")
    if (toggleResultsInGutter) {
      decorationsProvider.triggerUpdateDecorations()
    }
    let reportsDisplayType = e.affectsConfiguration("IndigoRunner.reports.activityBarDisplayType")
    let reportsToTarget = e.affectsConfiguration("IndigoRunner.reports.toTargetByGlob")
    if (reportsDisplayType) {
      reportsProvider.refresh()
    }
    if (reportsToTarget) {
      try {
        reportsWatcher.dispose()
      } catch (e) {
        // do nothing
      }
      createTreeViewWatcher(
        reportsWatcher,
        String(vscode.workspace.getConfiguration('IndigoRunner.reports').get('toTargetByGlob')),
        reportsProvider
      )
    }
    let karateTestsDisplayType = e.affectsConfiguration("IndigoRunner.tests.activityBarDisplayType")
    let karateTestsHideIgnored = e.affectsConfiguration("IndigoRunner.tests.hideIgnored")
    let karateTestsToTargetByGlob = e.affectsConfiguration("IndigoRunner.tests.toTargetByGlob")
    let karateTestsToTargetByTag = e.affectsConfiguration("IndigoRunner.tests.toTargetByTag")
    if (karateTestsDisplayType || karateTestsHideIgnored || karateTestsToTargetByTag) {
      karateTestsProvider.refresh()
    }
    if (karateTestsToTargetByGlob) {
      try {
        karateTestsWatcher.dispose()
      } catch (e) {
        // do nothing
      }
      createTreeViewWatcher(
        karateTestsWatcher,
        String(vscode.workspace.getConfiguration('IndigoRunner.tests').get('toTargetByGlob')),
        karateTestsProvider
      )
    }
  })

}

export function deactivate() {
  reportsWatcher.dispose()
  karateTestsWatcher.dispose()
}
