import * as vscode from 'vscode'

import { LogLevel } from './logger'

export class IndigoRunnerConfiguration {

  logLevel: LogLevel
  remoteEnabled: boolean
  remoteUrl: string
  remoteTimeout: number

  public static ROOT = 'IndigoRunner'
  private static _instance: IndigoRunnerConfiguration
  public static get Instance(): IndigoRunnerConfiguration {
    if (!this._instance) {
      this._instance = new IndigoRunnerConfiguration()
    } else {
      return this._instance
    }
  }

  private readonly remoteConfigurationUpdateEventEmitter = new vscode.EventEmitter<void>()
  public get onDidChangeRemoteConfiguration(): vscode.Event<void> {
    return this.remoteConfigurationUpdateEventEmitter.event
  }

  private constructor() {
    vscode.workspace.onDidChangeConfiguration(e => {
      this.update()
      if (e.affectsConfiguration('IndigoRunner.remote')) {
        this.remoteConfigurationUpdateEventEmitter.fire()
      }
    })
    this.update()
  }

  public update() {
    const config = vscode.workspace.getConfiguration(IndigoRunnerConfiguration.ROOT)
    switch (config.get<string>('logLevel', 'info')) {
      case 'error':
        this.logLevel = LogLevel.error
        break
      case 'warn':
        this.logLevel = LogLevel.warn
        break
      case 'info':
        this.logLevel = LogLevel.info
        break
      case 'verbose':
        this.logLevel = LogLevel.verbose
        break
      default:
        this.logLevel = LogLevel.info
        break
    }
    this.remoteEnabled = config.get<boolean>('remote.enabled', true)
    this.remoteUrl = config.get<string>('remote.url', 'http://localhost:8080')
    this.remoteTimeout = config.get<number>('remote.timeout', 10000)
  }

}
