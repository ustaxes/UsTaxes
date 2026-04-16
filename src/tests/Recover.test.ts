import * as fc from 'fast-check'
import * as arbitraries from 'ustaxes/core/tests/arbitraries'
import {
  FilingStatus,
  Income1099NEC,
  Income1099Type,
  PersonRole
} from 'ustaxes/core/data'
import { stateToString, stringToImportState } from 'ustaxes/redux/fs'
import { blankYearTaxesState, YearsTaxesState } from 'ustaxes/redux/data'

describe('FS Recover / Save', () => {
  it('should restore the same data it created', () => {
    fc.assert(
      fc.property(arbitraries.yearsTaxesState, (state) => {
        expect(stringToImportState(stateToString(state))).toEqual(state)
      }),
      { numRuns: 10 }
    )
  })

  it('round-trips Y2025 self-employment and Form 7206 worksheet data in full backups', () => {
    const nec1099: Income1099NEC = {
      payer: 'Client Co',
      personRole: PersonRole.PRIMARY,
      type: Income1099Type.NEC,
      form: {
        nonemployeeCompensation: 6400
      }
    }

    const state: YearsTaxesState = {
      ...blankYearTaxesState,
      activeYear: 'Y2025' as const,
      Y2025: {
        ...blankYearTaxesState.Y2025,
        taxPayer: {
          filingStatus: FilingStatus.S,
          primaryPerson: {
            firstName: 'Taylor',
            lastName: 'Taxpayer',
            ssid: '123456789',
            role: PersonRole.PRIMARY,
            isBlind: false,
            dateOfBirth: new Date(1990, 0, 1),
            isTaxpayerDependent: false,
            address: {
              address: '123 Maple St',
              city: 'Austin',
              state: 'TX',
              zip: '78701'
            }
          },
          dependents: []
        },
        f1099s: [nec1099],
        adjustments: {
          selfEmployedHealthInsuranceWorksheet: {
            line1: 1000,
            line4: 6400,
            line14: 775
          },
          selfEmployedHealthInsuranceDeduction: 775
        },
        selfEmployedIncome: [
          {
            businessName: 'Side Gig',
            personRole: PersonRole.PRIMARY,
            grossReceipts: 6400,
            expenses: 0,
            healthInsurancePremiums: 775
          }
        ]
      }
    }

    expect(stringToImportState(stateToString(state))).toEqual(state)
  })
})
