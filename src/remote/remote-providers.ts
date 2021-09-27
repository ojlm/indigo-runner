import * as vscode from 'vscode'

import { IndigoRunnerConfiguration } from '../configuration'
import { HttpClient } from '../utils/http-client'
import { ProjectService } from './api/project.service'
import { WorkspaceService } from './api/workspace.service'

export class RemoteProviders {

  configuration = IndigoRunnerConfiguration.Instance
  http: HttpClient = new HttpClient()

  workspaceService = new WorkspaceService(this.http)
  projectService = new ProjectService(this.http)

  constructor(context: vscode.ExtensionContext) {
  }

}
