import { enumKeys } from 'ustaxes/core/util'
import {
  Person,
  Dependent,
  Spouse,
  PrimaryPerson,
  TaxYears,
  FilingStatus
} from 'ustaxes/core/data'
import { blankState } from './reducer'
import { USTState } from './store'

export interface QualifyingInformationV0 {
  numberOfMonths: number
  isStudent: boolean
  birthYear: number
}

export interface DependentV0 extends Person {
  relationship: string
  qualifyingInfo?: QualifyingInformationV0
}

// export type USTStateV0 = {
//   [P in keyof Omit<USTState, 'taxPayer'>]: USTState[P];
// } & {
//   taxPayer: {
//     primaryPerson?: PrimaryPerson;
//     dependents: DependentV0[];
//     filingStatus?: FilingStatus;
//     spouse?: Spouse;
// };}

function migrateDependent(p: DependentV0): Dependent {
  const birthYear = p.qualifyingInfo?.birthYear
  p as Dependent
  if (birthYear !== undefined) {
    p.dateOfBirth = new Date(birthYear, 0, 1)
  } else {
    p.dateOfBirth = new Date()
  }
  return p
}

function migratePrimaryOrSpouse(p: Spouse | PrimaryPerson) {
  if (p.isBlind === undefined) {
    p.isBlind = false
  }

  if (p.dateOfBirth === undefined) {
    p.dateOfBirth = new Date()
  }
  return p
}

export const migrateAgeAndBlindness = <S extends USTState>(state: S): S =>
  enumKeys(TaxYears).reduce((acc, year) => {
    if (acc[year].taxPayer !== undefined) {
      const primaryPerson = acc[year].taxPayer.primaryPerson

      if (primaryPerson !== undefined) {
        acc[year].taxPayer.primaryPerson = migratePrimaryOrSpouse(
          primaryPerson
        ) as PrimaryPerson
      }

      const spouse = acc[year].taxPayer.spouse
      if (spouse !== undefined) {
        acc[year].taxPayer.spouse = migratePrimaryOrSpouse(spouse) as Spouse
      }
      acc[year].taxPayer.dependents = acc[year].taxPayer.dependents.map((d) =>
        migrateDependent(d as DependentV0)
      )
    }
    return {
      ...acc,
      [year]: {
        ...blankState,
        ...acc[year]
      }
    }
  }, state)

/**
 * Ensures all default fields are present on each year's data
 * @returns state
 */
export const migrateEachYear = <S extends USTState>(state: S): S =>
  enumKeys(TaxYears).reduce((acc, year) => {
    // Make sure SS wages are set on W2s
    acc[year].w2s.forEach((w2) => {
      if (w2.ssWages === undefined) {
        w2.ssWages = 0
      }
    })

    // Ensure interestIncome on K1s
    acc[year].scheduleK1Form1065s.forEach((k1) => {
      if (k1.interestIncome === undefined) {
        k1.interestIncome = 0
      }
    })

    return {
      ...acc,
      [year]: {
        ...blankState,
        ...acc[year]
      }
    }
  }, state)
