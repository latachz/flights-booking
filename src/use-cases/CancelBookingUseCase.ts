import { BookingId, UserId, SeatHoldId } from '../types/ids'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { InventoryService } from '../modules/inventory/InventoryService'
import { NotificationService } from '../modules/notification/NotificationService'
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
    private readonly inventoryService: InventoryService,
    private readonly notificationService: NotificationService
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

    this.logger.info('Booking cancelled', { bookingId: input.bookingId })

    if (input.seatHoldId) {
      await this.inventoryService.releaseSeatHold(input.seatHoldId).catch((err) => {
        this.logger.warn('Failed to release seat hold', err)
      })
    }

    await this.notificationService.sendBookingConfirmation(input.bookingId).catch((err) => {
      this.logger.warn('Failed to send cancellation notification', err)
    })

    return cancelled
  }
}
