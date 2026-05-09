import { PrismaClient } from '@prisma/client'

export async function seed(prisma: PrismaClient) {
  await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    create: { userId: 'user-1', email: 'alice@example.com', password: 'pass123', roles: ['USER'] },
    update: {},
  })
  await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    create: { userId: 'user-2', email: 'bob@example.com', password: 'pass456', roles: ['USER', 'ADMIN'] },
    update: {},
  })

  const offers = [
    {
      offerId: 'offer-waw-lhr-eco',
      flightId: 'flt-lo001',
      cabinClass: 'ECONOMY',
      availableSeats: 120,
      basePriceAmount: 399,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 459,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-1', carrierCode: 'LO', flightNumber: 'LO001', origin: { code: 'WAW' }, destination: { code: 'LHR' }, departureTime: '2026-07-15T08:00:00Z', arrivalTime: '2026-07-15T10:30:00Z' },
      ],
      fareRules: { refundable: false, changeable: true, changeFee: { amount: 150, currency: 'PLN' } },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
        { baggageType: 'CHECKED', quantity: 1, price: { amount: 120, currency: 'PLN' } },
      ],
    },
    {
      offerId: 'offer-waw-lhr-bus',
      flightId: 'flt-lo001',
      cabinClass: 'BUSINESS',
      availableSeats: 20,
      basePriceAmount: 1299,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 1399,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-2', carrierCode: 'LO', flightNumber: 'LO001', origin: { code: 'WAW' }, destination: { code: 'LHR' }, departureTime: '2026-07-15T08:00:00Z', arrivalTime: '2026-07-15T10:30:00Z' },
      ],
      fareRules: { refundable: true, changeable: true },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
        { baggageType: 'CHECKED', quantity: 2, price: { amount: 0, currency: 'PLN' } },
      ],
    },
    {
      offerId: 'offer-waw-cdg-eco',
      flightId: 'flt-lo205',
      cabinClass: 'ECONOMY',
      availableSeats: 85,
      basePriceAmount: 349,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 399,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-3', carrierCode: 'LO', flightNumber: 'LO205', origin: { code: 'WAW' }, destination: { code: 'CDG' }, departureTime: '2026-07-15T12:00:00Z', arrivalTime: '2026-07-15T14:10:00Z' },
      ],
      fareRules: { refundable: false, changeable: false },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
        { baggageType: 'CHECKED', quantity: 1, price: { amount: 100, currency: 'PLN' } },
      ],
    },
    {
      offerId: 'offer-krk-ams-eco',
      flightId: 'flt-kl803',
      cabinClass: 'ECONOMY',
      availableSeats: 45,
      basePriceAmount: 449,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 519,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-4', carrierCode: 'KL', flightNumber: 'KL803', origin: { code: 'KRK' }, destination: { code: 'WAW' }, departureTime: '2026-07-20T07:00:00Z', arrivalTime: '2026-07-20T08:00:00Z' },
        { segmentId: 'seg-5', carrierCode: 'KL', flightNumber: 'KL1241', origin: { code: 'WAW' }, destination: { code: 'AMS' }, departureTime: '2026-07-20T10:30:00Z', arrivalTime: '2026-07-20T12:20:00Z' },
      ],
      fareRules: { refundable: false, changeable: true, changeFee: { amount: 200, currency: 'PLN' } },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
        { baggageType: 'CHECKED', quantity: 1, price: { amount: 130, currency: 'PLN' } },
      ],
    },
    {
      offerId: 'offer-waw-lhr-eco-aug',
      flightId: 'flt-lo003',
      cabinClass: 'ECONOMY',
      availableSeats: 8,
      basePriceAmount: 599,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 659,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-6', carrierCode: 'LO', flightNumber: 'LO003', origin: { code: 'WAW' }, destination: { code: 'LHR' }, departureTime: '2026-08-10T06:00:00Z', arrivalTime: '2026-08-10T08:30:00Z' },
      ],
      fareRules: { refundable: false, changeable: false },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
      ],
    },
    {
      offerId: 'offer-krk-ams-bus',
      flightId: 'flt-kl805',
      cabinClass: 'BUSINESS',
      availableSeats: 12,
      basePriceAmount: 1899,
      basePriceCurrency: 'PLN',
      totalPriceAmount: 2099,
      totalPriceCurrency: 'PLN',
      segments: [
        { segmentId: 'seg-7', carrierCode: 'KL', flightNumber: 'KL805', origin: { code: 'KRK' }, destination: { code: 'WAW' }, departureTime: '2026-07-20T14:00:00Z', arrivalTime: '2026-07-20T15:00:00Z' },
        { segmentId: 'seg-8', carrierCode: 'KL', flightNumber: 'KL1243', origin: { code: 'WAW' }, destination: { code: 'AMS' }, departureTime: '2026-07-20T17:30:00Z', arrivalTime: '2026-07-20T19:20:00Z' },
      ],
      fareRules: { refundable: true, changeable: true },
      baggageOptions: [
        { baggageType: 'CABIN', quantity: 1, price: { amount: 0, currency: 'PLN' } },
        { baggageType: 'CHECKED', quantity: 2, price: { amount: 0, currency: 'PLN' } },
      ],
    },
  ]

  for (const offer of offers) {
    await prisma.flightOffer.upsert({
      where: { offerId: offer.offerId },
      create: offer,
      update: {},
    })
    await prisma.seatInventory.upsert({
      where: { offerId: offer.offerId },
      create: { offerId: offer.offerId, availableSeats: offer.availableSeats },
      update: {},
    })
    await prisma.priceRule.upsert({
      where: { offerId: offer.offerId },
      create: { offerId: offer.offerId, basePriceAmount: offer.basePriceAmount, basePriceCurrency: offer.basePriceCurrency },
      update: {},
    })
  }

  await prisma.promoCode.upsert({
    where: { code: 'SUMMER10' },
    create: { code: 'SUMMER10', discountFraction: 0.10 },
    update: {},
  })
  await prisma.promoCode.upsert({
    where: { code: 'STUDENT15' },
    create: { code: 'STUDENT15', discountFraction: 0.15 },
    update: {},
  })

  await prisma.ticketCounter.upsert({
    where: { id: 1 },
    create: { id: 1, nextValue: 1 },
    update: {},
  })

}

async function main() {
  const prisma = new PrismaClient()
  try {
    await seed(prisma)
    console.log('Seed completed successfully')
  } catch (err) {
    console.error(err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}
