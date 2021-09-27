import * as vscode from 'vscode'

import { RunnerCommands } from '../../commaon/constants'
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
    if (element.workspace) {
      return {
        label: element.workspace.alias || element.workspace.name,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
      } as vscode.TreeItem
    } else {
      return {
        command: {
          command: RunnerCommands.remote.open,
          arguments: [element.project],
        },
        label: element.project.alias || element.project.name,
        collapsibleState: vscode.TreeItemCollapsibleState.None,
      } as vscode.TreeItem
    }
  }

  getChildren(element?: RemoteProjectNode): vscode.ProviderResult<RemoteProjectNode[]> {
    if (element && element.workspace) {
      return this.remote.projectService.search(element.workspace.name).then(res => {
        return res.data.list.map(item => ({ project: item } as RemoteProjectNode))
      })
    } else {
      return this.remote.workspaceService.getWorkspaces().then(res => {
        return res.data.list.map(item => ({ workspace: item } as RemoteProjectNode))
      })
    }
  }

  getParent(element: RemoteProjectNode): vscode.ProviderResult<RemoteProjectNode> {
    if (element.project) {
      return this.remote.workspaceService.getById(element.project.workspace).then(res => ({ workspace: res.data } as RemoteProjectNode))
    } else {
      return null
    }
  }

}

export interface RemoteProjectNode {
  workspace?: Workspace
  project?: Project
}
