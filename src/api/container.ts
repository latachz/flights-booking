import { prisma } from '../lib/prisma'
import { DefaultSeatAvailabilityPolicy } from '../modules/inventory/DefaultSeatAvailabilityPolicy'
import { DatabaseAuthService } from '../modules/auth/DatabaseAuthService'
import { DatabaseSearchService } from '../modules/flight-search/DatabaseSearchService'
import { DatabasePriceCalculator } from '../modules/pricing/DatabasePriceCalculator'
import { DatabaseInventoryService } from '../modules/inventory/DatabaseInventoryService'
import { DatabaseNotificationService } from '../modules/notification/DatabaseNotificationService'
import { DatabasePaymentService } from '../modules/payment/DatabasePaymentService'
import { DatabaseBookingService } from '../modules/booking/DatabaseBookingService'
import { DatabaseTicketingService } from '../modules/ticketing/DatabaseTicketingService'
import { AuthService } from '../modules/auth/AuthService'
import { SearchService } from '../modules/flight-search/SearchService'
import { InventoryService } from '../modules/inventory/InventoryService'
import { PaymentService } from '../modules/payment/PaymentService'
import { TicketingService } from '../modules/ticketing/TicketingService'
import { SearchFlightsUseCase } from '../use-cases/SearchFlightsUseCase'
import { CreateBookingUseCase } from '../use-cases/CreateBookingUseCase'
import { GetBookingDetailsUseCase } from '../use-cases/GetBookingDetailsUseCase'
import { CancelBookingUseCase } from '../use-cases/CancelBookingUseCase'

export interface Container {
  authService: AuthService
  searchService: SearchService
  inventoryService: InventoryService
  paymentService: PaymentService
  ticketingService: TicketingService
  searchFlights: SearchFlightsUseCase
  createBooking: CreateBookingUseCase
  getBookingDetails: GetBookingDetailsUseCase
  cancelBooking: CancelBookingUseCase
}

export function createContainer(): Container {
  const policy = new DefaultSeatAvailabilityPolicy()
  const authService = new DatabaseAuthService(prisma)
  const searchService = new DatabaseSearchService(prisma)
  const priceCalculator = new DatabasePriceCalculator(prisma)
  const inventoryService = new DatabaseInventoryService(prisma, policy)
  const notificationSvc = new DatabaseNotificationService(prisma)
  const paymentService = new DatabasePaymentService(prisma)
  const bookingService = new DatabaseBookingService(prisma, priceCalculator)
  const ticketingService = new DatabaseTicketingService(prisma, bookingService)

  const searchFlights = new SearchFlightsUseCase(searchService)
  const createBooking = new CreateBookingUseCase(inventoryService, bookingService, priceCalculator)
  const getBookingDetails = new GetBookingDetailsUseCase(bookingService, ticketingService)
  const cancelBooking = new CancelBookingUseCase(bookingService, inventoryService, notificationSvc)

  return {
    authService,
    searchService,
    inventoryService,
    paymentService,
    ticketingService,
    searchFlights,
    createBooking,
    getBookingDetails,
    cancelBooking,
  }
}
