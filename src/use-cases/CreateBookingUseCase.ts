import { UserId, OfferId, SeatHoldId } from '../types/ids'
import { InventoryService } from '../modules/inventory/InventoryService'
import { SeatHold } from '../modules/inventory/inventory.types'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { PriceCalculator } from '../modules/pricing/PriceCalculator'
import { PriceBreakdown, BaggageOption } from '../modules/pricing/pricing.types'
import { Passenger, ContactInfo } from '../modules/passenger/passenger.types'

export interface CreateBookingInput {
  userId: UserId
  offerId: OfferId
  passengers: Passenger[]
  contactInfo: ContactInfo
  baggageOptions?: BaggageOption[]
  promoCode?: string
  seatHoldId?: SeatHoldId
}

export interface CreateBookingResult {
  booking: Booking
  seatHold: SeatHold
  priceBreakdown: PriceBreakdown
}

export class CreateBookingUseCase {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly bookingService: BookingService,
    private readonly priceCalculator: PriceCalculator
  ) {}

  async execute(input: CreateBookingInput): Promise<CreateBookingResult> {
    let seatHold: SeatHold
    const preExistingHold = !!input.seatHoldId

    if (preExistingHold) {
      seatHold = await this.inventoryService.getSeatHold(input.seatHoldId!)
    } else {
      seatHold = await this.inventoryService.holdSeats({
        offerId: input.offerId,
        passengerCount: input.passengers.length,
      })
    }

    const priceBreakdown = await this.priceCalculator.calculatePrice({
      offerId: input.offerId,
      passengers: input.passengers,
      baggageOptions: input.baggageOptions,
      promoCode: input.promoCode,
    })

    let booking: Booking
    try {
      booking = await this.bookingService.createBooking({
        userId: input.userId,
        offerId: input.offerId,
        passengers: input.passengers,
        seatHoldId: seatHold.seatHoldId,
        contactInfo: input.contactInfo,
      })
    } catch (error) {
      if (!preExistingHold) {
        await this.inventoryService.releaseSeatHold(seatHold.seatHoldId)
      }
      throw error
    }

    return { booking, seatHold, priceBreakdown }
  }
}
