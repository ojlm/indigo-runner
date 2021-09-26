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
      this.init()
      if (e.affectsConfiguration('IndigoRunner.remote')) {
        this.remoteConfigurationUpdateEventEmitter.fire()
      }
    })
    this.init()
  }

  private init() {
    const config = vscode.workspace.getConfiguration(IndigoRunnerConfiguration.ROOT)
    switch (config.get<string>('logLevel', 'info')) {
      case 'error':
        this.logLevel = LogLevel.Error
        break
      case 'warn':
        this.logLevel = LogLevel.Warn
        break
      case 'info':
        this.logLevel = LogLevel.Info
        break
      case 'verbose':
        this.logLevel = LogLevel.Verbose
        break
      default:
        this.logLevel = LogLevel.Info
        break
    }
    this.remoteEnabled = config.get<boolean>('remote.enabled', true)
    this.remoteUrl = config.get<string>('remote.url', 'http://localhost:8080')
    this.remoteTimeout = config.get<number>('remote.timeout', 10000)
  }

}
