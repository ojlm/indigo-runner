import { OutputChannel, window } from 'vscode'

import { IndigoRunnerConfiguration } from './configuration'

export enum LogLevel {
  VERBOSE,
  INFO,
  WARN,
  ERROR,
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
    this.log(LogLevel.VERBOSE, message, data)
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data)
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data)
  }

  public error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data)
  }

  public log(level: LogLevel, message: string, data?: any): void {
    if (level >= IndigoRunnerConfiguration.Instance.logLevel) {
      this.outputChannel.appendLine(`[${LogLevel[level]} - ${(new Date().toLocaleTimeString())}] ${message}`)
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
