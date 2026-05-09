import { Router, Request, Response, NextFunction } from 'express'
import { Container } from '../container'
import { OfferId } from '../../types/ids'
import { CabinClass, TripType } from '../../types/enums'

export function flightRoutes(container: Container): Router {
  const router = Router()

  router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
    const { origin, destination, date, tripType, cabinClass, adults, children, infants } = req.query
    try {
      const offers = await container.searchFlights.execute({
        origin: { code: origin as string },
        destination: { code: destination as string },
        dateRange: { departureDate: date as string },
        tripType: (tripType as TripType) ?? 'ONE_WAY',
        cabinClass: (cabinClass as CabinClass) ?? 'ECONOMY',
        passengers: {
          adults: Number(adults ?? 1),
          children: Number(children ?? 0),
          infants: Number(infants ?? 0),
        },
      })
      res.json(offers)
    } catch (err) {
      next(err)
    }
  })

  router.get('/:offerId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const details = await container.searchService.getFlightOfferDetails(req.params.offerId as OfferId)
      res.json(details)
    } catch (err) {
      next(err)
    }
  })

  return router
}
