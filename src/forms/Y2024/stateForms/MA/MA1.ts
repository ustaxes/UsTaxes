/**
 * Massachusetts Form 1 - Income Tax Return
 * 2024 Tax Year
 */

import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import { Field } from 'ustaxes/core/pdfFiller'
import { State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import parameters from './Parameters'

export class MA1 extends Form {
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
    this.formName = 'Form-1'
    this.state = 'MA'
    this.methods = new FormMethods(this)
  }

  attachments = (): Form[] => {
    return []
  }

  /**
   * Line 3: Federal AGI from Form 1040
   */
  l3 = (): number => {
    return this.f1040.l11() // Federal AGI
  }

  /**
   * Line 14: MA AGI (simplified - same as federal AGI for most cases)
   */
  l14 = (): number => {
    return this.l3()
  }

  /**
   * Line 16: Personal exemptions
   * Single: $4,400
   * MFJ: $8,800
   * MFS: $4,400
   * HOH: $6,800
   */
  l16 = (): number => {
    const filingStatus = this.info.taxPayer.filingStatus
    return parameters.exemptions[filingStatus]
  }

  /**
   * Line 19: MA taxable income
   */
  l19 = (): number => {
    const maAGI = this.l14()
    const exemptions = this.l16()
    return Math.max(0, maAGI - exemptions)
  }

  /**
   * Line 28: MA tax (5% of taxable income)
   */
  l28 = (): number => {
    return Math.round(this.l19() * parameters.taxRate)
  }

  /**
   * Line 34: Total MA tax
   */
  l34 = (): number => {
    return this.l28()
  }

  /**
   * Line 39: MA withholding
   */
  l39 = (): number => {
    return this.methods.stateWithholding()
  }

  /**
   * Line 45: Total payments
   */
  l45 = (): number => {
    return this.l39()
  }

  /**
   * Line 46: Overpayment
   */
  l46 = (): number => {
    const payments = this.l45()
    const tax = this.l34()
    return Math.max(0, payments - tax)
  }

  /**
   * Line 52: Amount owed
   */
  l52 = (): number => {
    const tax = this.l34()
    const payments = this.l45()
    return Math.max(0, tax - payments)
  }

  fields = (): Field[] => {
    const tp = this.info.taxPayer
    const primary = tp.primaryPerson
    const spouse = tp.spouse

    return [
      // Header
      primary.firstName,
      primary.lastName,
      spouse?.firstName,
      spouse?.lastName,
      primary.ssid,
      spouse?.ssid,
      primary.address.address,
      primary.address.city,
      primary.address.state,
      primary.address.zip,

      // Filing status - must be explicit true/false for checkboxes
      tp.filingStatus === 'S', // Single
      tp.filingStatus === 'MFJ', // Married filing jointly
      tp.filingStatus === 'MFS', // Married filing separately
      tp.filingStatus === 'HOH', // Head of household
      tp.filingStatus === 'W', // Widow(er)

      // Income section
      this.l3(), // Line 3: Federal AGI
      undefined, // Lines 4-13: Adjustments (not implemented)
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.l14(), // Line 14: MA AGI
      undefined, // Line 15: Deductions
      this.l16(), // Line 16: Personal exemptions
      undefined, // Line 17: Additional exemptions
      undefined, // Line 18: Total exemptions
      this.l19(), // Line 19: MA taxable income

      // Tax calculation
      undefined, // Lines 20-27: Other income
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      this.l28(), // Line 28: MA tax
      undefined, // Lines 29-33: Credits
      undefined,
      undefined,
      undefined,
      undefined,
      this.l34(), // Line 34: Total MA tax

      // Payments
      undefined, // Lines 35-38: Other payments
      undefined,
      undefined,
      undefined,
      this.l39(), // Line 39: MA withholding
      undefined, // Lines 40-44: Other payments
      undefined,
      undefined,
      undefined,
      undefined,
      this.l45(), // Line 45: Total payments
      this.l46(), // Line 46: Overpayment
      undefined, // Lines 47-51: Refund options
      undefined,
      undefined,
      undefined,
      undefined,
      this.l52() // Line 52: Amount owed
    ]
  }
}

export default (f1040: F1040): MA1 => new MA1(f1040)
