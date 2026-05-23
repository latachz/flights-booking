import { BookingId, PaymentId } from '../../types/ids'
import { NotificationService } from './NotificationService'
import { NotificationResult } from './notification.types'
import { Logger } from '../../lib/logger'

export class RetryNotificationDecorator extends NotificationService {
  private readonly logger = new Logger('RetryNotificationDecorator')

  constructor(
    private readonly inner: NotificationService,
    private readonly maxAttempts: number = 3,
    private readonly baseDelayMs: number = 100,
    private readonly maxDelayMs: number = 1000,
  ) {
    super()
  }

  async sendBookingConfirmation(bookingId: BookingId): Promise<NotificationResult> {
    return this.withRetry(() => this.inner.sendBookingConfirmation(bookingId))
  }

  async sendPaymentStatusNotification(paymentId: PaymentId): Promise<NotificationResult> {
    return this.withRetry(() => this.inner.sendPaymentStatusNotification(paymentId))
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: unknown
    for (let attempt = 0; attempt < this.maxAttempts; attempt++) {
      try {
        return await operation()
      } catch (err) {
        lastError = err
        if (attempt < this.maxAttempts - 1) {
          const delay = Math.min(this.baseDelayMs * Math.pow(2, attempt), this.maxDelayMs)
          this.logger.warn(`Notification attempt ${attempt + 1} failed, retrying in ${delay}ms`, err)
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }
    }
    this.logger.error(`Notification failed after ${this.maxAttempts} attempts`, lastError)
    throw lastError
  }
}
