/**
 * State management for UsTaxes MCP Server
 * Manages tax return data for multiple years
 */

import {
  Information,
  TaxPayer,
  PrimaryPerson,
  FilingStatus,
  IncomeW2,
  Supported1099,
  Property,
  F1098e,
  ItemizedDeductions,
  HealthSavingsAccount,
  Ira,
  Dependent,
  Spouse
} from 'ustaxes/core/data'
import { ServerState, TaxYear } from './types.js'

/**
 * State manager class - handles all state mutations
 */
export class StateManager {
  private state: ServerState

  constructor() {
    this.state = {
      activeYear: 2024,
      2024: this.createEmptyInformation()
    }
  }

  /**
   * Create empty Information object for a tax year
   */
  private createEmptyInformation(): Information {
    return {
      taxPayer: {
        primaryPerson: undefined as any,
        spouse: undefined,
        filingStatus: undefined as any,
        dependents: []
      },
      w2s: [],
      f1099s: [],
      estimatedTaxes: [],
      realEstate: [],
      f1098es: [],
      f3921s: [],
      scheduleK1Form1065s: [],
      itemizedDeductions: undefined,
      stateResidencies: [],
      credits: [],
      healthSavingsAccounts: [],
      individualRetirementArrangements: [],
      questions: {},
      refund: undefined
    }
  }

  /**
   * Get state for a specific year
   */
  getYearState(year: TaxYear): Information {
    if (!this.state[year]) {
      this.state[year] = this.createEmptyInformation()
    }
    return this.state[year]
  }

  /**
   * Get complete server state
   */
  getState(): ServerState {
    return this.state
  }

  /**
   * Set active year
   */
  setActiveYear(year: TaxYear): void {
    this.state.activeYear = year
    if (!this.state[year]) {
      this.state[year] = this.createEmptyInformation()
    }
  }

  /**
   * Reset state for a year
   */
  resetYear(year: TaxYear): void {
    this.state[year] = this.createEmptyInformation()
  }

  /**
   * Load complete state (for restoring saved returns)
   */
  loadState(newState: ServerState): void {
    this.state = newState
  }

  // ===== Personal Information Actions =====

  setFilingStatus(year: TaxYear, status: FilingStatus): void {
    const yearState = this.getYearState(year)
    yearState.taxPayer.filingStatus = status
  }

  setPrimaryPerson(year: TaxYear, person: PrimaryPerson): void {
    const yearState = this.getYearState(year)
    yearState.taxPayer.primaryPerson = person
  }

  setSpouse(year: TaxYear, spouse: Spouse): void {
    const yearState = this.getYearState(year)
    yearState.taxPayer.spouse = spouse
  }

  addDependent(year: TaxYear, dependent: Dependent): void {
    const yearState = this.getYearState(year)
    yearState.taxPayer.dependents.push(dependent)
  }

  removeDependent(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.taxPayer.dependents.splice(index, 1)
  }

  // ===== Income Actions =====

  addW2(year: TaxYear, w2: IncomeW2): void {
    const yearState = this.getYearState(year)
    yearState.w2s.push(w2)
  }

  removeW2(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.w2s.splice(index, 1)
  }

  add1099(year: TaxYear, f1099: Supported1099): void {
    const yearState = this.getYearState(year)
    yearState.f1099s.push(f1099)
  }

  remove1099(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.f1099s.splice(index, 1)
  }

  addProperty(year: TaxYear, property: Property): void {
    const yearState = this.getYearState(year)
    yearState.realEstate.push(property)
  }

  removeProperty(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.realEstate.splice(index, 1)
  }

  // ===== Deductions Actions =====

  add1098e(year: TaxYear, f1098e: F1098e): void {
    const yearState = this.getYearState(year)
    yearState.f1098es.push(f1098e)
  }

  remove1098e(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.f1098es.splice(index, 1)
  }

  setItemizedDeductions(year: TaxYear, deductions: ItemizedDeductions): void {
    const yearState = this.getYearState(year)
    yearState.itemizedDeductions = deductions
  }

  addHSA(year: TaxYear, hsa: HealthSavingsAccount): void {
    const yearState = this.getYearState(year)
    yearState.healthSavingsAccounts.push(hsa)
  }

  removeHSA(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.healthSavingsAccounts.splice(index, 1)
  }

  addIRA(year: TaxYear, ira: Ira): void {
    const yearState = this.getYearState(year)
    yearState.individualRetirementArrangements.push(ira)
  }

  removeIRA(year: TaxYear, index: number): void {
    const yearState = this.getYearState(year)
    yearState.individualRetirementArrangements.splice(index, 1)
  }

  // ===== State Residency Actions =====

  addStateResidency(year: TaxYear, state: string): void {
    const yearState = this.getYearState(year)
    // Check if residency for this state already exists
    const exists = yearState.stateResidencies.some((r) => r.state === state)
    if (!exists) {
      yearState.stateResidencies.push({ state: state as any })
    }
  }

  removeStateResidency(year: TaxYear, state: string): void {
    const yearState = this.getYearState(year)
    const index = yearState.stateResidencies.findIndex((r) => r.state === state)
    if (index >= 0) {
      yearState.stateResidencies.splice(index, 1)
    }
  }

  // ===== Questions Actions =====

  answerQuestion(
    year: TaxYear,
    question: string,
    answer: boolean | string
  ): void {
    const yearState = this.getYearState(year)
    ;(yearState.questions as any)[question] = answer
  }
}

// Export singleton instance
export const stateManager = new StateManager()
