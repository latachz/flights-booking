import { PriceCalculationCommand, PriceBreakdown } from './pricing.types'

export abstract class PriceCalculator {
  abstract calculatePrice(command: PriceCalculationCommand): Promise<PriceBreakdown>
}
