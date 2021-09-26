import { Memento } from 'vscode'

export class LocalStorage {

  public static instance: LocalStorage

  private constructor(private storage: Memento) {
  }

  public static initialize(storage: Memento) {
    this.instance = new LocalStorage(storage)
  }

  public getValue<T>(key: string): T {
    return this.storage.get<T>(key, null)
  }

  public setValue<T>(key: string, value: T) {
    this.storage.update(key, value)
  }

  public removeKey(key: string) {
    this.storage.update(key, undefined)
  }

}
