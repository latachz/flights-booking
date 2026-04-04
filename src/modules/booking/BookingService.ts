import { BookingId } from '../../types/ids'
import { Booking, CreateBookingCommand, CancelBookingCommand } from './booking.types'

export abstract class BookingService {
  abstract createBooking(command: CreateBookingCommand): Promise<Booking>
  abstract getBookingById(bookingId: BookingId): Promise<Booking | null>
  abstract cancelBooking(command: CancelBookingCommand): Promise<Booking>
}
