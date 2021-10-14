export interface AbsDoc {
  id?: string
  creator?: string
  createdAt?: number
  updatedAt?: number
}
export interface Activity extends AbsDoc {
  workspace?: string
  op?: number
  project?: string
  target?: string
}
export interface BlobObject extends AbsDoc {
  workspace?: string
  project?: string
  tree?: string
  data?: string // base64 bytes
  size?: number
}
export interface Project extends AbsDoc {
  workspace?: string
  name?: string
  alias?: string
  avatar?: string
  description?: string
}
export interface TreeObject extends AbsDoc {
  workspace?: string
  project?: string
  name?: string
  blob?: string
  extension?: string
  parent?: string
  size?: number
  type?: number
}
export const TreeObjectType = {
  NONE: -1,
  DIRECTORY: 0,
  DIRECTORY_LINK: 1,
  FILE: 2,
  FILE_LINK: 3,
}
export interface UserPreference extends AbsDoc {
  username?: string
  alias?: string
  email?: string
  avatar?: string
  description?: string
  latest?: {
    workspace?: string
  }
}
export interface Workspace extends AbsDoc {
  name?: string
  alias?: string
  avatar?: string
  description?: string
}
