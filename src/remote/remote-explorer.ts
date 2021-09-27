import * as vscode from 'vscode'

import { RunnerCommands } from '../commaon/constants'
import { IndigoRunnerConfiguration } from '../configuration'
import { HttpClient } from '../utils/http-client'
import { ProjectService } from './api/project.service'
import { WorkspaceService } from './api/workspace.service'
import * as commands from './commands'
import { Project } from './model/ide.model'
import { RemoteProjectProvider } from './providers/remote-project.provider'

export class RemoteExplorer {

  configuration = IndigoRunnerConfiguration.Instance
  http: HttpClient = new HttpClient()

  workspaceService = new WorkspaceService(this.http)
  projectService = new ProjectService(this.http)

  constructor(context: vscode.ExtensionContext) {
    // init
    const remoteProjectProvider = new RemoteProjectProvider(this)
    this.http.onDidChangeClient(() => remoteProjectProvider.reresh())

    // commands
    context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.remote.refresh, () => remoteProjectProvider.reresh()))
    context.subscriptions.push(vscode.commands.registerCommand(RunnerCommands.remote.open, (project: Project) => commands.openRemoteProject(project)))

    // providers
    context.subscriptions.push(vscode.window.registerTreeDataProvider('indigo-remote', remoteProjectProvider))
  }

}
