import { PrismaClient, Prisma } from '@prisma/client'
import { BookingId, PassengerId } from '../../types/ids'
import { PassengerService } from './PassengerService'
import { BookingService } from '../booking/BookingService'
import { Booking } from '../booking/booking.types'
import { Passenger, UpdatePassengerData } from './passenger.types'
import { NotFoundError } from '../../lib/errors'

export class DatabasePassengerService extends PassengerService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly bookingService: BookingService,
  ) {
    super()
  }

  async addPassengers(bookingId: BookingId, passengers: Passenger[]): Promise<Booking> {
    const booking = await this.bookingService.getBookingById(bookingId)
    if (!booking) {
      throw new NotFoundError(`Booking ${bookingId} not found`)
    }

    await this.prisma.$transaction(async (tx) => {
      for (const p of passengers) {
        await tx.passenger.upsert({
          where: { passengerId: p.passengerId },
          create: {
            passengerId: p.passengerId,
            type: p.type,
            firstName: p.firstName,
            lastName: p.lastName,
            birthDate: p.birthDate,
            ...(p.document !== undefined && { document: p.document as unknown as Prisma.InputJsonValue }),
            ...(p.specialRequests !== undefined && { specialRequests: p.specialRequests as unknown as Prisma.InputJsonValue }),
          },
          update: {
            type: p.type,
            firstName: p.firstName,
            lastName: p.lastName,
            birthDate: p.birthDate,
            ...(p.document !== undefined && { document: p.document as unknown as Prisma.InputJsonValue }),
            ...(p.specialRequests !== undefined && { specialRequests: p.specialRequests as unknown as Prisma.InputJsonValue }),
          },
        })
        await tx.bookingPassenger.upsert({
          where: { bookingId_passengerId: { bookingId, passengerId: p.passengerId } },
          create: { bookingId, passengerId: p.passengerId },
          update: {},
        })
      }
    })

    const updated = await this.bookingService.getBookingById(bookingId)
    return updated!
  }

  async updatePassenger(passengerId: PassengerId, data: UpdatePassengerData): Promise<Passenger> {
    const existing = await this.prisma.passenger.findUnique({ where: { passengerId } })
    if (!existing) {
      throw new NotFoundError(`Passenger ${passengerId} not found`)
    }

    const row = await this.prisma.passenger.update({
      where: { passengerId },
      data: {
        ...(data.firstName !== undefined && { firstName: data.firstName }),
        ...(data.lastName !== undefined && { lastName: data.lastName }),
        ...(data.birthDate !== undefined && { birthDate: data.birthDate }),
        ...(data.document !== undefined && { document: data.document as unknown as Prisma.InputJsonValue }),
        ...(data.specialRequests !== undefined && { specialRequests: data.specialRequests as unknown as Prisma.InputJsonValue }),
      },
    })

    return {
      passengerId: row.passengerId,
      type: row.type as Passenger['type'],
      firstName: row.firstName,
      lastName: row.lastName,
      birthDate: row.birthDate,
      ...(row.document !== null && { document: row.document as unknown as Passenger['document'] }),
      ...(row.specialRequests !== null && { specialRequests: row.specialRequests as unknown as Passenger['specialRequests'] }),
    }
  }
}
