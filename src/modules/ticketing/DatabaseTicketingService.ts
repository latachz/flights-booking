import { PrismaClient } from '@prisma/client'
import { BookingId, TicketId, PassengerId } from '../../types/ids'
import { TicketStatus } from '../../types/enums'
import { TicketingService } from './TicketingService'
import { BookingService } from '../booking/BookingService'
import { IssueTicketCommand } from './ticketing.types'
import { Ticket } from './Ticket'
import { TicketBuilder } from './TicketBuilder'
import { generateId } from '../../utils/id-generator'
import { NotFoundError } from '../../lib/errors'

export class DatabaseTicketingService extends TicketingService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly bookingService: BookingService,
  ) {
    super()
  }

  async issueTicket(command: IssueTicketCommand): Promise<Ticket> {
    const booking = await this.bookingService.getBookingById(command.bookingId)
    if (!booking) {
      throw new NotFoundError(`Booking ${command.bookingId} not found`)
    }

    const firstTicket = await this.prisma.$transaction(async (tx) => {
      const result = await tx.$queryRaw<Array<{ nextValue: bigint }>>`
        UPDATE "TicketCounter"
        SET "nextValue" = "nextValue" + ${booking.passengers.length}
        WHERE id = 1
        RETURNING "nextValue" - ${booking.passengers.length} AS "nextValue"
      `
      let counter = Number(result[0].nextValue)

      let first: Ticket | null = null
      for (const passenger of booking.passengers) {
        const ticketId = generateId() as TicketId
        const ticketNumber = `TKT-${String(counter++).padStart(8, '0')}`
        const issuedAt = new Date()

        await tx.ticket.create({
          data: {
            ticketId,
            bookingId: command.bookingId,
            passengerId: passenger.passengerId,
            ticketNumber,
            status: 'ISSUED',
            issuedAt,
          },
        })

        const ticket = new TicketBuilder()
          .ticketId(ticketId)
          .bookingId(command.bookingId as BookingId)
          .passengerId(passenger.passengerId as PassengerId)
          .ticketNumber(ticketNumber)
          .status('ISSUED')
          .issuedAt(issuedAt.toISOString())
          .build()
        if (!first) first = ticket
      }

      return first!
    })

    return firstTicket
  }

  async getTicketsByBookingId(bookingId: BookingId): Promise<Ticket[]> {
    const rows = await this.prisma.ticket.findMany({ where: { bookingId } })
    return rows.map(row =>
      new TicketBuilder()
        .ticketId(row.ticketId as TicketId)
        .bookingId(row.bookingId as BookingId)
        .passengerId(row.passengerId as PassengerId)
        .ticketNumber(row.ticketNumber)
        .status(row.status as TicketStatus)
        .issuedAt(row.issuedAt.toISOString())
        .build()
    )
  }
}
