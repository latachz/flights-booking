import { AuthService } from '../modules/auth/AuthService'
import { SearchService } from '../modules/flight-search/SearchService'
import { PriceCalculator } from '../modules/pricing/PriceCalculator'
import { InventoryService } from '../modules/inventory/InventoryService'
import { BookingService } from '../modules/booking/BookingService'
import { NotificationService } from '../modules/notification/NotificationService'
import { PaymentService } from '../modules/payment/PaymentService'
import { TicketingService } from '../modules/ticketing/TicketingService'
import { SeatAvailabilityPolicy } from '../modules/inventory/SeatAvailabilityPolicy'

export abstract class ServiceFactory {
  abstract createAuthService(): AuthService
  abstract createSearchService(): SearchService
  abstract createPriceCalculator(): PriceCalculator
  abstract createSeatAvailabilityPolicy(): SeatAvailabilityPolicy
  abstract createInventoryService(policy: SeatAvailabilityPolicy): InventoryService
  abstract createNotificationService(): NotificationService
  abstract createPaymentService(): PaymentService
  abstract createBookingService(priceCalculator: PriceCalculator): BookingService
  abstract createTicketingService(bookingService: BookingService): TicketingService
}
