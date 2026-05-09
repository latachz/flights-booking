import { UserId, OfferId, SeatHoldId } from '../types/ids'
import { InventoryService } from '../modules/inventory/InventoryService'
import { SeatHold } from '../modules/inventory/inventory.types'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { PriceCalculator } from '../modules/pricing/PriceCalculator'
import { PriceBreakdown, BaggageOption } from '../modules/pricing/pricing.types'
import { Passenger, ContactInfo } from '../modules/passenger/passenger.types'
import { Logger } from '../lib/logger'

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
  private readonly logger = new Logger('CreateBookingUseCase')

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly bookingService: BookingService,
    private readonly priceCalculator: PriceCalculator
  ) {}

  async execute(input: CreateBookingInput): Promise<CreateBookingResult> {
    this.logger.info('Creating booking', { userId: input.userId, offerId: input.offerId })

    let seatHold: SeatHold
    const preExistingHold = !!input.seatHoldId

    if (preExistingHold) {
      seatHold = await this.inventoryService.getSeatHold(input.seatHoldId!)
      this.logger.debug('Using existing seat hold', { seatHoldId: input.seatHoldId })
    } else {
      seatHold = await this.inventoryService.holdSeats({
        offerId: input.offerId,
        passengerCount: input.passengers.length,
      })
      this.logger.debug('Acquired seat hold', { seatHoldId: seatHold.seatHoldId })
    }

    const priceBreakdown = await this.priceCalculator.calculatePrice({
      offerId: input.offerId,
      passengers: input.passengers,
      baggageOptions: input.baggageOptions,
      promoCode: input.promoCode,
    })
    this.logger.debug('Price calculated', { total: priceBreakdown.total })

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
      this.logger.error('Failed to create booking, releasing seat hold', error)
      if (!preExistingHold) {
        await this.inventoryService.releaseSeatHold(seatHold.seatHoldId)
      }
      throw error
    }

    this.logger.info('Booking created', { bookingId: booking.bookingId })
    return { booking, seatHold, priceBreakdown }
  }
}
