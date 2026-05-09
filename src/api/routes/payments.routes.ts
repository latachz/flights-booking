import { Router, Request, Response, NextFunction } from 'express'
import { Container } from '../container'
import { requireAuth } from '../middleware/auth.middleware'
import { PaymentId } from '../../types/ids'

export function paymentRoutes(container: Container): Router {
  const router = Router()
  const auth = requireAuth(container.authService)

  router.post('/:paymentId/confirm', auth, async (req: Request, res: Response, next: NextFunction) => {
    const { externalTransactionId, status, processedAt } = req.body
    try {
      const payment = await container.paymentService.confirmPayment(
        req.params.paymentId as PaymentId,
        { externalTransactionId, status, processedAt }
      )
      res.json(payment)
    } catch (err) {
      next(err)
    }
  })

  return router
}
