/**
 * Tests for StateManager
 */

import { StateManager } from '../src/state'
import { FilingStatus, PersonRole, State, IncomeW2 } from 'ustaxes/core/data'

describe('StateManager', () => {
  let manager: StateManager

  beforeEach(() => {
    manager = new StateManager()
  })

  describe('Initialization', () => {
    it('should initialize with 2024 as active year', () => {
      const state = manager.getState()
      expect(state.activeYear).toBe(2024)
    })

    it('should create empty information for 2024', () => {
      const yearState = manager.getYearState(2024)
      expect(yearState.w2s).toEqual([])
      expect(yearState.f1099s).toEqual([])
      expect(yearState.taxPayer.dependents).toEqual([])
    })
  })

  describe('setFilingStatus', () => {
    it('should set filing status for a year', () => {
      manager.setFilingStatus(2024, FilingStatus.MFJ)
      const yearState = manager.getYearState(2024)
      expect(yearState.taxPayer.filingStatus).toBe(FilingStatus.MFJ)
    })

    it('should handle all filing statuses', () => {
      const statuses = [
        FilingStatus.S,
        FilingStatus.MFJ,
        FilingStatus.MFS,
        FilingStatus.HOH,
        FilingStatus.W
      ]
      statuses.forEach((status) => {
        manager.setFilingStatus(2024, status)
        const yearState = manager.getYearState(2024)
        expect(yearState.taxPayer.filingStatus).toBe(status)
      })
    })
  })

  describe('setPrimaryPerson', () => {
    it('should set primary taxpayer information', () => {
      const person = {
        firstName: 'John',
        lastName: 'Doe',
        ssid: '123-45-6789',
        dateOfBirth: new Date('1980-01-15'),
        address: {
          address: '123 Main St',
          city: 'Boston',
          state: 'MA' as State,
          zip: '02101',
          foreignCountry: 'USA'
        },
        role: PersonRole.PRIMARY,
        isTaxpayerDependent: false,
        isBlind: false
      }

      manager.setPrimaryPerson(2024, person)
      const yearState = manager.getYearState(2024)
      expect(yearState.taxPayer.primaryPerson).toEqual(person)
    })
  })

  describe('addW2', () => {
    it('should add W-2 to the year', () => {
      const w2 = {
        employer: {
          EIN: '12-3456789',
          employerName: 'Test Corp',
          address: {
            address: '456 Corporate Dr',
            city: 'Boston',
            state: 'MA' as State,
            zip: '02102'
          }
        },
        occupation: 'Developer',
        state: 'MA' as State,
        income: 100000,
        fedWithholding: 15000,
        medicareIncome: 100000,
        medicareWages: 100000,
        medicareWithholding: 1450,
        ssWages: 100000,
        ssWithholding: 6200,
        stateWages: 100000,
        stateWithholding: 5000,
        personRole: PersonRole.PRIMARY
      } as IncomeW2

      manager.addW2(2024, w2)
      const yearState = manager.getYearState(2024)
      expect(yearState.w2s).toHaveLength(1)
      expect(yearState.w2s[0]).toEqual(w2)
    })

    it('should add multiple W-2s', () => {
      const w2_1 = {
        employer: {
          EIN: '12-3456789',
          employerName: 'Employer 1',
          address: {
            address: '123 St',
            city: 'Boston',
            state: 'MA' as State,
            zip: '02101'
          }
        },
        occupation: 'Dev',
        state: 'MA' as State,
        income: 50000,
        fedWithholding: 7500,
        medicareIncome: 50000,
        medicareWages: 50000,
        medicareWithholding: 725,
        ssWages: 50000,
        ssWithholding: 3100,
        stateWages: 50000,
        stateWithholding: 2500,
        personRole: PersonRole.PRIMARY
      }

      const w2_2 = {
        ...w2_1,
        employer: { ...w2_1.employer, employerName: 'Employer 2' }
      } as IncomeW2

      manager.addW2(2024, w2_1 as IncomeW2)
      manager.addW2(2024, w2_2)

      const yearState = manager.getYearState(2024)
      expect(yearState.w2s).toHaveLength(2)
    })
  })

  describe('removeW2', () => {
    it('should remove W-2 by index', () => {
      const w2 = {
        employer: {
          EIN: '12-3456789',
          employerName: 'Test Corp',
          address: {
            address: '123 St',
            city: 'Boston',
            state: 'MA' as State,
            zip: '02101'
          }
        },
        occupation: 'Dev',
        state: 'MA' as State,
        income: 100000,
        fedWithholding: 15000,
        medicareIncome: 100000,
        medicareWages: 100000,
        medicareWithholding: 1450,
        ssWages: 100000,
        ssWithholding: 6200,
        stateWages: 100000,
        stateWithholding: 5000,
        personRole: PersonRole.PRIMARY
      } as IncomeW2

      manager.addW2(2024, w2)
      manager.addW2(2024, w2)
      expect(manager.getYearState(2024).w2s).toHaveLength(2)

      manager.removeW2(2024, 0)
      expect(manager.getYearState(2024).w2s).toHaveLength(1)
    })
  })

  describe('addDependent', () => {
    it('should add dependent', () => {
      const dependent = {
        firstName: 'Child',
        lastName: 'Doe',
        ssid: '987-65-4321',
        dateOfBirth: new Date('2015-06-01'),
        role: PersonRole.DEPENDENT,
        isBlind: false,
        relationship: 'SON',
        qualifyingInfo: {
          numberOfMonths: 12,
          isStudent: false
        }
      }

      manager.addDependent(2024, dependent)
      const yearState = manager.getYearState(2024)
      expect(yearState.taxPayer.dependents).toHaveLength(1)
      expect(yearState.taxPayer.dependents[0]).toEqual(dependent)
    })
  })

  describe('resetYear', () => {
    it('should reset year to empty state', () => {
      manager.setFilingStatus(2024, FilingStatus.MFJ)
      expect(manager.getYearState(2024).taxPayer.filingStatus).toBe(
        FilingStatus.MFJ
      )

      manager.resetYear(2024)
      expect(manager.getYearState(2024).taxPayer.filingStatus).toBeUndefined()
      expect(manager.getYearState(2024).w2s).toEqual([])
    })
  })

  describe('Multiple years', () => {
    it('should handle multiple tax years', () => {
      manager.setFilingStatus(2024, FilingStatus.MFJ)
      manager.setFilingStatus(2023, FilingStatus.S)

      expect(manager.getYearState(2024).taxPayer.filingStatus).toBe(
        FilingStatus.MFJ
      )
      expect(manager.getYearState(2023).taxPayer.filingStatus).toBe(
        FilingStatus.S
      )
    })
  })
})
