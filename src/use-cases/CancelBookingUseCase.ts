import { BookingId, UserId, SeatHoldId } from '../types/ids'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { BookingEventBus } from '../events/BookingEventBus'
import { BOOKING_CANCELLED } from '../events/eventTypes'
import { BookingCancelledEvent } from '../events/booking.events'
import { NotFoundError, ForbiddenError, DomainError } from '../lib/errors'
import { Logger } from '../lib/logger'

export interface CancelBookingInput {
  bookingId: BookingId
  requestingUserId: UserId
  reason: string
  seatHoldId?: SeatHoldId
}

export class CancelBookingUseCase {
  private readonly logger = new Logger('CancelBookingUseCase')

  constructor(
    private readonly bookingService: BookingService,
    private readonly eventBus: BookingEventBus
  ) {}

  async execute(input: CancelBookingInput): Promise<Booking> {
    this.logger.info('Cancelling booking', { bookingId: input.bookingId })

    const booking = await this.bookingService.getBookingById(input.bookingId)
    if (!booking) {
      throw new NotFoundError(`Booking ${input.bookingId} not found`)
    }
    if (booking.userId !== input.requestingUserId) {
      throw new ForbiddenError('Access denied')
    }
    if (booking.status === 'CANCELLED' || booking.status === 'TICKETED') {
      throw new DomainError(`Booking cannot be cancelled in status: ${booking.status}`)
    }

    const cancelled = await this.bookingService.cancelBooking({
      bookingId: input.bookingId,
      reason: input.reason,
    })

    this.logger.info('Booking cancelled, emitting event', { bookingId: input.bookingId })

    const event: BookingCancelledEvent = {
      bookingId: input.bookingId,
      seatHoldId: input.seatHoldId,
    }
    await this.eventBus.emit(BOOKING_CANCELLED, event)

    return cancelled
  }
}
