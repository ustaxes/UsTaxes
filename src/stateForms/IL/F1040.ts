import F1040 from '../../irsForms/F1040'
import { displayNumber, sumFields } from '../../irsForms/util'
import { Field } from '../../pdfFiller'
import { AccountType, FilingStatus, Information, State } from '../../redux/data'
import Form from '../Form'
import parameters from './Parameters'

const ssnParts = (ssn: string | undefined): [string, string, string] => [
  ssn?.slice(0, 3) ?? '',
  ssn?.slice(3, 5) ?? '',
  ssn?.slice(5) ?? ''
]

const phoneParts = (phone: string | undefined): [string, string] => {
  if (phone !== undefined) {
    return [phone.slice(0, 3), `${phone.slice(3, 6)}-${phone.slice(6)}`]
  }
  return ['', '']
}

class ILF1040 implements Form {
  state: State
  formName: string
  info: Information
  f1040: F1040

  constructor(info: Information, f1040: F1040) {
    this.state = 'IL'
    this.formName = 'IL-1040'
    this.info = info
    this.f1040 = f1040
  }

  /**
   * Federal adjusted gross income from your federal Form 1040 or 1040-SR,
   * line 11
   */
  l1 = (): number | undefined => this.f1040.l11()

  /**
   * Federally tax-exempt interest and dividend income from your federal Form 1040
   * or 1040-SR, line 2a
   */
  l2 = (): number | undefined => this.f1040.l2a()

  /**
   * Other additions (attach schedule M)
   * TODO
   */
  l3 = (): number | undefined => undefined

  /**
   * Total income, add lines 1 through 3.
   */
  l4 = (): number => sumFields([this.l1(), this.l2(), this.l3()])

  /**
   * Social security benefits and certain retirement plan income received
   * if included in line 1. Attach Page 1 of federal return
   * TODO
   */
  l5 = (): number | undefined => undefined

  /**
   * Illinois income tax overpayment included in federal FOrm 1040 or 1040-SR
   * schedule 1, line 1
   * TODO
   */
  l6 = (): number | undefined => undefined

  /**
   * Other subtractions, attach schedule M
   * TODO
   */
  l7 = (): number | undefined => undefined

  /**
   * Add lines 5, 6, and 7. This is the total of your subtractions.
   */
  l8 = (): number => sumFields([this.l5(), this.l6(), this.l7()])

  /**
   * Illinois base income, Subtract line 8 from line 4
   */
  l9 = (): number => this.l4() - this.l8()

  /**
   * Enter the exemption amount for you and your spouse.
   */
  l10a = (): number | undefined => undefined

  /**
   * You + spouse, 65 or older
   * TODO
   */
  l10bBoxes = (): [boolean, boolean] => [false, false]

  /**
   * Check if 65 or older
   */
  l10b = (): number =>
    this.l10bBoxes().filter((x) => x).length * parameters.seniorExemption

  /**
   * You + spouse, legally blind
   * TODO
   */
  l10cBoxes = (): [boolean, boolean] => [false, false]

  /**
   * Check if legally blind
   */
  l10c = (): number | undefined =>
    this.l10cBoxes().filter((x) => x).length * parameters.blindExemption

  /**
   * If you are claiming other dependents, enter the amount from Schedule IL-EIC, step 2, LIne 1
   * Attach Schedule IL-E/EIC
   * TODO
   */
  l10d = (): number | undefined => undefined

  /**
   * Edd lines 10a through 10d
   */
  l10 = (): number =>
    sumFields([this.l10a(), this.l10b(), this.l10c(), this.l10d()])

  /**
   * Residents, net income. Subtract line 10 from line 9
   * TODO: Nonresidents and part-year residents, enter the illinois net income from
   * schedule NR. Attach Schedule NR.
   */
  l11 = (): number => this.l9() - this.l10()

  /**
   * Residents, multiply line 11 by income tax rate. Cannot be less than zero.
   * Nonresidents and part-year residents, enter the tax from Schedule NR
   */
  l12 = (): number => this.l11() * parameters.taxRate

  /**
   * Recapture of investment tax credits, attach schedule 4255.
   * TODO
   */
  l13 = (): number | undefined => undefined

  /**
   * Income tax, add lines 12 and 13, cannot be less than zero.
   */
  l14 = (): number => sumFields([this.l12(), this.l13()])

