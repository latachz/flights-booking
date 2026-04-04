import { OfferId } from '../../types/ids'
import { Money } from '../../types/common'
import { Passenger } from '../passenger/passenger.types'

export interface FareRules {
  refundable: boolean
  changeable: boolean
  cancellationFee?: Money
  changeFee?: Money
}

export interface BaggageOption {
  baggageType: 'CABIN' | 'CHECKED'
  quantity: number
  price: Money
}

export interface PriceBreakdown {
  baseFare: Money
  taxes: Money
  serviceFee: Money
  baggageFee?: Money
  discount?: Money
  total: Money
}

export interface PriceCalculationCommand {
  offerId: OfferId
  passengers: Passenger[]
  baggageOptions?: BaggageOption[]
  promoCode?: string
}
