import { BookingId, UserId, OfferId, SeatHoldId } from '../../types/ids'
import { BookingStatus } from '../../types/enums'
import { Money } from '../../types/common'
import { Passenger, ContactInfo } from '../passenger/passenger.types'

export interface Booking {
  bookingId: BookingId
  userId: UserId
  offerId: OfferId
  status: BookingStatus
  passengers: Passenger[]
  totalPrice: Money
  createdAt: string
  expiresAt?: string
}

export interface CreateBookingCommand {
  userId: UserId
  offerId: OfferId
  passengers: Passenger[]
  seatHoldId: SeatHoldId
  contactInfo: ContactInfo
}

export interface CancelBookingCommand {
  bookingId: BookingId
  reason: string
}

export type BookingWithContact = Booking & {
  contactInfo: ContactInfo
}
