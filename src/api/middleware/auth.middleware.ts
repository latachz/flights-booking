import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../../modules/auth/AuthService'
import { AuthContext } from '../../modules/auth/auth.types'

declare global {
  namespace Express {
    interface Request {
      auth: AuthContext
    }
  }
}

export function requireAuth(authService: AuthService) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Missing or malformed Authorization header' })
      return
    }
    const token = header.slice(7)
    try {
      req.auth = await authService.validateAccess(token)
      next()
    } catch (err) {
      next(err)
    }
  }
}
