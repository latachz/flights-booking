import { UserId } from '../../types/ids'

export interface AuthToken {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export interface AuthContext {
  userId: UserId
  roles: string[]
}
