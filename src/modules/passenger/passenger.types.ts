import { PassengerId } from '../../types/ids'
import { PassengerType } from '../../types/enums'

export interface TravelDocument {
  documentType: 'PASSPORT' | 'ID_CARD'
  documentNumber: string
  expiryDate: string
  issuingCountry: string
}

export interface ContactInfo {
  email: string
  phone: string
}

export type SpecialRequest =
  | { kind: 'WHEELCHAIR' }
  | { kind: 'EXTRA_BAGGAGE'; weightKg: number }
  | { kind: 'SPECIAL_MEAL'; mealCode: string }

export interface Passenger {
  passengerId: PassengerId
  type: PassengerType
  firstName: string
  lastName: string
  birthDate: string
  document?: TravelDocument
  specialRequests?: SpecialRequest[]
}

export interface UpdatePassengerData {
  firstName?: string
  lastName?: string
  birthDate?: string
  document?: TravelDocument
  specialRequests?: SpecialRequest[]
}
