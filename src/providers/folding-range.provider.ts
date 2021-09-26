import * as vscode from 'vscode'

import { getTestExecutionDetail, ITestExecutionDetail } from '../helper'
import { ENTRY_TYPE } from '../types/entry'

class FoldingRangeProvider implements vscode.FoldingRangeProvider {

  async provideFoldingRanges(document: vscode.TextDocument, context: vscode.FoldingContext, token: vscode.CancellationToken): Promise<vscode.FoldingRange[]> {
    let tedArray: ITestExecutionDetail[] = await getTestExecutionDetail(document.uri, ENTRY_TYPE.FILE)
    let scenarioLines = []
    let foldingRanges: vscode.FoldingRange[] = []
    let scenarioRegExp = new RegExp("^\\s*(Scenario|Scenario Outline):(.*)$")
    for (let ndx = 0; ndx < tedArray.length; ndx++) {
      let testTitle = tedArray[ndx].testTitle
      let scenarioMatch = testTitle.match(scenarioRegExp)
      if (scenarioMatch !== null && scenarioMatch.index !== undefined) {
        scenarioLines.push({ codelensLine: tedArray[ndx].codelensLine, testLine: tedArray[ndx].testLine })
      }
    }
    for (let ndx = 0; ndx < scenarioLines.length - 1; ndx++) {
      let start: number = scenarioLines[ndx].testLine
      let end: number = scenarioLines[ndx + 1].codelensLine - 1
      if (start < 0) {
        start = 0
      }
      if (end < 0) {
        end = 0
      }
      if (document.lineAt(end).text.trim() === "") {
        if (end > 0) { end-- }
      }
      foldingRanges.push(new vscode.FoldingRange(start, end))
    }
    let start: number = scenarioLines[scenarioLines.length - 1].testLine
    let end: number = document.lineCount - 1
    foldingRanges.push(new vscode.FoldingRange(start, end))
    return foldingRanges
  }
}

export default FoldingRangeProvider
