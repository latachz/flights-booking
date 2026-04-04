export abstract class SeatAvailabilityPolicy {
  abstract canHoldSeats(availableSeats: number, requestedSeats: number): boolean
}
