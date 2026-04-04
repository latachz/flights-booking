import { BookingId, PassengerId } from '../../types/ids'
import { Passenger, UpdatePassengerData } from './passenger.types'
import { Booking } from '../booking/booking.types'

export abstract class PassengerService {
  abstract addPassengers(bookingId: BookingId, passengers: Passenger[]): Promise<Booking>
  abstract updatePassenger(passengerId: PassengerId, data: UpdatePassengerData): Promise<Passenger>
}
