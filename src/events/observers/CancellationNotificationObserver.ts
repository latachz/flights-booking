import { NotificationService } from '../../modules/notification/NotificationService'
import { BookingCancelledEvent } from '../booking.events'
import { Logger } from '../../lib/logger'

export class CancellationNotificationObserver {
  private readonly logger = new Logger('CancellationNotificationObserver')

  constructor(private readonly notificationService: NotificationService) {}

  async handle(event: BookingCancelledEvent): Promise<void> {
    this.logger.info('Sending cancellation notification', { bookingId: event.bookingId })
    await this.notificationService.sendBookingConfirmation(event.bookingId)
  }
}
