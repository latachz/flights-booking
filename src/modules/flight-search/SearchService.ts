import { OfferId } from '../../types/ids'
import { FlightSearchCriteria, FlightOffer, FlightOfferDetails } from './flight-search.types'

export abstract class SearchService {
  abstract searchFlights(criteria: FlightSearchCriteria): Promise<FlightOffer[]>
  abstract getFlightOfferDetails(offerId: OfferId): Promise<FlightOfferDetails>
}
