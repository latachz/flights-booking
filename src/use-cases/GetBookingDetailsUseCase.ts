import { BookingId, UserId } from '../types/ids'
import { BookingService } from '../modules/booking/BookingService'
import { Booking } from '../modules/booking/booking.types'
import { TicketingService } from '../modules/ticketing/TicketingService'
import { Ticket } from '../modules/ticketing/Ticket'
import { NotFoundError, ForbiddenError } from '../lib/errors'

export interface GetBookingDetailsInput {
  bookingId: BookingId
  requestingUserId: UserId
}

export interface GetBookingDetailsResult {
  booking: Booking
  tickets: Ticket[]
}

export class GetBookingDetailsUseCase {
  constructor(
    private readonly bookingService: BookingService,
    private readonly ticketingService: TicketingService
  ) {}

  async execute(input: GetBookingDetailsInput): Promise<GetBookingDetailsResult> {
    const booking = await this.bookingService.getBookingById(input.bookingId)
    if (!booking) {
      throw new NotFoundError(`Booking ${input.bookingId} not found`)
    }
    if (booking.userId !== input.requestingUserId) {
      throw new ForbiddenError('Access denied')
    }

    const tickets = await this.ticketingService.getTicketsByBookingId(input.bookingId)
    return { booking, tickets }
  }
}
