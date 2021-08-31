import * as vscode from 'vscode'

import { getTestExecutionDetail, ITestExecutionDetail } from './helper'
import { ENTRY_TYPE } from './types/entry'

class ProviderCodeLens implements vscode.CodeLensProvider {
  async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
    let codeLensArray = []
    let tedArray: ITestExecutionDetail[] = await getTestExecutionDetail(document.uri, ENTRY_TYPE.FILE)
    tedArray.forEach(ted => {
      if (!ted.testIgnored) {
        let codeLensLocation = new vscode.Range(ted.codelensLine, 0, ted.codelensLine, 0)
        let commandArgs = [ted]
        let codeLensRunCommand: vscode.Command = {
          arguments: [commandArgs],
          command: "IndigoRunner.tests.run",
          title: ted.codelensRunTitle
        }
        let codeLensDebugCommand: vscode.Command = {
          arguments: [commandArgs],
          command: "IndigoRunner.tests.debug",
          title: ted.codelensDebugTitle
        }
        codeLensArray.push(new vscode.CodeLens(codeLensLocation, codeLensRunCommand))
        codeLensArray.push(new vscode.CodeLens(codeLensLocation, codeLensDebugCommand))
      }
    })
    return codeLensArray
  }
}

export default ProviderCodeLens
