import { BookingId, UserId, SeatHoldId } from '../types/ids'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { InventoryService } from '../modules/inventory/InventoryService'
import { NotificationService } from '../modules/notification/NotificationService'

export interface CancelBookingInput {
  bookingId: BookingId
  requestingUserId: UserId
  reason: string
  seatHoldId?: SeatHoldId
}

export class CancelBookingUseCase {
  constructor(
    private readonly bookingService: BookingService,
    private readonly inventoryService: InventoryService,
    private readonly notificationService: NotificationService
  ) {}

  async execute(input: CancelBookingInput): Promise<Booking> {
    const booking = await this.bookingService.getBookingById(input.bookingId)
    if (!booking) {
      throw new Error(`Booking ${input.bookingId} not found`)
    }
    if (booking.userId !== input.requestingUserId) {
      throw new Error('Access denied')
    }
    if (booking.status === 'CANCELLED' || booking.status === 'TICKETED') {
      throw new Error(`Booking cannot be cancelled in status: ${booking.status}`)
    }

    const cancelled = await this.bookingService.cancelBooking({
      bookingId: input.bookingId,
      reason: input.reason,
    })

    if (input.seatHoldId) {
      await this.inventoryService.releaseSeatHold(input.seatHoldId).catch(() => undefined)
    }

    await this.notificationService.sendBookingConfirmation(input.bookingId).catch(() => undefined)

    return cancelled
  }
}
