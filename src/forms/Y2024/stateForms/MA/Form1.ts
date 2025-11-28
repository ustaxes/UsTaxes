import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { FilingStatus, State } from 'ustaxes/core/data'
import parameters from './Parameters'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

/**
 * Massachusetts Form 1 - Resident Income Tax Return
 *
 * Massachusetts has a flat 5% tax rate on most income.
 * Part B income (wages, interest, dividends): 5%
 * Part C income (short-term capital gains): 12%
 * Part D income (long-term capital gains): 5%
 */
export class MAForm1 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 0
  methods: FormMethods

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = 'MA Form 1'
    this.state = 'MA'
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => {
    // TODO: Add Schedule HC (health care), Schedule CB (circuit breaker), etc.
    return []
  }

  // ===== Personal Information =====

  /**
   * Primary taxpayer first name
   */
  fname = (): string | undefined =>
    this.info.taxPayer.primaryPerson.firstName

  /**
   * Primary taxpayer middle initial
   */
  mi = (): string | undefined => {
    const middleName = this.info.taxPayer.primaryPerson.firstName
    return middleName ? middleName.charAt(0) : undefined
  }

  /**
   * Primary taxpayer last name
   */
  lname = (): string | undefined =>
    this.info.taxPayer.primaryPerson.lastName

  /**
   * Primary taxpayer SSN
   */
  SSN = (): string | undefined =>
    this.info.taxPayer.primaryPerson.ssid

  /**
   * Spouse first name
   */
  Spfname = (): string | undefined =>
    this.info.taxPayer.spouse?.firstName

  /**
   * Spouse middle initial
   */
  Spmi = (): string | undefined => {
    const spouseName = this.info.taxPayer.spouse?.firstName
    return spouseName ? spouseName.charAt(0) : undefined
  }

  /**
   * Spouse last name
   */
  Splname = (): string | undefined =>
    this.info.taxPayer.spouse?.lastName

  /**
   * Spouse SSN
   */
  SSNSP = (): string | undefined =>
    this.info.taxPayer.spouse?.ssid

  /**
   * Mailing address
   */
  madd = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.address

  /**
   * City
   */
  city = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.city

  /**
   * State (should be MA)
   */
  state = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.state ??
    this.info.taxPayer.primaryPerson.address.province

  /**
   * ZIP code
   */
  zip = (): string | undefined =>
    this.info.taxPayer.primaryPerson.address.zip

  /**
   * Filing status
   * 1 = Single
   * 2 = Married Filing Jointly
   * 3 = Married Filing Separately
   * 4 = Head of Household
   * 5 = Qualifying Surviving Spouse
   */
  filingStatus = (): string | undefined => {
    const status = this.info.taxPayer.filingStatus
    switch (status) {
      case FilingStatus.S:
        return '1'
      case FilingStatus.MFJ:
        return '2'
      case FilingStatus.MFS:
        return '3'
      case FilingStatus.HOH:
        return '4'
      case FilingStatus.W:
        return '5'
      default:
        return undefined
    }
  }

  // ===== Income Calculation =====

  /**
   * Line 3: Federal Adjusted Gross Income (from Form 1040, Line 11)
   */
  res3 = (): number | undefined => this.f1040.l11()

  /**
   * Line 4: Interest from U.S. obligations (exempt from MA tax)
   * TODO: Need to track this separately in the UI
   */
  res4 = (): number | undefined => undefined

  /**
   * Line 5: Other exempt income
   * TODO: Social Security, certain pensions
   */
  res5 = (): number | undefined => undefined

  /**
   * Line 6a: Personal exemption amount
   * Based on filing status
   */
  res6a = (): number => {
    const status = this.info.taxPayer.filingStatus
    return parameters.personalExemptions2024[status] ?? 0
  }

  /**
   * Line 6b: Number of dependents
   */
  res6b = (): number => this.info.taxPayer.dependents.length

  /**
   * Line 7: Dependent exemptions (Line 6b × $1,000)
   */
  res7 = (): number => this.res6b() * parameters.dependentExemption2024

  /**
   * Line 8a: Total exemptions (Line 6a + Line 7)
   */
  res8a = (): number => this.res6a() + this.res7()

  /**
   * Line 8b: Other deductions
   * TODO: Limited deductions allowed in MA
   */
  res8b = (): number | undefined => undefined

  /**
   * Line 9: Total deductions (Line 8a + Line 8b)
   */
  res9 = (): number => this.res8a() + (this.res8b() ?? 0)

  /**
   * Line 10: Massachusetts Adjusted Gross Income
   * (Line 3 - Line 4 - Line 5)
   */
  res10 = (): number => {
    const federalAGI = this.res3() ?? 0
    const exemptInterest = this.res4() ?? 0
    const otherExempt = this.res5() ?? 0
    return Math.max(0, federalAGI - exemptInterest - otherExempt)
  }

  /**
   * Line 11a: Massachusetts taxable income (Line 10 - Line 9)
   */
  res11a = (): number => {
    return Math.max(0, this.res10() - this.res9())
  }

  /**
   * Line 11b: Alternative calculation (not typically used)
   */
  res11b = (): number | undefined => undefined

  // ===== Tax Calculation =====

  /**
   * Line 14a: Part B income tax (5% of taxable income)
   * Most income is taxed at 5%
   */
  res14a = (): number => {
    const taxableIncome = this.res11a()
    return Math.round(taxableIncome * parameters.flatTaxRate * 100) / 100
  }

  /**
   * Line 14: Total Part B tax
   */
  res14 = (): number => this.res14a()

  /**
   * Line 15: Part C income tax (12% on short-term capital gains)
   * TODO: Need to separate short-term capital gains
   */
  res15 = (): number | undefined => undefined

  /**
   * Line 16: Part D income tax (5% on long-term capital gains)
   * TODO: Need to separate long-term capital gains
   */
  res16 = (): number | undefined => undefined

  /**
   * Line 17: Total Massachusetts income tax
   * (Line 14 + Line 15 + Line 16)
   */
  res17 = (): number => {
    return (
      this.res14() +
      (this.res15() ?? 0) +
      (this.res16() ?? 0)
    )
  }

  // ===== Credits (Lines 18-27 - mostly TODO) =====

  /**
   * Line 28a: Total credits
   * TODO: Implement various MA credits
   */
  res28a = (): number | undefined => undefined

  /**
   * Line 28b: Total tax after credits
   * (Line 17 - Line 28a)
   */
  res28b = (): number => {
    return Math.max(0, this.res17() - (this.res28a() ?? 0))
  }

  /**
   * Line 28: Tax after credits
   */
  res28 = (): number => this.res28b()

  // ===== Payments and Refund/Amount Due =====

  /**
   * Line 29: Use tax
   * TODO: Internet/mail order purchases
   */
  res29 = (): number | undefined => undefined

  /**
   * Line 30: Total tax and use tax
   * (Line 28 + Line 29)
   */
  res30 = (): number => this.res28() + (this.res29() ?? 0)

  /**
   * Line 31: Total payments
   * MA withholding + estimated payments
   */
  res31 = (): number => {
    const withholding = this.methods.stateWithholding()
    // TODO: Add estimated tax payments
    return withholding
  }

  /**
   * Line 32: Credits from other forms
   * TODO: Overpayment from prior year, etc.
   */
  res32 = (): number | undefined => undefined

  /**
   * Line 33: Total payments and credits
   * (Line 31 + Line 32)
   */
  res33 = (): number => this.res31() + (this.res32() ?? 0)

  /**
   * Line 35a: Overpayment (if Line 33 > Line 30)
   */
  res35a = (): number => {
    const payments = this.res33()
    const tax = this.res30()
    return Math.max(0, payments - tax)
  }

  /**
   * Line 35b: Amount to be refunded
   * (For now, same as overpayment - TODO: handle credits to next year)
   */
  res35b = (): number => this.res35a()

  /**
   * Line 35: Total refund
   */
  res35 = (): number => this.res35b()

  /**
   * Line 38a: Amount owed (if Line 30 > Line 33)
   */
  res38a = (): number => {
    const tax = this.res30()
    const payments = this.res33()
    return Math.max(0, tax - payments)
  }

  /**
   * Line 38b: Penalty
   * TODO: Underpayment penalty calculation
   */
  res38b = (): number | undefined => undefined

  /**
   * Line 38c: Interest
   * TODO: Interest calculation for late payment
   */
  res38c = (): number | undefined => undefined

  /**
   * Line 38: Total amount due
   * (Line 38a + Line 38b + Line 38c)
   */
  res38 = (): number => {
    return (
      this.res38a() +
      (this.res38b() ?? 0) +
      (this.res38c() ?? 0)
    )
  }

  // ===== Helper methods =====

  /**
   * Refund amount (for display)
   */
  refund = (): number => this.res35()

  /**
   * Amount due (for display)
   */
  amountDue = (): number => this.res38()

  /**
   * Payment or refund indicator
   */
  payment = (): number | undefined => {
    if (this.amountDue() > 0) {
      return this.amountDue()
    }
    return undefined
  }

  // ===== PDF Field Mapping =====

  fields = (): Field[] => [
    // Personal Information
    this.fname(),
    this.mi(),
    this.lname(),
    this.SSN(),
    this.Spfname(),
    this.Spmi(),
    this.Splname(),
    this.SSNSP(),
    this.madd(),
    this.city(),
    this.state(),
    this.zip(),
    this.filingStatus(),

    // Income
    this.res3(),
    this.res4(),
    this.res5(),

    // Deductions
    this.res6a(),
    this.res6b(),
    this.res7(),
    this.res8a(),
    this.res8b(),
    this.res9(),

    // Taxable Income
    this.res10(),
    this.res11a(),
    this.res11b(),

    // Tax Calculation
    this.res14a(),
    this.res14(),
    this.res15(),
    this.res16(),
    this.res17(),

    // Credits and Payments
    this.res28a(),
    this.res28b(),
    this.res28(),
    this.res29(),
    this.res30(),
    this.res31(),
    this.res32(),
    this.res33(),

    // Refund/Amount Due
    this.res35a(),
    this.res35b(),
    this.res35(),
    this.res38a(),
    this.res38b(),
    this.res38c(),
    this.res38()
  ]
}

export default MAForm1
