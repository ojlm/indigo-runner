export interface AbsDoc {
  creator?: string
  createdAt?: number
  updatedAt?: number
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

export interface Project extends AbsDoc {
  workspace?: string
  name?: string
  alias?: string
  avatar?: string
  description?: string
}
