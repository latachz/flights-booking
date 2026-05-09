import { AuthToken, AuthContext } from './auth.types'

export abstract class AuthService {
  abstract login(email: string, password: string): Promise<AuthToken>
  abstract validateAccess(token: string): Promise<AuthContext>
  abstract refreshToken(token: string): Promise<AuthToken>
}
