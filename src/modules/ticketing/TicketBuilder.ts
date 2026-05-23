import { TicketId, BookingId, PassengerId } from '../../types/ids'
import { TicketStatus } from '../../types/enums'
import { Ticket } from './Ticket'
import { ValidationError } from '../../lib/errors'

export class TicketBuilder {
  private _ticketId: TicketId | undefined
  private _bookingId: BookingId | undefined
  private _passengerId: PassengerId | undefined
  private _ticketNumber: string | undefined
  private _status: TicketStatus | undefined
  private _issuedAt: string | undefined

  ticketId(value: TicketId): this {
    this._ticketId = value
    return this
  }

  bookingId(value: BookingId): this {
    this._bookingId = value
    return this
  }

  passengerId(value: PassengerId): this {
    this._passengerId = value
    return this
  }

  ticketNumber(value: string): this {
    this._ticketNumber = value
    return this
  }

  status(value: TicketStatus): this {
    this._status = value
    return this
  }

  issuedAt(value: string): this {
    this._issuedAt = value
    return this
  }

  build(): Ticket {
    if (!this._ticketId) throw new ValidationError('ticketId is required')
    if (!this._bookingId) throw new ValidationError('bookingId is required')
    if (!this._passengerId) throw new ValidationError('passengerId is required')
    if (!this._ticketNumber) throw new ValidationError('ticketNumber is required')
    if (!this._status) throw new ValidationError('status is required')
    if (!this._issuedAt) throw new ValidationError('issuedAt is required')

    if (!/^TKT-\d{8}$/.test(this._ticketNumber)) {
      throw new ValidationError(
        `ticketNumber must match TKT-NNNNNNNN, got: ${this._ticketNumber}`,
      )
    }

    return new Ticket(
      this._ticketId,
      this._bookingId,
      this._passengerId,
      this._ticketNumber,
      this._status,
      this._issuedAt,
    )
  }
}
