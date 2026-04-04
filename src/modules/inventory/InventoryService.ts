import { SeatHoldId } from '../../types/ids'
import { HoldSeatsCommand, SeatHold } from './inventory.types'

export abstract class InventoryService {
  abstract holdSeats(command: HoldSeatsCommand): Promise<SeatHold>
  abstract releaseSeatHold(seatHoldId: SeatHoldId): Promise<void>
}
