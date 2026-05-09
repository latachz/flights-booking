import { Router, Request, Response, NextFunction } from 'express'
import { AuthService } from '../../modules/auth/AuthService'

export function authRoutes(authService: AuthService): Router {
  const router = Router()

  router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    try {
      const token = await authService.login(email, password)
      res.json(token)
    } catch (err) {
      next(err)
    }
  })

  router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body
    try {
      const token = await authService.refreshToken(refreshToken)
      res.json(token)
    } catch (err) {
      next(err)
    }
  })

  return router
}
