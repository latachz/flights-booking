-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "roles" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AuthToken" (
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roles" TEXT[],
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthToken_pkey" PRIMARY KEY ("accessToken")
);

-- CreateTable
CREATE TABLE "FlightOffer" (
    "offerId" TEXT NOT NULL,
    "flightId" TEXT NOT NULL,
    "cabinClass" TEXT NOT NULL,
    "availableSeats" INTEGER NOT NULL,
    "basePriceAmount" DECIMAL(12,2) NOT NULL,
    "basePriceCurrency" TEXT NOT NULL,
    "totalPriceAmount" DECIMAL(12,2) NOT NULL,
    "totalPriceCurrency" TEXT NOT NULL,
    "segments" JSONB NOT NULL,
    "fareRules" JSONB NOT NULL,
    "baggageOptions" JSONB NOT NULL,

    CONSTRAINT "FlightOffer_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "SeatInventory" (
    "offerId" TEXT NOT NULL,
    "availableSeats" INTEGER NOT NULL,

    CONSTRAINT "SeatInventory_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "SeatHold" (
    "seatHoldId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "seatsHeld" INTEGER NOT NULL,
    "heldUntil" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "SeatHold_pkey" PRIMARY KEY ("seatHoldId")
);

-- CreateTable
CREATE TABLE "PriceRule" (
    "offerId" TEXT NOT NULL,
    "basePriceAmount" DECIMAL(12,2) NOT NULL,
    "basePriceCurrency" TEXT NOT NULL,

    CONSTRAINT "PriceRule_pkey" PRIMARY KEY ("offerId")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "code" TEXT NOT NULL,
    "discountFraction" DECIMAL(5,4) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Passenger" (
    "passengerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TEXT NOT NULL,
    "document" JSONB,
    "specialRequests" JSONB,

    CONSTRAINT "Passenger_pkey" PRIMARY KEY ("passengerId")
);

-- CreateTable
CREATE TABLE "BookingPassenger" (
    "bookingId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,

    CONSTRAINT "BookingPassenger_pkey" PRIMARY KEY ("bookingId","passengerId")
);

-- CreateTable
CREATE TABLE "Booking" (
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "totalPriceAmount" DECIMAL(12,2) NOT NULL,
    "totalPriceCurrency" TEXT NOT NULL,
    "contactInfo" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("bookingId")
);

-- CreateTable
CREATE TABLE "Payment" (
    "paymentId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "amountValue" DECIMAL(12,2) NOT NULL,
    "amountCurrency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "redirectUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("paymentId")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticketId" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticketId")
);

-- CreateTable
CREATE TABLE "TicketCounter" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nextValue" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TicketCounter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationLog" (
    "notificationId" TEXT NOT NULL,
    "bookingId" TEXT,
    "paymentId" TEXT,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("notificationId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_ticketNumber_key" ON "Ticket"("ticketNumber");

-- AddForeignKey
ALTER TABLE "AuthToken" ADD CONSTRAINT "AuthToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatInventory" ADD CONSTRAINT "SeatInventory_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "FlightOffer"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatHold" ADD CONSTRAINT "SeatHold_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "SeatInventory"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PriceRule" ADD CONSTRAINT "PriceRule_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "FlightOffer"("offerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPassenger" ADD CONSTRAINT "BookingPassenger_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookingPassenger" ADD CONSTRAINT "BookingPassenger_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "Passenger"("passengerId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("bookingId") ON DELETE SET NULL ON UPDATE CASCADE;
