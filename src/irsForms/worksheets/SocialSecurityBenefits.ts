import { FilingStatus, TaxPayer, Information } from '../../redux/data'
import F1040 from '../F1040'
import { sumFields } from '../util'
import { SSBenefits } from 'ustaxes/data/federal'
import InformationMethods from 'ustaxes/redux/methods'

export default class SocialSecurityBenefitsWorksheet {
  state: InformationMethods
  tp: TaxPayer
  f1040: F1040

  constructor(state: Information, f1040: F1040) {
    this.state = new InformationMethods(state)
    this.f1040 = f1040
    this.tp = state.taxPayer
  }

  totalNetBenefits = (): number =>
    this.state
      .f1099ssas()
      .map((f) => f.form.netBenefits)
      .reduce((l, r) => l + r, 0)

  /* Enter the total amount from box 5 of all your Forms SSA-1099 and RRB-1099.
      Also enter this amount on Form 1040 or 1040-SR, line 6a
   */
  l1 = (): number => this.totalNetBenefits()
  // Multiply line 1 by 50% (0.50)
  l2 = (): number => this.l1() / 2
  /* If you are not excluding unemployment compensation from income,
      combine the amounts from Form 1040 or 1040-SR, lines 1, 2b, 3b, 4b, 5b, 7, and 8.
      If you are excluding unemployment compensation from income,
      combine the amounts from Form 1040 or 1040-SR , lines 1, 2b, 3b, 4b, 5b, 7,
      Schedule 1, lines 1 through 7, and line 3 of the Unemployment Compensation Exclusion Worksheet
   */
  l3 = (): number =>
    sumFields([
      this.f1040.l1(),
      this.f1040.l2b(),
      this.f1040.l3b(),
      this.f1040.l4b(),
      this.f1040.l5b(),
      this.f1040.l7(),
      this.f1040.l8()
    ])
  // Enter the amount, if any, from Form 1040 or 1040-SR, line 2a
  l4 = (): number | undefined => this.f1040.l2a()
  // Combine lines 2, 3, and 4
  l5 = (): number => sumFields([this.l2(), this.l3(), this.l4()])
  /* Enter the total of the amounts from Form 1040 or 1040-SR, line 10b, 
      Schedule 1, lines 10 through 19, 
      plus any write-in adjustments you entered on the dotted line next to Schedule 1, line 22
   */
  l6 = (): number =>
    sumFields([
      this.f1040.l10b(),
      this.f1040.schedule1?.l10(),
      this.f1040.schedule1?.l11(),
      this.f1040.schedule1?.l12(),
      this.f1040.schedule1?.l13(),
      this.f1040.schedule1?.l14(),
      this.f1040.schedule1?.l15(),
      this.f1040.schedule1?.l16(),
      this.f1040.schedule1?.l17(),
      this.f1040.schedule1?.l18(),
      this.f1040.schedule1?.l19(),
      this.f1040.schedule1?.l22writeIn()
    ])

  /* Line 7: Is the amount on line 6 less than the amount on line 5?
    If No, None of your social security benefits are taxable. Enter -0- on Form 1040 or 1040-SR, line 6b.
    If Yes, Subtract line 6 from line 5
  */

  l7 = (): number => {
    if (this.l6() < this.l5()) {
      return this.l5() - this.l6()
    } else {
      return 0
    }
  }
  /*
    If you are:
    Married filing jointly, enter $32,000
    Single, head of household, qualifying widow(er), or married filing
    separately and you lived apart from your spouse for all of 2020,
    enter $25,000
    Married filing separately and you lived with your spouse at any time
    in 2020, skip lines 8 through 15; multiply line 7 by 85% (0.85) and
    enter the result on line 16. Then, go to line 17
  */
  l8 = (): number => {
    if (this.tp.filingStatus == undefined) {
      return 0
    } else if (this.tp.filingStatus == FilingStatus.MFS) {
      // treat Married filing separately specially due to the extra question below
      // and resulting logic in the worksheet
      if (this.state.questions.LIVE_APART_FROM_SPOUSE) {
        return SSBenefits.caps[this.tp.filingStatus].l8
      } else {
        // Note that this value won't be taken into account. Instead,
        // the line 16 function will also check for this and perform
        // the right math.
        return 0
      }
    } else {
      return SSBenefits.caps[this.tp.filingStatus].l8
    }
  }
  /*
  Is the amount on line 8 less than the amount on line 7?
  
  If No, None of your social security benefits are taxable. 
  Enter -0- on Form 1040 or 1040-SR, line 6b. 
  If you are married filing separately and you lived apart from your spouse for all of 2020, 
  be sure you entered "D" to the right of the word "benefits" on line 6a.

  If Yes, Subtract line 8 from line 7.
  */
  l9 = (): number => {
    if (this.l8() < this.l7()) {
      return this.l7() - this.l8()
    } else {
      return 0
    }
  }

  /*
  Enter: $12,000 if married filing jointly; 
  $9,000 if single, head of household, qualifying widow(er), or married filing separately 
  and you lived apart from your spouse for all of 2020
  */
  l10 = (): number => {
    if (this.tp.filingStatus == undefined) {
      return 0
    }
    return SSBenefits.caps[this.tp.filingStatus].l10
  }

  // Subtract line 10 from line 9. If zero or less, enter -0-
  l11 = (): number => {
    const tmp = this.l9() - this.l10()
    if (tmp < 0) {
      return 0
    } else {
      return tmp
    }
  }

  // Enter the smaller of line 9 or line 10
  l12 = (): number => Math.min(this.l9(), this.l10())

  // Enter one-half of line 12
  l13 = (): number => this.l12() / 2

  // Enter the smaller of line 2 or line 13
  l14 = (): number => Math.min(this.l13(), this.l2())

  // Multiply line 11 by 85% (0.85). If line 11 is zero, enter -0-
  l15 = (): number => {
    if (this.l11() == 0) {
      return 0
    } else {
      return this.l11() * 0.85
    }
  }

  // Add lines 14 and 15
  l16 = (): number => {
    // From line 7 instructions:
    // Married filing separately and you lived with your spouse at any time
    // in 2020, skip lines 8 through 15; multiply line 7 by 85% (0.85) and
    // enter the result on line 16. Then, go to line 17
    if (
      this.tp.filingStatus == FilingStatus.MFS &&
      !this.state.questions.LIVE_APART_FROM_SPOUSE
    ) {
      return this.l7() * 0.85
    } else {
      return sumFields([this.l14(), this.l15()])
    }
  }

  // Multiply line 1 by 85% (0.85)
  l17 = (): number => this.l1() * 0.85

  // Taxable social security benefits. Enter the smaller of line 16 or line 17.
  // Also enter this amount on Form 1040 or 1040-SR, line 6b
  l18 = (): number => Math.min(this.l16(), this.l17())

  // This is the function used to return the taxable amount of the social security
  // benefits to be entered in line 6b of 1040. It takes into account the various
  // stopping points in the worksheet.
  taxableAmount = (): number => {
    const line7 = this.l7()
    if (line7 == 0) {
      return line7
    }

    const line9 = this.l9()
    if (line9 == 0) {
      return line9
    }

    return this.l18()
  }
}
