import { prisma } from '../lib/prisma'
import { ServiceFactory } from './ServiceFactory'
import { DatabaseServiceFactory } from './DatabaseServiceFactory'
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

export function createContainer(
  factory: ServiceFactory = new DatabaseServiceFactory(prisma),
): Container {
  const priceCalculator = factory.createPriceCalculator()
  const policy = factory.createSeatAvailabilityPolicy()
  const authService = factory.createAuthService()
  const searchService = factory.createSearchService()
  const inventoryService = factory.createInventoryService(policy)
  const notificationSvc = factory.createNotificationService()
  const paymentService = factory.createPaymentService()
  const bookingService = factory.createBookingService(priceCalculator)
  const ticketingService = factory.createTicketingService(bookingService)

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
