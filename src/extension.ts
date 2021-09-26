import * as vscode from 'vscode'

import {
  debugKarateTest,
  displayReportsTree,
  displayTestsTree,
  filterReportsTree,
  filterTestsTree,
  getDebugBuildFile,
  getDebugFile,
  openExternalUri,
  openFileInEditor,
  openKarateSettings,
  runAllKarateTests,
  runKarateTest,
  runTagKarateTests,
  smartPaste,
  toggleResultsInGutter,
} from './commands'
import { createTreeViewWatcher } from './helper'
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
import { RemoteProviders } from './remote/remote-providers'

//import ProviderFoldingRange from "./providerFoldingRange"

let reportsWatcher = null
let karateTestsWatcher = null

export function activate(context: vscode.ExtensionContext) {
  new RemoteProviders(context)
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

  let smartPasteCommand = vscode.commands.registerCommand("IndigoRunner.paste", smartPaste)
  let getDebugFileCommand = vscode.commands.registerCommand("IndigoRunner.getDebugFile", getDebugFile)
  let getDebugBuildFileCommand = vscode.commands.registerCommand("IndigoRunner.getDebugBuildFile", getDebugBuildFile)
  let debugTestCommand = vscode.commands.registerCommand("IndigoRunner.tests.debug", debugKarateTest)
  let debugAllCommand = vscode.commands.registerCommand("IndigoRunner.tests.debugAll", debugKarateTest)
  let runTestCommand = vscode.commands.registerCommand("IndigoRunner.tests.run", runKarateTest)
  let runAllCommand = vscode.commands.registerCommand("IndigoRunner.tests.runAll", runAllKarateTests)
  let runTagCommand = vscode.commands.registerCommand("IndigoRunner.tests.runTag", runTagKarateTests)
  let displayListReportsTreeCommand = vscode.commands.registerCommand("IndigoRunner.reports.displayList", () => displayReportsTree("List"))
  let displayTreeReportsTreeCommand = vscode.commands.registerCommand("IndigoRunner.reports.displayTree", () => displayReportsTree("Tree"))
  let displayListTestsTreeCommand = vscode.commands.registerCommand("IndigoRunner.tests.displayList", () => displayTestsTree("List"))
  let displayTreeTestsTreeCommand = vscode.commands.registerCommand("IndigoRunner.tests.displayTree", () => displayTestsTree("Tree"))
  let displayTagTestsTreeCommand = vscode.commands.registerCommand("IndigoRunner.tests.displayTag", () => displayTestsTree("Tag"))
  let openReportCommand = vscode.commands.registerCommand("IndigoRunner.reports.open", openExternalUri)
  let refreshReportsTreeCommand = vscode.commands.registerCommand("IndigoRunner.reports.refreshTree", () => reportsProvider.refresh())
  let refreshTestsTreeCommand = vscode.commands.registerCommand("IndigoRunner.tests.refreshTree", () => karateTestsProvider.refresh())
  let filterReportsTreeCommand = vscode.commands.registerCommand("IndigoRunner.reports.filterTree", () => filterReportsTree(context))
  let filterTestsTreeCommand = vscode.commands.registerCommand("IndigoRunner.tests.filterTree", () => filterTestsTree(context))
  let clearResultsCommand = vscode.commands.registerCommand("IndigoRunner.tests.clearResults", () => {
    karateTestsProvider.clearResults()
    decorationsProvider.triggerUpdateDecorations()
    StatusBarProvider.reset()
  })
  let openSettingsCommand = vscode.commands.registerCommand("IndigoRunner.tests.openSettings", openKarateSettings)
  let toggleResultsInGutterCommand = vscode.commands.registerCommand("IndigoRunner.editor.toggleResultsInGutter", toggleResultsInGutter)
  let openFileCommand = vscode.commands.registerCommand("IndigoRunner.tests.open", openFileInEditor)
  let registerDebugAdapterProvider = vscode.debug.registerDebugAdapterDescriptorFactory('karate', debugAdapterProvider)
  let registerDebugConfigurationProvider = vscode.debug.registerDebugConfigurationProvider('karate', debugConfigurationProvider)
  let registerCodeLensProvider = vscode.languages.registerCodeLensProvider(karateFile, codeLensProvider)
  let registerDefinitionProvider = vscode.languages.registerDefinitionProvider(karateFile, definitionProvider)
  let registerHoverRunDebugProvider = vscode.languages.registerHoverProvider(karateFile, hoverRunDebugProvider)
  let registerCompletionItemProvider = vscode.languages.registerCompletionItemProvider(karateFile, completionItemProvider, ...['\'', '\"'])
  //let registerFoldingRangeProvider = vscode.languages.registerFoldingRangeProvider(karateFile, foldingRangeProvider)

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

  context.subscriptions.push(smartPasteCommand)
  context.subscriptions.push(getDebugFileCommand)
  context.subscriptions.push(getDebugBuildFileCommand)
  context.subscriptions.push(debugTestCommand)
  context.subscriptions.push(debugAllCommand)
  context.subscriptions.push(runTestCommand)
  context.subscriptions.push(runAllCommand)
  context.subscriptions.push(runTagCommand)
  context.subscriptions.push(displayListReportsTreeCommand)
  context.subscriptions.push(displayTreeReportsTreeCommand)
  context.subscriptions.push(displayListTestsTreeCommand)
  context.subscriptions.push(displayTreeTestsTreeCommand)
  context.subscriptions.push(displayTagTestsTreeCommand)
  context.subscriptions.push(openReportCommand)
  context.subscriptions.push(refreshReportsTreeCommand)
  context.subscriptions.push(refreshTestsTreeCommand)
  context.subscriptions.push(filterReportsTreeCommand)
  context.subscriptions.push(filterTestsTreeCommand)
  context.subscriptions.push(clearResultsCommand)
  context.subscriptions.push(openSettingsCommand)
  context.subscriptions.push(toggleResultsInGutterCommand)
  context.subscriptions.push(openFileCommand)
  context.subscriptions.push(registerDebugAdapterProvider)
  context.subscriptions.push(registerDebugConfigurationProvider)
  context.subscriptions.push(registerCodeLensProvider)
  context.subscriptions.push(registerDefinitionProvider)
  context.subscriptions.push(resultsProvider)
  context.subscriptions.push(registerHoverRunDebugProvider)
  context.subscriptions.push(registerCompletionItemProvider)
  //context.subscriptions.push(registerFoldingRangeProvider)
}

export function deactivate() {
  reportsWatcher.dispose()
  karateTestsWatcher.dispose()
}
