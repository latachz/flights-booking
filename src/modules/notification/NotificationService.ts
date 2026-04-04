import { BookingId, PaymentId } from '../../types/ids'
import { NotificationResult } from './notification.types'

export abstract class NotificationService {
  abstract sendBookingConfirmation(bookingId: BookingId): Promise<NotificationResult>
  abstract sendPaymentStatusNotification(paymentId: PaymentId): Promise<NotificationResult>
}
