import { OfferId, SeatHoldId } from '../../types/ids'

export interface HoldSeatsCommand {
  offerId: OfferId
  passengerCount: number
}

export interface SeatHold {
  seatHoldId: SeatHoldId
  offerId: OfferId
  heldUntil: string
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED'
}
