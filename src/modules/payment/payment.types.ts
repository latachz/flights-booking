import { BookingId, PaymentId } from '../../types/ids'
import { PaymentMethod, PaymentStatus } from '../../types/enums'
import { Money } from '../../types/common'

export interface InitiatePaymentCommand {
  bookingId: BookingId
  method: PaymentMethod
  amount: Money
}

export interface Payment {
  paymentId: PaymentId
  bookingId: BookingId
  method: PaymentMethod
  amount: Money
  status: PaymentStatus
  createdAt: string
}

export interface PaymentSession {
  paymentId: PaymentId
  redirectUrl?: string
  status: PaymentStatus
}

export interface PaymentProviderResponse {
  externalTransactionId: string
  status: 'SUCCESS' | 'FAILURE' | 'PENDING'
  processedAt: string
}
