import { PrismaClient } from '@prisma/client'
import { BookingId, PaymentId } from '../../types/ids'
import { NotificationService } from './NotificationService'
import { NotificationResult } from './notification.types'
import { generateId } from '../../utils/id-generator'

export class DatabaseNotificationService extends NotificationService {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  async sendBookingConfirmation(bookingId: BookingId): Promise<NotificationResult> {
    const notificationId = generateId()
    await this.prisma.notificationLog.create({
      data: { notificationId, bookingId, channel: 'EMAIL', status: 'SENT' },
    })
    return { notificationId, channel: 'EMAIL', status: 'SENT' }
  }

  async sendPaymentStatusNotification(paymentId: PaymentId): Promise<NotificationResult> {
    const notificationId = generateId()
    await this.prisma.notificationLog.create({
      data: { notificationId, paymentId, channel: 'EMAIL', status: 'SENT' },
    })
    return { notificationId, channel: 'EMAIL', status: 'SENT' }
  }
}
