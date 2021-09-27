import logger from '../logger'
import { Project } from './model/ide.model'

export function openRemoteProject(project: Project) {
  logger.info(`open: ${project.workspace}/${project.name}`)
}
