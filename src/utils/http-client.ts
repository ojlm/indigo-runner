import axios = require('axios')
import * as vscode from 'vscode'

import { IndigoRunnerConfiguration } from '../configuration'
import logger from '../logger'

export class HttpClient {

  private config = IndigoRunnerConfiguration.Instance
  private instance: axios.AxiosInstance

  private readonly clientUpdateEventEmitter = new vscode.EventEmitter<void>()
  public get onDidChangeClient(): vscode.Event<void> {
    return this.clientUpdateEventEmitter.event
  }

  constructor() {
    this.init()
    IndigoRunnerConfiguration.Instance.onDidChangeRemoteConfiguration(_ => {
      this.init()
      this.clientUpdateEventEmitter.fire()
    })
  }

  init() {
    this.instance = axios.default.create({
      baseURL: this.config.remoteUrl,
      timeout: this.config.remoteTimeout,
    })
  }

  log(url: string, res: axios.AxiosResponse<any>) {
    logger.verbose(`url: ${url}`, res.data)
  }

  get<T = any>(url: string, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.get<T, axios.AxiosResponse<T>>(url, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  delete<T = any>(url: string, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.delete<T, axios.AxiosResponse<T>>(url, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  head<T = any>(url: string, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.head<T, axios.AxiosResponse<T>>(url, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  options<T = any>(url: string, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.options<T, axios.AxiosResponse<T>>(url, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  post<T = any>(url: string, data?: any, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.post<T, axios.AxiosResponse<T>>(url, data, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  put<T = any>(url: string, data?: any, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.put<T, axios.AxiosResponse<T>>(url, data, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

  patch<T = any>(url: string, data?: any, config?: axios.AxiosRequestConfig): Promise<T> {
    return new Promise<T>((reslove, reject) => {
      this.instance.patch<T, axios.AxiosResponse<T>>(url, data, config).then(res => {
        this.log(url, res)
        reslove(res.data)
      }).catch(err => reject(err))
    })
  }

}
