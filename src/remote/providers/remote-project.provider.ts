import * as vscode from 'vscode'

import { Project, Workspace } from '../model/ide.model'
import { RemoteProviders } from '../remote-providers'

export class RemoteProjectProvider implements vscode.TreeDataProvider<RemoteProjectNode>  {

  private _onDidChangeTreeData = new vscode.EventEmitter<void>()
  readonly onDidChangeTreeData: vscode.Event<void | RemoteProjectNode> = this._onDidChangeTreeData.event

  constructor(private remote: RemoteProviders) {
  }

  reresh() {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: RemoteProjectNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    throw new Error('Method not implemented.');
  }

  getChildren(element?: RemoteProjectNode): vscode.ProviderResult<RemoteProjectNode[]> {
    throw new Error('Method not implemented.');
  }

  getParent?(element: RemoteProjectNode): vscode.ProviderResult<RemoteProjectNode> {
    throw new Error('Method not implemented.');
  }

  resolveTreeItem?(item: vscode.TreeItem, element: RemoteProjectNode, token: vscode.CancellationToken): vscode.ProviderResult<vscode.TreeItem> {
    throw new Error('Method not implemented.');
  }

}

export interface RemoteProjectNode {
  workspace?: Workspace
  project?: Project
}
