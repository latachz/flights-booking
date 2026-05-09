import { SearchService } from '../modules/flight-search/SearchService'
import { FlightSearchCriteria, FlightOffer } from '../modules/flight-search/flight-search.types'

export class SearchFlightsUseCase {
  constructor(private readonly searchService: SearchService) {}

  async execute(criteria: FlightSearchCriteria): Promise<FlightOffer[]> {
    return this.searchService.searchFlights(criteria)
  }
}
