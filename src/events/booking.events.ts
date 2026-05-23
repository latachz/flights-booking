import { BookingId, SeatHoldId } from '../types/ids'

export interface BookingCancelledEvent {
  bookingId: BookingId
  seatHoldId?: SeatHoldId
}
