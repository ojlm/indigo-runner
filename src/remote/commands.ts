import * as vscode from 'vscode'

import logger from '../logger'
import { Project } from './model/ide.model'
import { RemoteBlobFs } from './providers/remote-blob-fs.provider'

export function openRemoteProject(project: Project) {
  const uri = vscode.Uri.parse(`${RemoteBlobFs.SCHEMA}://${project.workspace}.${project.name}/`)
  logger.info(`open: ${uri.toString()}`)
  const folders = vscode.workspace.workspaceFolders
  if (folders) {
    const target = folders.find(item => item.uri.scheme === RemoteBlobFs.SCHEMA && item.uri.authority === `${project.workspace}.${project.name}`)
    if (!target) {
      vscode.workspace.updateWorkspaceFolders(folders.length, 0, { uri: uri, name: `${project.alias || project.name}` })
    }
  } else {
    vscode.workspace.updateWorkspaceFolders(0, 0, { uri: uri, name: `${project.alias || project.name}` })
  }
  vscode.commands.executeCommand('revealInExplorer', uri)
}
