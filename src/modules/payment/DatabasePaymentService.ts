import { PrismaClient } from '@prisma/client'
import { PaymentId } from '../../types/ids'
import { PaymentMethod, PaymentStatus, CurrencyCode } from '../../types/enums'
import { PaymentService } from './PaymentService'
import { InitiatePaymentCommand, Payment, PaymentSession, PaymentProviderResponse } from './payment.types'
import { generateId } from '../../utils/id-generator'

export class DatabasePaymentService extends PaymentService {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  async initiatePayment(command: InitiatePaymentCommand): Promise<PaymentSession> {
    const paymentId = generateId() as PaymentId
    const redirectUrl = `https://pay.example.com/session/${paymentId}`

    await this.prisma.payment.create({
      data: {
        paymentId,
        bookingId: command.bookingId,
        method: command.method,
        amountValue: command.amount.amount,
        amountCurrency: command.amount.currency,
        status: 'PENDING',
        redirectUrl,
      },
    })

    return { paymentId, redirectUrl, status: 'PENDING' }
  }

  async confirmPayment(paymentId: PaymentId, providerResponse: PaymentProviderResponse): Promise<Payment> {
    const existing = await this.prisma.payment.findUnique({ where: { paymentId } })
    if (!existing) {
      throw new Error(`Payment ${paymentId} not found`)
    }

    const statusMap = { SUCCESS: 'AUTHORIZED', FAILURE: 'FAILED', PENDING: 'PENDING' } as const
    const newStatus = statusMap[providerResponse.status]

    const row = await this.prisma.payment.update({
      where: { paymentId },
      data: { status: newStatus },
    })

    return {
      paymentId: row.paymentId as PaymentId,
      bookingId: row.bookingId,
      method: row.method as PaymentMethod,
      amount: { amount: row.amountValue.toNumber(), currency: row.amountCurrency as CurrencyCode },
      status: row.status as PaymentStatus,
      createdAt: row.createdAt.toISOString(),
    }
  }
}
