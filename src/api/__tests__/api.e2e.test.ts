import request from 'supertest'
import { createApp } from '../app'
import { createTestContainer } from './test-container'
import { prisma } from '../../lib/prisma'
import { seed } from '../../../prisma/seed'

const app = createApp(createTestContainer())

beforeAll(async () => {
  await prisma.notificationLog.deleteMany()
  await prisma.ticket.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.bookingPassenger.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.passenger.deleteMany()
  await prisma.seatHold.deleteMany()
  await prisma.seatInventory.deleteMany()
  await prisma.authToken.deleteMany()
  await seed(prisma)
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('Auth', () => {
  it('POST /api/auth/login — valid credentials returns token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'pass123' })

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('accessToken')
    expect(res.body).toHaveProperty('refreshToken')
  })

  it('POST /api/auth/login — invalid credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'wrong' })

    expect(res.status).toBe(401)
    expect(res.body).toHaveProperty('error')
  })
})

describe('Flights', () => {
  it('GET /api/flights/search — returns matching offers', async () => {
    const res = await request(app).get('/api/flights/search').query({
      origin: 'WAW',
      destination: 'LHR',
      date: '2026-07-15',
      tripType: 'ONE_WAY',
      cabinClass: 'ECONOMY',
      adults: 1,
      children: 0,
      infants: 0,
    })

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toMatchObject({
      offerId: 'offer-waw-lhr-eco',
      cabinClass: 'ECONOMY',
    })
  })

  it('GET /api/flights/search — returns empty array for unmatched route', async () => {
    const res = await request(app).get('/api/flights/search').query({
      origin: 'WAW',
      destination: 'JFK',
      date: '2026-07-15',
      tripType: 'ONE_WAY',
      cabinClass: 'ECONOMY',
      adults: 1,
    })

    expect(res.status).toBe(200)
    expect(res.body).toEqual([])
  })

  it('GET /api/flights/:offerId — returns offer details', async () => {
    const res = await request(app).get('/api/flights/offer-waw-lhr-eco')

    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('fareRules')
    expect(res.body).toHaveProperty('baggageOptions')
  })

  it('GET /api/flights/:offerId — unknown offer returns 404', async () => {
    const res = await request(app).get('/api/flights/unknown-offer')

    expect(res.status).toBe(404)
  })
})

describe('Protected routes', () => {
  it('returns 401 when Authorization header is missing', async () => {
    const res = await request(app).post('/api/bookings').send({})
    expect(res.status).toBe(401)
  })

  it('returns 401 when token is invalid', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', 'Bearer invalid-token')
      .send({})
    expect(res.status).toBe(401)
  })
})

