import { OutputChannel, window } from 'vscode'

import { IndigoRunnerConfiguration } from './configuration'

export enum LogLevel {
  verbose,
  info,
  warn,
  error,
}

class Logger {

  private readonly outputChannel: OutputChannel

  public constructor() {
    this.outputChannel = window.createOutputChannel('Indigo')
  }

  public show() {
    this.outputChannel.show()
  }

  public dispose() {
    this.outputChannel.dispose()
  }

  public verbose(message: string, data?: any): void {
    this.log(LogLevel.verbose, message, data)
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.info, message, data)
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.warn, message, data)
  }

  public error(message: string, data?: any): void {
    this.log(LogLevel.error, message, data)
  }

  public log(level: LogLevel, message: string, data?: any): void {
    if (level >= IndigoRunnerConfiguration.Instance.logLevel) {
      this.outputChannel.appendLine(`[${(new Date().toISOString())}] [${LogLevel[level]}] ${message}`)
      if (data) {
        this.outputChannel.appendLine(this.data2String(data))
      }
    }
  }

  private data2String(data: any): string {
    if (data instanceof Error) {
      return data.stack || data.message
    }
    if (typeof data === 'string') {
      return data
    }
    return JSON.stringify(data, null, 2)
  }

}

const logger = new Logger()
export default logger
