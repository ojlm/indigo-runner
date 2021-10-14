import * as vscode from 'vscode'

import logger from '../../logger'
import { TreeObject, TreeObjectType } from '../model/ide.model'
import { RemoteExplorer } from '../remote-explorer'

export class RemoteBlobFs implements vscode.FileSystemProvider {

  public static SCHEMA = 'indigo'
  private _onDidChangeTreeData = new vscode.EventEmitter<vscode.FileChangeEvent[]>()
  readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._onDidChangeTreeData.event

  root = new Entry()

  constructor(private remote: RemoteExplorer) {
  }

  watch(uri: vscode.Uri, options: { recursive: boolean; excludes: string[]; }): vscode.Disposable {
    logger.verbose(`watch: ${uri.toString()}`)
    // ignore
    return new vscode.Disposable(() => { })
  }

  stat(uri: vscode.Uri): vscode.FileStat | Thenable<vscode.FileStat> {
    if (uri.path === '/') {
      return this.root
    } else {
      const target = parseUri(uri)
      logger.verbose(`stat: ${uri.toString()}, target: ${JSON.stringify(target)}`)
      return this.remote.fileService.getTree(target.workspace, target.project, target.path).then(res => {
        if (res.data) {
          return new Entry(res.data)
        } else {
          throw vscode.FileSystemError.FileNotFound(uri)
        }
      }).catch(_ => {
        throw vscode.FileSystemError.FileNotFound(uri)
      })
    }
  }

  readDirectory(uri: vscode.Uri): [string, vscode.FileType][] | Thenable<[string, vscode.FileType][]> {
    logger.verbose(`readDirectory: ${uri.toString()}`)
    const target = parseUri(uri)
    return this.remote.fileService.getChildren(target.workspace, target.project, target.path, { size: 10000 })
      .then(res => {
        if (res.data.list) {
          return res.data.list.map(item => [item.name, toVscodeFileType(item)])
        } else {
          return []
        }
      })
  }

  createDirectory(uri: vscode.Uri): void | Thenable<void> {
    logger.verbose(`createDirectory: ${uri.toString()}`)
    const target = parseUri(uri)
    return this.remote.fileService.createDirectory(target.workspace, target.project, target.path).then(res => {
      if (!res.data) {
        if (res.msg === 'tree.name.exists') {
          throw vscode.FileSystemError.FileExists(uri)
        } else if (res.msg === 'tree.doc.miss') {
          throw vscode.FileSystemError.FileNotFound(uri)
        } else {
          throw vscode.FileSystemError.NoPermissions(uri)
        }
      }
    })
  }

  readFile(uri: vscode.Uri): Uint8Array | Thenable<Uint8Array> {
    logger.verbose(`readFile: ${uri.toString()}`)
    const target = parseUri(uri)
    return this.remote.fileService.getBlob(target.workspace, target.project, target.path).then(res => {
      if (res.data) {
        return Buffer.from(res.data.data || '', 'base64')
      } else {
        throw vscode.FileSystemError.FileNotFound(uri)
      }
    })
  }

  writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean; overwrite: boolean; }): void | Thenable<void> {
    logger.verbose(`writeFile: ${uri.toString()}, bytes: ${content.length}, options: ${JSON.stringify(options)}`)
    const target = parseUri(uri)
    return this.remote.fileService.writeFile(target.workspace, target.project, target.path, Buffer.from(content).toString('base64')).then(res => {
      if (!res.data) {
        throw vscode.FileSystemError.FileNotFound(uri)
      }
    })
  }

  dealError(code: string, uri?: vscode.Uri) {
    switch (code) {
      case 'tree.doc.miss':
        throw vscode.FileSystemError.FileNotFound(uri)
      case 'tree.name.exists':
        throw vscode.FileSystemError.FileExists(uri)
      default:
        throw vscode.FileSystemError.NoPermissions(uri)
    }
  }

  delete(uri: vscode.Uri, options: { recursive: boolean; }): void | Thenable<void> {
    logger.verbose(`delete: ${uri.toString()}, options: ${JSON.stringify(options)}`)
    const target = parseUri(uri)
    return this.remote.fileService.delete(target.workspace, target.project, target.path).then(res => {
      if (!res.data) {
        this.dealError(res.msg, uri)
      }
    }).catch(_ => {
      throw vscode.FileSystemError.NoPermissions(uri)
    })
  }

  rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
    logger.verbose(`rename: ${oldUri.toString()} => ${newUri.toString()}, options: ${JSON.stringify(options)}`)
    if (oldUri.authority !== newUri.authority) throw vscode.FileSystemError.NoPermissions(`${oldUri.authority} => ${newUri.authority}`)
    const arr = oldUri.authority.split('.')
    return this.remote.fileService.rename(arr[0], arr[1], { oldPath: oldUri.path.substring(1).split('/'), newPath: newUri.path.substring(1).split('/') }).then(res => {
      if (!res.data) {
        this.dealError(res.msg)
      }
    })
  }

  copy(source: vscode.Uri, destination: vscode.Uri, options: { overwrite: boolean; }): void | Thenable<void> {
    logger.verbose(`copy: ${source.toString()} => ${destination.toString()}, options: ${JSON.stringify(options)}`)
    if (source.authority !== destination.authority) throw vscode.FileSystemError.NoPermissions(`${source.authority} => ${destination.authority}`)
    const arr = source.authority.split('.')
    return this.remote.fileService.copy(arr[0], arr[1], { source: source.path.substring(1).split('/'), destination: destination.path.substring(1).split('/') }).then(res => {
      if (!res.data) {
        this.dealError(res.msg)
      }
    }).catch(_ => {
      throw vscode.FileSystemError.NoPermissions()
    })
  }

}

export function parseUri(uri: vscode.Uri): UriPath {
  const arr = uri.authority.split('.')
  const item: UriPath = {
    workspace: encodeURIComponent(arr[0]),
    project: encodeURIComponent(arr[1]),
    path: uri.path.split('/').map(item => encodeURIComponent(item)).join('/'),
  }
  return item
}

export function toVscodeFileType(item: TreeObject): vscode.FileType {
  switch (item.type) {
    case TreeObjectType.NONE:
      return vscode.FileType.Unknown
    case TreeObjectType.DIRECTORY:
    case TreeObjectType.DIRECTORY_LINK:
      return vscode.FileType.Directory
    case TreeObjectType.FILE:
    case TreeObjectType.FILE_LINK:
      return vscode.FileType.File
    default:
      return vscode.FileType.Unknown
  }
}

export interface UriPath {
  workspace: string
  project: string
  path: string
}

export class Entry implements vscode.FileStat {

  type: vscode.FileType
  ctime: number
  mtime: number
  size: number

  constructor(tree?: TreeObject) {
    if (tree) {
      this.type = toVscodeFileType(tree)
      this.ctime = tree.createdAt
      this.mtime = tree.updatedAt
    } else {
      this.type = vscode.FileType.Directory
      this.ctime = Date.now()
      this.mtime = Date.now()
      this.size = 0
    }
  }

}
