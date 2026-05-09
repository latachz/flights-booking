import { PrismaClient } from '@prisma/client'
import { OfferId, FlightId } from '../../types/ids'
import { CabinClass, CurrencyCode } from '../../types/enums'
import { SearchService } from './SearchService'
import { FlightSearchCriteria, FlightOffer, FlightOfferDetails, FlightSegment } from './flight-search.types'
import { FareRules, BaggageOption } from '../pricing/pricing.types'
import { NotFoundError } from '../../lib/errors'

export class DatabaseSearchService extends SearchService {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  async searchFlights(criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
    const rows = await this.prisma.flightOffer.findMany({
      include: { inventory: true },
    })

    const totalPassengers = criteria.passengers.adults + criteria.passengers.children + criteria.passengers.infants
    const results: FlightOffer[] = []

    for (const row of rows) {
      const segments = row.segments as unknown as FlightSegment[]
      const firstSegment = segments[0]
      const lastSegment = segments[segments.length - 1]
      const availableSeats = row.inventory?.availableSeats ?? row.availableSeats

      if (
        firstSegment.origin.code === criteria.origin.code &&
        lastSegment.destination.code === criteria.destination.code &&
        row.cabinClass === criteria.cabinClass &&
        firstSegment.departureTime.startsWith(criteria.dateRange.departureDate) &&
        availableSeats >= totalPassengers
      ) {
        results.push({
          offerId: row.offerId as OfferId,
          flightId: row.flightId as FlightId,
          segments,
          availableSeats,
          cabinClass: row.cabinClass as CabinClass,
          basePrice: { amount: row.basePriceAmount.toNumber(), currency: row.basePriceCurrency as CurrencyCode },
          totalPrice: { amount: row.totalPriceAmount.toNumber(), currency: row.totalPriceCurrency as CurrencyCode },
        })
      }
    }

    return results
  }

  async getFlightOfferDetails(offerId: OfferId): Promise<FlightOfferDetails> {
    const row = await this.prisma.flightOffer.findUnique({ where: { offerId } })
    if (!row) {
      throw new NotFoundError(`Offer ${offerId} not found`)
    }
    return {
      offerId: row.offerId as OfferId,
      flightId: row.flightId as FlightId,
      segments: row.segments as unknown as FlightSegment[],
      availableSeats: row.availableSeats,
      cabinClass: row.cabinClass as CabinClass,
      basePrice: { amount: row.basePriceAmount.toNumber(), currency: row.basePriceCurrency as CurrencyCode },
      totalPrice: { amount: row.totalPriceAmount.toNumber(), currency: row.totalPriceCurrency as CurrencyCode },
      fareRules: row.fareRules as unknown as FareRules,
      baggageOptions: row.baggageOptions as unknown as BaggageOption[],
    }
  }
}
