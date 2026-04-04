export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'

export type TripType = 'ONE_WAY' | 'ROUND_TRIP'

export type CurrencyCode = 'PLN' | 'EUR' | 'USD'

export type PaymentMethod = 'CARD' | 'BLIK' | 'BANK_TRANSFER'

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'FAILED' | 'REFUNDED'

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING_PAYMENT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'TICKETED'

export type TicketStatus = 'ISSUED' | 'VOIDED' | 'REFUNDED'

export type PassengerType = 'ADULT' | 'CHILD' | 'INFANT'