  /**
   * Income tax paid to another state while an illinois resident
   * TODO
   */
  l15 = (): number | undefined => undefined

  /**
   * Property tax and K-12 education expense credit amount from Schedule ICR
   * Attach schedule ICR
   * TODO
   */
  l16 = (): number | undefined => undefined

  /**
   * Credit amount from Schedule 1299-C. Attach schedule 1299-C
   * TODO
   */
  l17 = (): number | undefined => undefined

  /**
   * Add lines 15, 16, 17. This is the total credits. Cannot exceed L14.
   */
  l18 = (): number =>
    Math.min(this.l14(), sumFields([this.l15(), this.l16(), this.l17()]))

  /**
   * Tax after nonrefundable credits. Subtract lnie 18 from line 14.
   */
  l19 = (): number => this.l14() - this.l18()

  /**
   *
   * Household employment tax.
   * TODO
   */
  l20 = (): number | undefined => undefined

  /**
   *
   * Use tax on internet, mail order, or other out-of-state purchases from UT worksheet or
   * UT table in the instructions. Do not leave blank.
   * TODO
   */
  l21 = (): number | undefined => undefined

  /**
   * Compasionate use of medical cannabis program act and sale of assets by by gaming licensee surcharges
   * TODO
   */
  l22 = (): number | undefined => undefined

  /**
   * Total tax. Add lines 19, 20, 21, 22
   */
  l23 = (): number =>
    sumFields([this.l19(), this.l20(), this.l21(), this.l22()])

  /**
   * Same as line 23
   */
  l24 = (): number =>
    sumFields([this.l19(), this.l20(), this.l21(), this.l22()])

  /**
   * Illinois income tax withheld, attach schedule IL-WIT
   * TODO
   */
  l25 = (): number | undefined => undefined

  /**
   * Estimated payments from forms IL-1040-ES and IL-505-I, including any
   * overpayment applied from a prior year return
   * TODO
   */
  l26 = (): number | undefined => undefined

  /**
   * Passthrough withholding
   * TODO
   */
  l27 = (): number | undefined => undefined

  /**
   * Earned income credit from Schedule IL-E/IC, step 4, line 8.
   * Attach Schedule IL-E/EIC
   * TODO
   */
  l28 = (): number | undefined => undefined

  /**
   * Total payments and refundable credits
   */
  l29 = (): number =>
    sumFields([this.l25(), this.l26(), this.l27(), this.l28()])

  /**
   * If line 29 is greater than line 24, subtract line 24 from line 29
   */
  l30 = (): number | undefined => {
    if (this.l29() > this.l24()) return this.l29() - this.l24()
  }

  /**
   * If line 24 is greater than line 29, subtract line 29 from line 24
   */
  l31 = (): number | undefined => {
    if (this.l24() > this.l29()) return this.l24() - this.l29()
  }

  /**
   * Late payment penalty for underpayment of estimated tax.
   */
  l32 = (): number | undefined => undefined

  /**
   * Check if at least two-thirds of your federal gross income is from farming
   */
  l32a = (): boolean => false

  /**
   * Check if you or your spouse are 65 or older and permanently living in a nursing home.
   */
  l32b = (): boolean => false

  /**
   * Check if your income was not received evenly during the year and you annualized your
   * income on Form IL-2210. Attach form IL-2210
   * TODO
   */
  l32c = (): boolean => false

  /**
   * Check if you were not required to file an Illinois individual income tax return in the
   * previous tax year.
   */
  l32d = (): boolean => false

  /**
   * Voluntary charitable donations. Attach schedele G.
   * TODO
   */
  l33 = (): number | undefined => undefined

  /**
   * Total penalty and donations. Add lines 32 and 33
   */
  l34 = (): number => sumFields([this.l32(), this.l33()])

  /**
   * If you have an amount on line 30 and this amount is greater than line 34, subtract line 34 from line 30
   * This is your overpayment
   */
  l35 = (): number | undefined => {
    const l30 = this.l30()
    const l34 = this.l34()
    if (l30 !== undefined && l30 > l34) {
      return l30 - l34
    }
  }

  /**
   * Amount from line 35 you want refunded to you.
   */
  l36 = (): number | undefined => this.l35()

