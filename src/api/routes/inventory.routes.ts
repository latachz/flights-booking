import { Router, Request, Response, NextFunction } from 'express'
import { Container } from '../container'
import { requireAuth } from '../middleware/auth.middleware'
import { OfferId, SeatHoldId } from '../../types/ids'

export function inventoryRoutes(container: Container): Router {
  const router = Router()
  const auth = requireAuth(container.authService)

  router.post('/hold', auth, async (req: Request, res: Response, next: NextFunction) => {
    const { offerId, passengerCount } = req.body
    try {
      const hold = await container.inventoryService.holdSeats({
        offerId: offerId as OfferId,
        passengerCount: Number(passengerCount),
      })
      res.status(201).json(hold)
    } catch (err) {
      next(err)
    }
  })

  router.delete('/hold/:holdId', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      await container.inventoryService.releaseSeatHold(req.params.holdId as SeatHoldId)
      res.status(204).send()
    } catch (err) {
      next(err)
    }
  })

  return router
}
