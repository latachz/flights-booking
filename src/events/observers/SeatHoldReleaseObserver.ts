import { InventoryService } from '../../modules/inventory/InventoryService'
import { BookingCancelledEvent } from '../booking.events'
import { Logger } from '../../lib/logger'

export class SeatHoldReleaseObserver {
  private readonly logger = new Logger('SeatHoldReleaseObserver')

  constructor(private readonly inventoryService: InventoryService) {}

  async handle(event: BookingCancelledEvent): Promise<void> {
    if (!event.seatHoldId) return
    this.logger.info('Releasing seat hold', { seatHoldId: event.seatHoldId })
    await this.inventoryService.releaseSeatHold(event.seatHoldId)
  }
}
