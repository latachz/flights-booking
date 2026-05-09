import { PrismaClient } from '@prisma/client'
import { UserId } from '../../types/ids'
import { AuthService } from './AuthService'
import { AuthToken, AuthContext } from './auth.types'
import { generateId } from '../../utils/id-generator'
import { UnauthorizedError } from '../../lib/errors'

export class DatabaseAuthService extends AuthService {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  async login(email: string, password: string): Promise<AuthToken> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user || user.password !== password) {
      throw new UnauthorizedError('Invalid credentials')
    }

    const accessToken = generateId()
    const refreshToken = generateId()
    const expiresAt = new Date(Date.now() + 3_600_000)

    await this.prisma.authToken.create({
      data: {
        accessToken,
        refreshToken,
        userId: user.userId,
        roles: user.roles,
        expiresAt,
      },
    })

    return { accessToken, refreshToken, expiresAt: expiresAt.toISOString() }
  }

  async refreshToken(token: string): Promise<AuthToken> {
    const entry = await this.prisma.authToken.findFirst({ where: { refreshToken: token } })
    if (!entry) {
      throw new UnauthorizedError('Invalid token')
    }
    if (new Date() > entry.expiresAt) {
      await this.prisma.authToken.delete({ where: { accessToken: entry.accessToken } })
      throw new UnauthorizedError('Token expired')
    }

    const accessToken = generateId()
    const refreshToken = generateId()
    const expiresAt = new Date(Date.now() + 3_600_000)

    await this.prisma.authToken.update({
      where: { accessToken: entry.accessToken },
      data: { accessToken, refreshToken, expiresAt },
    })

    return { accessToken, refreshToken, expiresAt: expiresAt.toISOString() }
  }

  async validateAccess(token: string): Promise<AuthContext> {
    const entry = await this.prisma.authToken.findUnique({ where: { accessToken: token } })
    if (!entry) {
      throw new UnauthorizedError('Invalid token')
    }
    if (new Date() > entry.expiresAt) {
      await this.prisma.authToken.delete({ where: { accessToken: token } })
      throw new UnauthorizedError('Token expired')
    }
    return { userId: entry.userId as UserId, roles: entry.roles }
  }
}