describe('Booking flow', () => {
  let aliceToken: string
  let bookingId: string
  let seatHoldId: string
  let paymentId: string

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'pass123' })
    aliceToken = res.body.accessToken
  })

  it('POST /api/inventory/hold — holds seats', async () => {
    const res = await request(app)
      .post('/api/inventory/hold')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ offerId: 'offer-waw-cdg-eco', passengerCount: 2 })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('seatHoldId')
    expect(res.body.status).toBe('ACTIVE')
    const holdId = res.body.seatHoldId

    const releaseRes = await request(app)
      .delete(`/api/inventory/hold/${holdId}`)
      .set('Authorization', `Bearer ${aliceToken}`)
    expect(releaseRes.status).toBe(204)
  })

  it('POST /api/bookings — reuses a pre-existing seat hold without double-holding', async () => {
    const holdRes = await request(app)
      .post('/api/inventory/hold')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ offerId: 'offer-krk-ams-eco', passengerCount: 1 })

    expect(holdRes.status).toBe(201)
    const preHoldId = holdRes.body.seatHoldId

    const bookRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        offerId: 'offer-krk-ams-eco',
        seatHoldId: preHoldId,
        passengers: [
          { type: 'ADULT', firstName: 'Anna', lastName: 'Kowalska', birthDate: '1990-05-15' },
        ],
        contactInfo: { email: 'alice@example.com', phone: '+48123456789' },
      })

    expect(bookRes.status).toBe(201)
    expect(bookRes.body.seatHold.seatHoldId).toBe(preHoldId)
  })

  it('POST /api/bookings — creates a booking', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        offerId: 'offer-waw-lhr-eco',
        passengers: [
          { type: 'ADULT', firstName: 'Anna', lastName: 'Kowalska', birthDate: '1990-05-15' },
        ],
        contactInfo: { email: 'alice@example.com', phone: '+48123456789' },
      })

    expect(res.status).toBe(201)
    expect(res.body.booking).toMatchObject({
      status: 'PENDING_PAYMENT',
      offerId: 'offer-waw-lhr-eco',
    })
    expect(res.body).toHaveProperty('seatHold')
    expect(res.body).toHaveProperty('priceBreakdown')
    bookingId = res.body.booking.bookingId
    seatHoldId = res.body.seatHold.seatHoldId
  })

  it('POST /api/bookings — promo code applies a discount', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        offerId: 'offer-waw-lhr-eco',
        passengers: [
          { type: 'ADULT', firstName: 'Anna', lastName: 'Kowalska', birthDate: '1990-05-15' },
        ],
        contactInfo: { email: 'alice@example.com', phone: '+48123456789' },
        promoCode: 'SUMMER10',
      })

    expect(res.status).toBe(201)
    expect(res.body.priceBreakdown).toHaveProperty('discount')
  })

  it('GET /api/bookings/:bookingId — returns booking details', async () => {
    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${aliceToken}`)

    expect(res.status).toBe(200)
    expect(res.body.booking.bookingId).toBe(bookingId)
    expect(res.body).toHaveProperty('tickets')
  })

  it('GET /api/bookings/:bookingId — returns 403 for a different user', async () => {
    const bobLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bob@example.com', password: 'pass456' })
    const bobToken = bobLogin.body.accessToken

    const res = await request(app)
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${bobToken}`)

    expect(res.status).toBe(403)
  })

  it('GET /api/bookings/:bookingId — returns 404 for unknown booking', async () => {
    const res = await request(app)
      .get('/api/bookings/nonexistent-id')
      .set('Authorization', `Bearer ${aliceToken}`)

    expect(res.status).toBe(404)
  })

  it('POST /api/bookings/:bookingId/tickets — issues a ticket', async () => {
    const res = await request(app)
      .post(`/api/bookings/${bookingId}/tickets`)
      .set('Authorization', `Bearer ${aliceToken}`)

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('ticketNumber')
    expect(res.body.status).toBe('ISSUED')
  })

  it('POST /api/bookings/:bookingId/payments — initiates payment session', async () => {
    const res = await request(app)
      .post(`/api/bookings/${bookingId}/payments`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ method: 'CARD', amount: { amount: 459, currency: 'PLN' } })

    expect(res.status).toBe(201)
    expect(res.body).toHaveProperty('paymentId')
    expect(res.body.status).toBe('PENDING')
    paymentId = res.body.paymentId
  })

  it('POST /api/payments/:paymentId/confirm — confirms payment as AUTHORIZED', async () => {
    const res = await request(app)
      .post(`/api/payments/${paymentId}/confirm`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        externalTransactionId: 'ext-txn-001',
        status: 'SUCCESS',
        processedAt: new Date().toISOString(),
      })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('AUTHORIZED')
    expect(res.body.paymentId).toBe(paymentId)
  })

  it('DELETE /api/bookings/:bookingId — cancels a booking', async () => {
    const createRes = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({
        offerId: 'offer-waw-lhr-eco',
        passengers: [
          { type: 'ADULT', firstName: 'Anna', lastName: 'Kowalska', birthDate: '1990-05-15' },
        ],
        contactInfo: { email: 'alice@example.com', phone: '+48123456789' },
      })
    const toCancel = createRes.body.booking.bookingId
    const toRelease = createRes.body.seatHold.seatHoldId

    const res = await request(app)
      .delete(`/api/bookings/${toCancel}`)
      .set('Authorization', `Bearer ${aliceToken}`)
      .send({ reason: 'Changed plans', seatHoldId: toRelease })

    expect(res.status).toBe(200)
    expect(res.body.status).toBe('CANCELLED')
  })
})
