import { PrismaClient } from '@prisma/client'
import { CurrencyCode } from '../../types/enums'
import { PriceCalculator } from './PriceCalculator'
import { PriceCalculationCommand, PriceBreakdown } from './pricing.types'
import { NotFoundError } from '../../lib/errors'

export class DatabasePriceCalculator extends PriceCalculator {
  constructor(private readonly prisma: PrismaClient) {
    super()
  }

  async calculatePrice(command: PriceCalculationCommand): Promise<PriceBreakdown> {
    const rule = await this.prisma.priceRule.findUnique({ where: { offerId: command.offerId } })
    if (!rule) {
      throw new NotFoundError(`Unknown offer: ${command.offerId}`)
    }

    const baseAmount = rule.basePriceAmount.toNumber()
    const currency = rule.basePriceCurrency as CurrencyCode

    let baseFare = 0
    for (const passenger of command.passengers) {
      if (passenger.type === 'ADULT') baseFare += baseAmount * 1.0
      else if (passenger.type === 'CHILD') baseFare += baseAmount * 0.75
      else if (passenger.type === 'INFANT') baseFare += baseAmount * 0.10
    }

    const taxes = Math.round(baseFare * 0.23 * 100) / 100
    const serviceFee = 15

    let baggageFee = 0
    if (command.baggageOptions && command.baggageOptions.length > 0) {
      for (const opt of command.baggageOptions) {
        baggageFee += opt.price.amount * opt.quantity
      }
    }

    let discount = 0
    if (command.promoCode) {
      const promo = await this.prisma.promoCode.findUnique({ where: { code: command.promoCode } })
      if (promo) {
        discount = Math.round(baseFare * promo.discountFraction.toNumber() * 100) / 100
      }
    }

    const total = Math.round((baseFare + taxes + serviceFee + baggageFee - discount) * 100) / 100

    return {
      baseFare: { amount: baseFare, currency },
      taxes: { amount: taxes, currency },
      serviceFee: { amount: serviceFee, currency },
      ...(baggageFee > 0 && { baggageFee: { amount: baggageFee, currency } }),
      ...(discount > 0 && { discount: { amount: discount, currency } }),
      total: { amount: total, currency },
    }
  }
}
