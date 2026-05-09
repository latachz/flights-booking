import { SeatAvailabilityPolicy } from './SeatAvailabilityPolicy'

export class DefaultSeatAvailabilityPolicy extends SeatAvailabilityPolicy {
  canHoldSeats(availableSeats: number, requestedSeats: number): boolean {
    return requestedSeats > 0 && availableSeats >= requestedSeats
  }
}
