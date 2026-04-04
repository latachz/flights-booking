import { CurrencyCode } from './enums'

export interface Money {
  amount: number
  currency: CurrencyCode
}

export interface AirportCode {
  code: string
}

export interface DateRange {
  departureDate: string
  returnDate?: string
}
