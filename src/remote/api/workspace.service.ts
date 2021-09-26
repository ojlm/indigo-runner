import { HttpClient } from '../../utils/http-client'
import { ApiRes } from '../model/api.model'
import { Workspace } from '../model/ide.model'
import { BaseService } from './base.service'


export class WorkspaceService extends BaseService {

  constructor(private http: HttpClient) { super() }

  getWorkspaces(params: QueryWorkspace = {}) {
    return this.http.post<ApiRes<Workspace[]>>(`${this.API_BASE}/workspace`, params)
  }

  getById(id: string) {
    return this.http.get<ApiRes<Workspace>>(`${this.API_BASE}/workspace/${id}`)
  }

  create(item: Workspace) {
    return this.http.put<ApiRes<string>>(`${this.API_BASE}/workspace`, item)
  }

}

export interface QueryWorkspace {
  creator?: string
}
