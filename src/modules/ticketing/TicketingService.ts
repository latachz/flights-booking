import { BookingId } from '../../types/ids'
import { IssueTicketCommand } from './ticketing.types'
import { Ticket } from './Ticket'

export abstract class TicketingService {
  abstract issueTicket(command: IssueTicketCommand): Promise<Ticket>
  abstract getTicketsByBookingId(bookingId: BookingId): Promise<Ticket[]>
}
