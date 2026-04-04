import { TicketId, BookingId, PassengerId } from '../../types/ids'
import { TicketStatus } from '../../types/enums'

export class Ticket {
  ticketId: TicketId
  bookingId: BookingId
  passengerId: PassengerId
  ticketNumber: string
  status: TicketStatus
  issuedAt: string

  constructor(
    ticketId: TicketId,
    bookingId: BookingId,
    passengerId: PassengerId,
    ticketNumber: string,
    status: TicketStatus,
    issuedAt: string
  ) {
    this.ticketId = ticketId
    this.bookingId = bookingId
    this.passengerId = passengerId
    this.ticketNumber = ticketNumber
    this.status = status
    this.issuedAt = issuedAt
  }
}
