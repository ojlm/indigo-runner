export interface ApiReq {
  path?: string
  body?: Object
  extra?: Object
}

export interface DataBody<T> {
  total?: number
  list?: T
}

export interface ApiRes<T> {
  code: string
  msg: string
  data?: T & DataBody<T>
}

export interface ApiResObj {
  code: string
  msg: string
  data?: Object
}

export interface SelectOption {
  label: string
  value: string
  desc: string
  disabled: boolean
}

export const APICODE = {
  DEFAULT: '00000',
  OK: '10000',
  INVALID: '20000',
  ERROR: '90000',
  NOT_LOGIN: '90001',
  PERMISSION_DENIED: '90002',
}

export class ActorEvent<T> {
  code?: string
  msg?: string
  data?: T & DataBody<T>
  type?: string = 'init' || 'list' || 'item' || 'over' || 'notify' ||
    'command.start' || 'command.log' || 'driver.status' || 'driver.log'
}

export const ActorEventType = {
  INIT: 'init',
  LIST: 'list',
  ITEM: 'item',
  OVER: 'over',
  NOTIFY: 'notify',
  ERROR: 'error',
}

export interface QueryPage {
  from?: number
  size?: number
}
