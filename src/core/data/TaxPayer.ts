import { TaxPayer as InfoTaxPayer, PersonRole, Address, FilingStatus } from '.'

interface Person {
  firstName: string
  lastName: string
  ssid: string
  role: PersonRole
  dateOfBirth: Date
  isBlind: boolean
}

interface QualifyingInformation {
  numberOfMonths: number
  isStudent: boolean
}

export interface Dependent extends Person {
  relationship: string
  qualifyingInfo?: QualifyingInformation
}

interface PrimaryPerson extends Person {
  address: Address
  isTaxpayerDependent: boolean
}

interface Spouse extends Person {
  isTaxpayerDependent: boolean
}

interface ContactInfo {
  contactPhoneNumber?: string
  contactEmail?: string
}

interface TP extends ContactInfo {
  filingStatus?: FilingStatus
  primaryPerson?: PrimaryPerson
  spouse?: Spouse
  dependents: Dependent[]
}

/**
 * Used to augment the TaxPayer data interface with some convenience
 * methods.
 */
export default class TaxPayer implements TP {
  primaryPerson?: PrimaryPerson | undefined
  spouse?: Spouse | undefined
  dependents: Dependent[]
  filingStatus?: FilingStatus | undefined

  constructor(tp: InfoTaxPayer) {
    if (tp.primaryPerson !== undefined) {
      this.primaryPerson = {
        ...tp.primaryPerson,
        dateOfBirth: new Date(tp.primaryPerson.dateOfBirth)
      }
    }

    if (tp.spouse !== undefined) {
      this.spouse = {
        ...tp.spouse,
        dateOfBirth: new Date(tp.spouse.dateOfBirth)
      }
    }

    this.dependents = tp.dependents.map((d) => {
      return { ...d, dateOfBirth: new Date(d.dateOfBirth) }
    })
    this.filingStatus = tp.filingStatus
  }

  namesString = (): string => {
    const ps: Person[] = [this.primaryPerson, this.spouse]
      .filter((p: Person | undefined) => p !== undefined)
      .map((p: Person | undefined) => p as Person)

    return ps.map((p: Person) => `${p.firstName} ${p.lastName}`).join(', ')
  }
}
