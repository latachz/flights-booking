import { PaymentId } from '../../types/ids'
import { InitiatePaymentCommand, Payment, PaymentSession, PaymentProviderResponse } from './payment.types'

export abstract class PaymentService {
  abstract initiatePayment(command: InitiatePaymentCommand): Promise<PaymentSession>
  abstract confirmPayment(paymentId: PaymentId, providerResponse: PaymentProviderResponse): Promise<Payment>
}
