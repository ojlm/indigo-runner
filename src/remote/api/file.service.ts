import { HttpClient } from '../../utils/http-client'
import { ApiRes, QueryPage } from '../model/api.model'
import { BlobObject, TreeObject } from '../model/ide.model'
import { BaseService } from './base.service'

export class FileService extends BaseService {

  constructor(private http: HttpClient) { super() }

  getTree(workspace: string, project: string, path: string) {
    return this.http.get<ApiRes<TreeObject>>(`${this.API_BASE}/file/${workspace}/${project}/tree${path}`)
  }

  getBlob(workspace: string, project: string, path: string) {
    return this.http.get<ApiRes<BlobObject>>(`${this.API_BASE}/file/${workspace}/${project}/blob${path}`)
  }

  getChildren(workspace: string, project: string, path: string, params: QueryTree = {}) {
    return this.http.post<ApiRes<TreeObject[]>>(`${this.API_BASE}/file/${workspace}/${project}/children${path}`, params)
  }

  createDirectory(workspace: string, project: string, path: string) {
    return this.http.put<ApiRes<string>>(`${this.API_BASE}/file/${workspace}/${project}/directory${path}`, null)
  }

  writeFile(workspace: string, project: string, path: string, data: string) {
    return this.http.put<ApiRes<string>>(`${this.API_BASE}/file/${workspace}/${project}/file${path}`, { data: data })
  }

  rename(workspace: string, project: string, params: RenameFileRequest) {
    return this.http.post<ApiRes<string>>(`${this.API_BASE}/file/${workspace}/${project}/rename`, params)
  }

  copy(workspace: string, project: string, params: CopyFileRequest) {
    return this.http.post<ApiRes<string>>(`${this.API_BASE}/file/${workspace}/${project}/copy`, params)
  }

  delete(workspace: string, project: string, path: string) {
    return this.http.post<ApiRes<string>>(`${this.API_BASE}/file/${workspace}/${project}/delete${path}`, null)
  }

}

export interface QueryTree extends QueryPage {
  workspace?: string
  project?: string
  name?: string
}

export interface RenameFileRequest {
  oldPath?: string[]
  newPath?: string[]
}

export interface CopyFileRequest {
  source?: string[]
  destination?: string[]
}
