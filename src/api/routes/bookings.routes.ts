import { Router, Request, Response, NextFunction } from 'express'
import { Container } from '../container'
import { requireAuth } from '../middleware/auth.middleware'
import { BookingId, SeatHoldId, PassengerId } from '../../types/ids'
import { generateId } from '../../utils/id-generator'
import { Passenger } from '../../modules/passenger/passenger.types'

export function bookingRoutes(container: Container): Router {
  const router = Router()
  const auth = requireAuth(container.authService)

  router.post('/', auth, async (req: Request, res: Response, next: NextFunction) => {
    const { offerId, passengers, contactInfo, baggageOptions, promoCode, seatHoldId } = req.body
    try {
      const normalizedPassengers: Passenger[] = (passengers as Passenger[]).map(p => ({
        ...p,
        passengerId: p.passengerId ?? (generateId() as PassengerId),
      }))
      const result = await container.createBooking.execute({
        userId: req.auth.userId,
        offerId,
        passengers: normalizedPassengers,
        contactInfo,
        baggageOptions,
        promoCode,
        seatHoldId: seatHoldId as SeatHoldId | undefined,
      })
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  })

  router.get('/:bookingId', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const details = await container.getBookingDetails.execute({
        bookingId: req.params.bookingId as BookingId,
        requestingUserId: req.auth.userId,
      })
      res.json(details)
    } catch (err) {
      next(err)
    }
  })

  router.delete('/:bookingId', auth, async (req: Request, res: Response, next: NextFunction) => {
    const { reason, seatHoldId } = req.body
    try {
      const cancelled = await container.cancelBooking.execute({
        bookingId: req.params.bookingId as BookingId,
        requestingUserId: req.auth.userId,
        reason,
        seatHoldId: seatHoldId as SeatHoldId | undefined,
      })
      res.json(cancelled)
    } catch (err) {
      next(err)
    }
  })

  router.post('/:bookingId/tickets', auth, async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ticket = await container.ticketingService.issueTicket({
        bookingId: req.params.bookingId as BookingId,
      })
      res.status(201).json(ticket)
    } catch (err) {
      next(err)
    }
  })

  router.post('/:bookingId/payments', auth, async (req: Request, res: Response, next: NextFunction) => {
    const { method, amount } = req.body
    try {
      const session = await container.paymentService.initiatePayment({
        bookingId: req.params.bookingId as BookingId,
        method,
        amount,
      })
      res.status(201).json(session)
    } catch (err) {
      next(err)
    }
  })

  return router
}
