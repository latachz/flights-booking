import { PrismaClient } from '@prisma/client'
import { OfferId, SeatHoldId } from '../../types/ids'
import { InventoryService } from './InventoryService'
import { SeatAvailabilityPolicy } from './SeatAvailabilityPolicy'
import { HoldSeatsCommand, SeatHold } from './inventory.types'
import { generateId } from '../../utils/id-generator'

export class DatabaseInventoryService extends InventoryService {
  private static readonly HOLD_DURATION_MS = 15 * 60 * 1000

  constructor(
    private readonly prisma: PrismaClient,
    private readonly policy: SeatAvailabilityPolicy,
  ) {
    super()
  }

  async holdSeats(command: HoldSeatsCommand): Promise<SeatHold> {
    await this.expireStaleHolds(command.offerId)

    return this.prisma.$transaction(async (tx) => {
      const inv = await tx.seatInventory.findUnique({ where: { offerId: command.offerId } })
      if (!inv) {
        throw new Error(`No inventory found for offer ${command.offerId}`)
      }

      if (!this.policy.canHoldSeats(inv.availableSeats, command.passengerCount)) {
        throw new Error(`Not enough seats available for offer ${command.offerId}`)
      }

      await tx.seatInventory.update({
        where: { offerId: command.offerId },
        data: { availableSeats: { decrement: command.passengerCount } },
      })

      const seatHoldId = generateId() as SeatHoldId
      const heldUntil = new Date(Date.now() + DatabaseInventoryService.HOLD_DURATION_MS)

      await tx.seatHold.create({
        data: {
          seatHoldId,
          offerId: command.offerId,
          seatsHeld: command.passengerCount,
          heldUntil,
          status: 'ACTIVE',
        },
      })

      return {
        seatHoldId,
        offerId: command.offerId as OfferId,
        heldUntil: heldUntil.toISOString(),
        status: 'ACTIVE' as const,
      }
    })
  }

  async getSeatHold(seatHoldId: SeatHoldId): Promise<SeatHold> {
    const hold = await this.prisma.seatHold.findUnique({ where: { seatHoldId } })
    if (!hold) {
      throw new Error(`Seat hold ${seatHoldId} not found`)
    }
    if (hold.status !== 'ACTIVE') {
      throw new Error(`Seat hold ${seatHoldId} is no longer active (status: ${hold.status})`)
    }
    return {
      seatHoldId: hold.seatHoldId as SeatHoldId,
      offerId: hold.offerId as OfferId,
      heldUntil: hold.heldUntil.toISOString(),
      status: hold.status as SeatHold['status'],
    }
  }

  async releaseSeatHold(seatHoldId: SeatHoldId): Promise<void> {
    const hold = await this.prisma.seatHold.findUnique({ where: { seatHoldId } })
    if (!hold) {
      throw new Error(`Seat hold ${seatHoldId} not found`)
    }
    if (hold.status === 'RELEASED' || hold.status === 'EXPIRED') {
      return
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.seatInventory.update({
        where: { offerId: hold.offerId },
        data: { availableSeats: { increment: hold.seatsHeld } },
      })
      await tx.seatHold.update({
        where: { seatHoldId },
        data: { status: 'RELEASED' },
      })
    })
  }

  private async expireStaleHolds(offerId: string): Promise<void> {
    const stale = await this.prisma.seatHold.findMany({
      where: { offerId, status: 'ACTIVE', heldUntil: { lt: new Date() } },
    })

    for (const hold of stale) {
      await this.prisma.$transaction(async (tx) => {
        await tx.seatInventory.update({
          where: { offerId: hold.offerId },
          data: { availableSeats: { increment: hold.seatsHeld } },
        })
        await tx.seatHold.update({
          where: { seatHoldId: hold.seatHoldId },
          data: { status: 'EXPIRED' },
        })
      })
    }
  }
}
