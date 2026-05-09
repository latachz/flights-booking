import { PrismaClient, Prisma } from '@prisma/client'
import { BookingId } from '../../types/ids'
import { BookingStatus, CurrencyCode } from '../../types/enums'
import { BookingService } from './BookingService'
import { PriceCalculator } from '../pricing/PriceCalculator'
import { Booking, CreateBookingCommand, CancelBookingCommand } from './booking.types'
import { Passenger } from '../passenger/passenger.types'
import { generateId } from '../../utils/id-generator'

export class DatabaseBookingService extends BookingService {
  private static readonly PAYMENT_WINDOW_MS = 30 * 60 * 1000

  constructor(
    private readonly prisma: PrismaClient,
    private readonly priceCalculator: PriceCalculator,
  ) {
    super()
  }

  async createBooking(command: CreateBookingCommand): Promise<Booking> {
    const priceBreakdown = await this.priceCalculator.calculatePrice({
      offerId: command.offerId,
      passengers: command.passengers,
    })

    const bookingId = generateId() as BookingId
    const now = new Date()
    const expiresAt = new Date(now.getTime() + DatabaseBookingService.PAYMENT_WINDOW_MS)

    await this.prisma.$transaction(async (tx) => {
      for (const p of command.passengers) {
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
      }

      await tx.booking.create({
        data: {
          bookingId,
          userId: command.userId,
          offerId: command.offerId,
          status: 'PENDING_PAYMENT',
          totalPriceAmount: priceBreakdown.total.amount,
          totalPriceCurrency: priceBreakdown.total.currency,
          contactInfo: command.contactInfo as unknown as Prisma.InputJsonValue,
          createdAt: now,
          expiresAt,
        },
      })

      await tx.bookingPassenger.createMany({
        data: command.passengers.map(p => ({
          bookingId,
          passengerId: p.passengerId,
        })),
      })
    })

    return {
      bookingId,
      userId: command.userId,
      offerId: command.offerId,
      status: 'PENDING_PAYMENT',
      passengers: command.passengers,
      totalPrice: priceBreakdown.total,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    }
  }

  async getBookingById(bookingId: BookingId): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({
      where: { bookingId },
      include: { bookingPassengers: { include: { passenger: true } } },
    })
    if (!row) return null

    return {
      bookingId: row.bookingId as BookingId,
      userId: row.userId,
      offerId: row.offerId,
      status: row.status as BookingStatus,
      passengers: row.bookingPassengers.map(bp => this.toPassenger(bp.passenger)),
      totalPrice: {
        amount: row.totalPriceAmount.toNumber(),
        currency: row.totalPriceCurrency as CurrencyCode,
      },
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt?.toISOString(),
    }
  }

  async cancelBooking(command: CancelBookingCommand): Promise<Booking> {
    const existing = await this.prisma.booking.findUnique({ where: { bookingId: command.bookingId } })
    if (!existing) {
      throw new Error(`Booking ${command.bookingId} not found`)
    }
    if (existing.status === 'CANCELLED') {
      throw new Error('Booking is already cancelled')
    }

    await this.prisma.booking.update({
      where: { bookingId: command.bookingId },
      data: { status: 'CANCELLED' },
    })

    const updated = await this.getBookingById(command.bookingId)
    return updated!
  }

  private toPassenger(row: {
    passengerId: string
    type: string
    firstName: string
    lastName: string
    birthDate: string
    document: unknown
    specialRequests: unknown
  }): Passenger {
    return {
      passengerId: row.passengerId,
      type: row.type as Passenger['type'],
      firstName: row.firstName,
      lastName: row.lastName,
      birthDate: row.birthDate,
      ...(row.document !== null && { document: row.document as Passenger['document'] }),
      ...(row.specialRequests !== null && { specialRequests: row.specialRequests as Passenger['specialRequests'] }),
    }
  }
}
