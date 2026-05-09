import express from 'express'
import { Container } from './container'
import { authRoutes } from './routes/auth.routes'
import { flightRoutes } from './routes/flights.routes'
import { inventoryRoutes } from './routes/inventory.routes'
import { bookingRoutes } from './routes/bookings.routes'
import { paymentRoutes } from './routes/payments.routes'
import { errorMiddleware } from './middleware/error.middleware'

export function createApp(container: Container): express.Application {
  const app = express()

  app.use(express.json())

  app.use('/api/auth', authRoutes(container.authService))
  app.use('/api/flights', flightRoutes(container))
  app.use('/api/inventory', inventoryRoutes(container))
  app.use('/api/bookings', bookingRoutes(container))
  app.use('/api/payments', paymentRoutes(container))

  app.use(errorMiddleware)

  return app
}