  /**
   * Direct deposit
   */
  l37a = (): boolean =>
    this.l36() !== undefined && this.info.refund !== undefined

  /**
   * Refund by debit card
   * TODO or unsupported
   */
  l37b = (): boolean => false

  /**
   * Paper check
   */
  l37c = (): boolean =>
    this.l36() !== undefined && this.info.refund === undefined

  /**
   * Amount to be credited forward
   * TODO or unsupported
   */
  l38 = (): number | undefined => undefined

  /**
   * If you have an amount on line 31, add lines 31 and 34
   * or, if you have an amount on line 30 and this amount is less than
   * line 34, subtract line 30 from line 34. This is the amount you owe.
   */
  l39 = (): number | undefined => {
    const l30 = this.l30()
    const l31 = this.l31()
    const l34 = this.l34()
    if (l31 !== undefined) return sumFields([l31, l34])
    if (l30 !== undefined && l30 < l34) return l34 - l30
  }

  fields = (): Field[] => {
    const tp = this.info.taxPayer
    return [
      undefined,
      // fiscal year
      undefined,
      undefined,
      // Step 1: Personal information
      tp.primaryPerson?.firstName,
      tp.primaryPerson?.lastName,
      undefined, //  todo - taxpayer birth year
      ...ssnParts(tp.primaryPerson?.ssid),
      tp.spouse?.firstName,
      tp.spouse?.lastName,
      undefined, // todo - spouse birth year
      ...ssnParts(tp.spouse?.ssid),
      tp.primaryPerson?.address.address,
      tp.primaryPerson?.address.aptNo,
      undefined, // todo - county
      tp.primaryPerson?.address.city,
      tp.primaryPerson?.address.state ?? tp.primaryPerson?.address.province,
      tp.primaryPerson?.address.zip ?? tp.primaryPerson?.address.postalCode,
      tp.primaryPerson?.address.foreignCountry,
      // Order of checkboxes is funky, from left to right
      tp.filingStatus === FilingStatus.S,
      tp.primaryPerson?.isTaxpayerDependent,
      tp.spouse?.isTaxpayerDependent,
      false,
      // Step2: Income
      this.l1(),

      // true,
      // //      tp.filingStatus === FilingStatus.MFJ,
      // tp.filingStatus === FilingStatus.MFS,
      // tp.filingStatus === FilingStatus.W,
      // tp.filingStatus === FilingStatus.HOH,
      // undefined, // todo - part-year resident

      this.l2(),
      this.l3(),
      this.l4(),
      // Step 3: Base income
      this.l5(),
      this.l6(),
      this.l7(),
      undefined, // todo - schedule 1299-C
      this.l8(),
      this.l9(),
      // Step 4: Exemptions
      this.l10a(),
      ...this.l10bBoxes(),
      this.l10b(),
      ...this.l10cBoxes(),
      this.l10c(),
      this.l10d(),
      this.l10(),
      // Step 5
      this.l11(),
      displayNumber(this.l12()),
      this.l13(),
      displayNumber(this.l14()),
      // Step 6
      this.l15(),
      this.l16(),
      this.l17(),
      this.l18(),
      displayNumber(this.l19()),
      // Step 7
      this.l20(),
      this.l21(),
      this.l22(),
      displayNumber(this.l23()),
      displayNumber(this.l24()),
      // Step 8
      this.l25(),
      this.l26(),
      this.l27(),
      this.l28(),
      this.l29(),
      // Step 9
      this.l30(),
      displayNumber(this.l31()),
      // Step 10,
      this.l32(),
      this.l32a(),
      this.l32b(),
      this.l32c(),
      this.l32d(),
      this.l33(),
      this.l34(),
      // Step 11
      this.l35(),
      this.l36(),
      this.info.refund?.routingNumber,
      this.info.refund?.accountType === AccountType.checking,
      //      this.info.refund?.accountType === AccountType.savings,
      this.info.refund?.accountNumber,
      true, // refund method radio.
      this.l38(),
      // Step 12
      displayNumber(this.l39()),
      // Step 13
      undefined,
      undefined,
      ...phoneParts(this.info.taxPayer.contactPhoneNumber)
    ]
  }
}

const ilf1040 = (info: Information, f1040: F1040): ILF1040 =>
  new ILF1040(info, f1040)

export default ilf1040
