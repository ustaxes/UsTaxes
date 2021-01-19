export interface Person {
  firstName: string
  lastName: string
  ssid: string
}

export interface Address {
  address: string
  city: string
  state: string
  zip: string
  province?: string
  postalCode?: string
}

export interface PrimaryPerson extends Person {
  address: Address
}

export interface Employer {
  EIN: string
  employerName: string
  address?: Address
}

export interface Refund {
  routingNumber: string
  accountNumber: string
}

export interface IncomeW2 {
  occupation: string
  income: string
  fedWithholding: string
  employer: Employer
  person: Person
}

export enum FilingStatus {
  S,
  MFJ,
  MFS,
  HOH,
  W
}

export interface TaxPayer {
  contactPhoneNumber?: string
  contactEmail?: string
  filingStatus?: FilingStatus
  primaryPerson?: PrimaryPerson
  spouse?: Person
  dependents?: Person[]
}

export interface Information {
  w2s: IncomeW2[]
  refund?: Refund
  taxPayer?: TaxPayer
}

export interface TaxesState {
  information: Information
}
