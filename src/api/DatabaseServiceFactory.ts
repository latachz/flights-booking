import { PrismaClient } from '@prisma/client'
import { ServiceFactory } from './ServiceFactory'
import { AuthService } from '../modules/auth/AuthService'
import { SearchService } from '../modules/flight-search/SearchService'
import { PriceCalculator } from '../modules/pricing/PriceCalculator'
import { InventoryService } from '../modules/inventory/InventoryService'
import { BookingService } from '../modules/booking/BookingService'
import { NotificationService } from '../modules/notification/NotificationService'
import { PaymentService } from '../modules/payment/PaymentService'
import { TicketingService } from '../modules/ticketing/TicketingService'
import { SeatAvailabilityPolicy } from '../modules/inventory/SeatAvailabilityPolicy'
import { DatabaseAuthService } from '../modules/auth/DatabaseAuthService'
import { DatabaseSearchService } from '../modules/flight-search/DatabaseSearchService'
import { DatabasePriceCalculator } from '../modules/pricing/DatabasePriceCalculator'
import { DatabaseInventoryService } from '../modules/inventory/DatabaseInventoryService'
import { DatabaseNotificationService } from '../modules/notification/DatabaseNotificationService'
import { DatabasePaymentService } from '../modules/payment/DatabasePaymentService'
import { DatabaseBookingService } from '../modules/booking/DatabaseBookingService'
import { DatabaseTicketingService } from '../modules/ticketing/DatabaseTicketingService'
import { DefaultSeatAvailabilityPolicy } from '../modules/inventory/DefaultSeatAvailabilityPolicy'
import { RetryNotificationDecorator } from '../modules/notification/RetryNotificationDecorator'

export class DatabaseServiceFactory extends ServiceFactory {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  createAuthService(): AuthService {
    return new DatabaseAuthService(this.prisma)
  }

  createSearchService(): SearchService {
    return new DatabaseSearchService(this.prisma)
  }

  createPriceCalculator(): PriceCalculator {
    return new DatabasePriceCalculator(this.prisma)
  }

  createSeatAvailabilityPolicy(): SeatAvailabilityPolicy {
    return new DefaultSeatAvailabilityPolicy()
  }

  createInventoryService(policy: SeatAvailabilityPolicy): InventoryService {
    return new DatabaseInventoryService(this.prisma, policy)
  }

  createNotificationService(): NotificationService {
    const base = new DatabaseNotificationService(this.prisma)
    return new RetryNotificationDecorator(base)
  }

  createPaymentService(): PaymentService {
    return new DatabasePaymentService(this.prisma)
  }

  createBookingService(priceCalculator: PriceCalculator): BookingService {
    return new DatabaseBookingService(this.prisma, priceCalculator)
  }

  createTicketingService(bookingService: BookingService): TicketingService {
    return new DatabaseTicketingService(this.prisma, bookingService)
  }
}
