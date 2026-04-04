import { OfferId, FlightId } from '../../types/ids'
import { CabinClass, TripType } from '../../types/enums'
import { Money, AirportCode, DateRange } from '../../types/common'
import { FareRules, BaggageOption } from '../pricing/pricing.types'

export interface PassengerCount {
  adults: number
  children: number
  infants: number
}

export interface FlightSearchCriteria {
  origin: AirportCode
  destination: AirportCode
  dateRange: DateRange
  tripType: TripType
  cabinClass: CabinClass
  passengers: PassengerCount
}

export interface FlightSegment {
  segmentId: string
  carrierCode: string
  flightNumber: string
  origin: AirportCode
  destination: AirportCode
  departureTime: string
  arrivalTime: string
}

export interface FlightOffer {
  offerId: OfferId
  flightId: FlightId
  segments: FlightSegment[]
  availableSeats: number
  basePrice: Money
  totalPrice: Money
  cabinClass: CabinClass
}

export interface FlightOfferDetails extends FlightOffer {
  fareRules: FareRules
  baggageOptions: BaggageOption[]
}
