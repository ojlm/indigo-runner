import { HttpClient } from '../../utils/http-client'
import { ApiRes } from '../model/api.model'
import { Project } from '../model/ide.model'
import { BaseService } from './base.service'

export class ProjectService extends BaseService {

  constructor(private http: HttpClient) { super() }

  getProject(workspace: string, project: string) {
    return this.http.get<ApiRes<Project>>(`${this.API_BASE}/project/${workspace}/${project}`)
  }

  create(item: Project) {
    return this.http.put<ApiRes<string>>(`${this.API_BASE}/project`, item)
  }

  search(workspace: string, params: QueryProject = {}) {
    return this.http.post<ApiRes<Project[]>>(`${this.API_BASE}/project/${workspace}/search`, params)
  }

}

export interface QueryProject {
  workspace?: string
}
