import F1040Attachment from './F1040Attachment'
import {
  FilingStatus,
  PersonRole,
  F1099IntData,
  F1099DivData
} from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions, text } from 'ustaxes/core/pdfFiller'
import { amt } from '../data/federal'

type Part3 = Partial<{
  l12: number
  l13: number
  l14: number
  l15: number
  l16: number
  l17: number
  l18: number
  l19: number
  l20: number
  l21: number
  l22: number
  l23: number
  l24: number
  l25: number
  l26: number
  l27: number
  l28: number
  l29: number
  l30: number
  l31: number
  l32: number
  l33: number
  l34: number
  l35: number
  l36: number
  l37: number
  l38: number
  l39: number
  l40: number
}>

export default class F6251 extends F1040Attachment {
  tag: FormTag = 'f6251'
  sequenceIndex = 32

  isNeeded = (): boolean => {
    // See https://www.irs.gov/instructions/i6251

    // 1. Form 6251, line 7, is greater than line 10.
    if ((this.l7() ?? 0) > this.l10()) {
      return true
    }

    // TODO: 2. You claim any general business credit, and either line 6 (in Part I) of Form 3800 or line 25 of Form 3800 is more than zero.

    // TODO: 3. You claim the qualified electric vehicle credit (Form 8834), the personal use part of the alternative fuel vehicle refueling property credit (Form 8911), or the credit for prior year minimum tax (Form 8801).

    // 4. The total of Form 6251, lines 2c through 3, is negative and line 7 would be greater than line 10 if you didn’t take into account lines 2c through 3.
    const l2cTo3Total =
      (this.l2c() ?? 0) +
      (this.l2d() ?? 0) +
      (this.l2e() ?? 0) +
      (this.l2f() ?? 0) +
      (this.l2g() ?? 0) +
      (this.l2h() ?? 0) +
      (this.l2i() ?? 0) +
      (this.l2j() ?? 0) +
      (this.l2k() ?? 0) +
      (this.l2l() ?? 0) +
      (this.l2m() ?? 0) +
      (this.l2n() ?? 0) +
      (this.l2o() ?? 0) +
      (this.l2p() ?? 0) +
      (this.l2q() ?? 0) +
      (this.l2r() ?? 0) +
      (this.l2s() ?? 0) +
      (this.l2t() ?? 0) +
      (this.l3() ?? 0)
    if (l2cTo3Total < 0 && (this.l7(-l2cTo3Total) ?? 0) > this.l10())
      return true

    return false
  }
  
  l1a = (): number => {
    // find the difference between line 14 of 1040,
    // and line 37 of your Schedule 1-A (Form 1040).
    // not line 38, so not including other deductions from that schedule
    const obbba_ded = () => {
      if (this.f1040.schedule1A.isNeeded()) {
        return this.f1040.schedule1A.l37()
      }
      return 0
    }
    return this.f1040.l14() - obbba_ded()
  }

  /**
   * 2025 addition: senior deduction from Schedule 1-A line 35, treated as a
   * personal exemption adjustment to AMT income under §56(b)(5)(D).
   * Shown separately on Form 6251 line 1b for display; the net of l1 already
   * incorporates this deduction via F1040.l15().
   */
  l1b = (): number | undefined => {
    const sa = this.f1040.schedule1A
    return sa.isNeeded() && sa.l35() > 0 ? -sa.l35() : undefined
  }

  // If I am understanding this correctly, this is just
  // line 15 from the 1040 minus the l37 from Schedule A
  l1b = (): number => {
    return this.f1040.l11b() - this.l1a()
  }

  l2a = (): number | undefined => {
    if (this.f1040.scheduleA.isNeeded()) {
      return this.f1040.scheduleA.l7()
    }
    return this.f1040.l12()
  }

  l2b = (): number | undefined => {
    return (this.f1040.schedule1.l1() ?? 0) + this.f1040.schedule1.l8z()
  }

  l2c = (): number | undefined =>
    this.f1040.info.amtAdjustments?.investmentInterestExpense

  l2d = (): number | undefined => this.f1040.info.amtAdjustments?.depletion

  l2e = (): number | undefined => {
    return Math.abs(this.f1040.schedule1.l8a() ?? 0)
  }

  l2f = (): number | undefined =>
    this.f1040.info.amtAdjustments?.atnold !== undefined
      ? -this.f1040.info.amtAdjustments.atnold
      : undefined
  /** Interest from specified private activity bonds (1099-INT box 9 and 1099-DIV box 6). */
  l2g = (): number | undefined => {
    const fromInt = this.f1040.info.f1099s
      .filter((f) => f.type === 'INT')
      .reduce(
        (sum, f) =>
          sum +
          ((f.form as F1099IntData).specifiedPrivateActivityBondInterest ?? 0),
        0
      )
    const fromDiv = this.f1040.info.f1099s
      .filter((f) => f.type === 'DIV')
      .reduce(
        (sum, f) =>
          sum +
          ((f.form as F1099DivData).specifiedPrivateActivityBondInterest ?? 0),
        0
      )
    const total = fromInt + fromDiv
    return total > 0 ? total : undefined
  }
  l2h = (): number | undefined =>
    this.f1040.info.amtAdjustments?.qualifiedSmallBusinessStock

  // Exercise of incentive stock options (excess of AMT income over regular tax income)
  l2i = (): number | undefined => {
    let f3921s = this.f1040.info.f3921s
    if (this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS) {
      f3921s = f3921s.filter((w2) => w2.personRole === PersonRole.PRIMARY)
    }
    return f3921s.reduce(
      (amount, f) => (f.fmv - f.exercisePricePerShare) * f.numShares + amount,
      0
    )
  }

  l2j = (): number | undefined =>
    this.f1040.info.amtAdjustments?.estatesAndTrustsK1
  l2k = (): number | undefined =>
    this.f1040.info.amtAdjustments?.propertyDisposition
  l2l = (): number | undefined => this.f1040.info.amtAdjustments?.depreciation
  l2m = (): number | undefined =>
    this.f1040.info.amtAdjustments?.passiveActivities
  l2n = (): number | undefined =>
    this.f1040.info.amtAdjustments?.lossLimitations
  l2o = (): number | undefined =>
    this.f1040.info.amtAdjustments?.circulationCosts
  l2p = (): number | undefined =>
    this.f1040.info.amtAdjustments?.longTermContracts
  l2q = (): number | undefined => this.f1040.info.amtAdjustments?.miningCosts
  l2r = (): number | undefined =>
    this.f1040.info.amtAdjustments?.researchAndExperimentalCosts
  l2s = (): number | undefined =>
    this.f1040.info.amtAdjustments?.installmentSales
  l2t = (): number | undefined =>
    this.f1040.info.amtAdjustments?.intangibleDrillingCosts

  l3 = (): number | undefined =>
    this.f1040.info.amtAdjustments?.otherAdjustments

  l4 = (additionalAmount = 0): number | undefined =>
    additionalAmount +
    (this.l1b() ?? 0) +
    (this.l2a() ?? 0) -
    (this.l2b() ?? 0) +
    (this.l2c() ?? 0) +
    (this.l2d() ?? 0) +
    (this.l2e() ?? 0) -
    (this.l2f() ?? 0) +
    (this.l2g() ?? 0) +
    (this.l2h() ?? 0) +
    (this.l2i() ?? 0) +
    (this.l2j() ?? 0) +
    (this.l2k() ?? 0) +
    (this.l2l() ?? 0) +
    (this.l2m() ?? 0) +
    (this.l2n() ?? 0) +
    (this.l2o() ?? 0) +
    (this.l2p() ?? 0) +
    (this.l2q() ?? 0) +
    (this.l2r() ?? 0) -
    (this.l2s() ?? 0) +
    (this.l2t() ?? 0) +
    (this.l3() ?? 0)

  l5 = (additionalAmount = 0): number | undefined => {
    const l4 = this.l4(additionalAmount) ?? 0
    return amt.excemption(this.f1040.info.taxPayer.filingStatus, l4)
  }

  l6 = (additionalAmount = 0): number =>
    Math.max(
      0,
      (this.l4(additionalAmount) ?? 0) - (this.l5(additionalAmount) ?? 0)
    )

  requiresPartIII = (): boolean => {
    // If you reported capital gain distributions directly on Form 1040 or 1040-SR, line 7;
    // you reported qualified dividends on Form 1040 or 1040-SR, line 3a;
    // or you had a gain on both lines 15 and 16 of Schedule D (Form 1040) (as refigured for the AMT, if necessary),
    // complete Part III on the back and enter the amount from line 40 here.
    return (
      this.f1040.l7() !== undefined ||
      this.f1040.l3a() !== undefined ||
      (this.f1040.scheduleD.l15() > 0 && this.f1040.scheduleD.l16() > 0)
    )
  }

  l7 = (additionalAmount = 0): number | undefined => {
    const l6 = this.l6(additionalAmount)
    if (l6 === 0) {
      return 0
    }

    // TODO: Handle Form 2555
    const f2555 = this.f1040.f2555
    if (
      f2555 !== undefined &&
      (f2555.l36() > 0 || f2555.l42() > 0 || f2555.l50() > 0)
    ) {
      // TODO: Foreign Earned Income Tax Worksheet—Line 7
    }

    // Use line 40 if Part III is required
    if (this.requiresPartIII()) {
      return this.part3().l40
    }

    const cap = amt.cap(this.f1040.info.taxPayer.filingStatus)

    if (l6 <= cap) {
      return l6 * 0.26
    }
    return (
      l6 * 0.28 -
      (this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS ? 2391 : 4782)
    )
  }

  l8 = (): number | undefined =>
    this.f1040.info.amtAdjustments?.foreignTaxCredit

  l9 = (additionalAmount = 0): number => {
    const l6 = this.l6(additionalAmount)
    if (l6 === 0) {
      return 0
    }
    return (this.l7(additionalAmount) ?? 0) - (this.l8() ?? 0)
  }

  // Add Form 1040 or 1040-SR, line 16 (minus any tax from Form 4972),
  // and Schedule 2 (Form 1040), line 1z.
  // Subtract from the result Schedule 3 (Form 1040), line 1
  // and any negative amount reported on Form 8978, line 14 (treated as a positive number).
  // If zero or less, enter -0-.
  // TODO: If you used Schedule J to figure your tax on Form 1040 or 1040-SR, line 16, refigure that tax without using Schedule J before completing this line. See instructions
  l10 = (): number => {
    const f1040L16 = this.f1040.l16() ?? 0
    const f4972 = this.f1040.f4972?.tax() ?? 0
    const sch2L2 = this.f1040.schedule2.l1z()
    const sch3L1 = this.f1040.schedule3.l1() ?? 0
    const f8978L14 = Math.abs(0) // TODO: Form 8978
    return Math.max(0, f1040L16 - f4972 + sch2L2 - sch3L1 - f8978L14)
  }

  l11 = (): number => {
    const l6 = this.l6()
    if (l6 === 0) {
      return 0
    }
    return Math.max(0, this.l9() - this.l10())
  }

  part3 = (): Part3 => {
    if (!this.requiresPartIII()) {
      return {}
    }
    const fs = this.f1040.info.taxPayer.filingStatus
    const qdivWorksheet = this.f1040.qualifiedAndCapGainsWorksheet
    const schDWksht = this.f1040.scheduleD.taxWorksheet
    const usingTaxWorksheet = schDWksht.isNeeded()

    const l18Consts: [number, number] = (() => {
      if (this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS) {
        return [119550, 2391]
      }
      return [239100, 4782]
    })()

    const l19Value: { [k in FilingStatus]: number } = {
      [FilingStatus.MFJ]: 96700,
      [FilingStatus.W]: 96700,
      [FilingStatus.S]: 48350,
      [FilingStatus.MFS]: 48350,
      [FilingStatus.HOH]: 64750
    }

    const l25Value: { [k in FilingStatus]: number } = {
      [FilingStatus.MFJ]: 600050,
      [FilingStatus.W]: 600050,
      [FilingStatus.S]: 533400,
      [FilingStatus.MFS]: 300000,
      [FilingStatus.HOH]: 566700
    }

    const l12 = this.l6()

    // TODO - for F2555, see the instructions for amount
    const l13: number = (() => {
      if (usingTaxWorksheet) {
        return schDWksht.l13() ?? 0
      }

      return qdivWorksheet?.l4() ?? 0
    })()

    const l14 = this.f1040.scheduleD.l19() ?? 0

    const l15 = (() => {
      if (!usingTaxWorksheet) {
        return l13
      }
      return Math.min(l13 + l14, schDWksht.l10() ?? 0)
    })()

    const l16 = Math.min(l12, l15)

    const l17 = l12 - l16

    const l18 = (() => {
      const [c1, c2] = l18Consts

      if (l17 <= c1) {
        return l17 * 0.26
      }
      return l17 * 0.28 - c2
    })()

    const l19 = l19Value[fs]

    const l20 = (() => {
      if (usingTaxWorksheet) {
        return schDWksht.l14() ?? 0
      }

      if (qdivWorksheet !== undefined) {
        return qdivWorksheet.l5()
      }

      return Math.max(0, this.f1040.l15())
    })()

    const l21 = Math.max(0, l19 - l20)

    const l22 = Math.min(l12, l13)

    const l23 = Math.min(l21, l22)

    const l24 = Math.max(0, l22 - l23)

    const l25 = l25Value[fs]

    const l26 = l21

    // TODO - see instructions for F2555
    const l27 = (() => {
      if (usingTaxWorksheet) {
        return schDWksht.l21() ?? 0
      }

      if (qdivWorksheet !== undefined) {
        return qdivWorksheet.l5()
      }

      return Math.max(0, this.f1040.l15())
    })()

    const l28 = l26 + l27

    const l29 = Math.max(0, l25 - l28)

    const l30 = Math.min(l24, l29)

    const l31 = l30 * 0.15

    const l32 = l23 + l30

    const l33 = l22 - l32

    const l34 = l33 * 0.2

    const l35 = l17 + l32 + l33

    const l36 = l12 - l35

    const l37 = l36 * 0.25

    const l38 = l18 + l31 + l34 + l37

    const l39 = (() => {
      // numbers referenced here are the same as l18.
      const [c1, c2] = l18Consts
      if (l12 <= c1) {
        return l12 * 0.26
      }
      return l12 * 0.28 - c2
    })()

    const l40 = Math.min(l38, l39)

    return {
      l12,
      l13,
      l14,
      l15,
      l16,
      l17,
      l18,
      l19,
      l20,
      l21,
      l22,
      l23,
      l24,
      l25,
      l26,
      l27,
      l28,
      l29,
      l30,
      l31,
      l32,
      l33,
      l34,
      l35,
      l36,
      l37,
      l38,
      l39,
      l40
    }
  }

  fields = (): Field[] => {
    const p3 = this.part3()
    return [
      this.f1040.namesString(),
      this.f1040.info.taxPayer.primaryPerson.ssid,
      // Part I
      this.l1a(),
      this.l1b(),
      this.l2a(),
      this.l2b(),
      this.l2c(),
      this.l2d(),
      this.l2e(),
      this.l2f(),
      this.l2g(),
      this.l2h(),
      this.l2i(),
      this.l2j(),
      this.l2k(),
      this.l2l(),
      this.l2m(),
      this.l2n(),
      this.l2o(),
      this.l2p(),
      this.l2q(),
      this.l2r(),
      this.l2s(),
      this.l2t(),
      this.l3(),
      this.l4(),
      // Part II
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      // Part III
      p3.l12,
      p3.l13,
      p3.l14,
      p3.l15,
      p3.l16,
      p3.l17,
      p3.l18,
      p3.l19,
      p3.l20,
      p3.l21,
      p3.l22,
      p3.l23,
      p3.l24,
      p3.l25,
      p3.l26,
      p3.l27,
      p3.l28,
      p3.l29,
      p3.l30,
      p3.l31,
      p3.l32,
      p3.l33,
      p3.l34,
      p3.l35,
      p3.l36,
      p3.l37,
      p3.l38,
      p3.l39,
      p3.l40
    ]
  }

  // Generated from Y2025 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // 62 TS expressions, 62 PDF fields
  fillInstructions = (): FillInstructions => {
    const p3 = this.part3()
    return [
      text('topmostSubform[0].Page1[0].f1_1[0]', this.f1040.namesString()),
      text(
        'topmostSubform[0].Page1[0].f1_2[0]',
        this.f1040.info.taxPayer.primaryPerson.ssid
      ),
      text('topmostSubform[0].Page1[0].f1_3[0]', this.l1a()),
      text('topmostSubform[0].Page1[0].f1_4[0]', this.l2a()),
      text('topmostSubform[0].Page1[0].f1_5[0]', this.l2b()),
      text('topmostSubform[0].Page1[0].f1_6[0]', this.l2c()),
      text('topmostSubform[0].Page1[0].f1_7[0]', this.l2d()),
      text('topmostSubform[0].Page1[0].f1_8[0]', this.l2e()),
      text('topmostSubform[0].Page1[0].f1_9[0]', this.l2f()),
      text('topmostSubform[0].Page1[0].f1_10[0]', this.l2g()),
      text('topmostSubform[0].Page1[0].f1_11[0]', this.l2h()),
      text('topmostSubform[0].Page1[0].f1_12[0]', this.l2i()),
      text('topmostSubform[0].Page1[0].f1_13[0]', this.l2j()),
      text('topmostSubform[0].Page1[0].f1_14[0]', this.l2k()),
      text('topmostSubform[0].Page1[0].f1_15[0]', this.l2l()),
      text('topmostSubform[0].Page1[0].f1_16[0]', this.l2m()),
      text('topmostSubform[0].Page1[0].f1_17[0]', this.l2n()),
      text('topmostSubform[0].Page1[0].f1_18[0]', this.l2o()),
      text('topmostSubform[0].Page1[0].f1_19[0]', this.l2p()),
      text('topmostSubform[0].Page1[0].f1_20[0]', this.l2q()),
      text('topmostSubform[0].Page1[0].f1_21[0]', this.l2r()),
      text('topmostSubform[0].Page1[0].f1_22[0]', this.l2s()),
      text('topmostSubform[0].Page1[0].f1_23[0]', this.l2t()),
      text('topmostSubform[0].Page1[0].f1_24[0]', this.l3()),
      text('topmostSubform[0].Page1[0].f1_25[0]', this.l4()),
      text('topmostSubform[0].Page1[0].f1_26[0]', this.l5()),
      text('topmostSubform[0].Page1[0].f1_27[0]', this.l6()),
      text('topmostSubform[0].Page1[0].f1_28[0]', this.l7()),
      text('topmostSubform[0].Page1[0].f1_29[0]', this.l8()),
      text('topmostSubform[0].Page1[0].f1_30[0]', this.l9()),
      text('topmostSubform[0].Page1[0].f1_31[0]', this.l10()),
      text('topmostSubform[0].Page1[0].f1_32[0]', this.l11()),
      text('topmostSubform[0].Page1[0].f1_33[0]', this.l1b()),
      text('topmostSubform[0].Page2[0].f2_1[0]', p3.l12),
      text('topmostSubform[0].Page2[0].f2_2[0]', p3.l13),
      text('topmostSubform[0].Page2[0].f2_3[0]', p3.l14),
      text('topmostSubform[0].Page2[0].f2_4[0]', p3.l15),
      text('topmostSubform[0].Page2[0].f2_5[0]', p3.l16),
      text('topmostSubform[0].Page2[0].f2_6[0]', p3.l17),
      text('topmostSubform[0].Page2[0].f2_7[0]', p3.l18),
      text('topmostSubform[0].Page2[0].f2_8[0]', p3.l19),
      text('topmostSubform[0].Page2[0].f2_9[0]', p3.l20),
      text('topmostSubform[0].Page2[0].f2_10[0]', p3.l21),
      text('topmostSubform[0].Page2[0].f2_11[0]', p3.l22),
      text('topmostSubform[0].Page2[0].f2_12[0]', p3.l23),
      text('topmostSubform[0].Page2[0].f2_13[0]', p3.l24),
      text('topmostSubform[0].Page2[0].f2_14[0]', p3.l25),
      text('topmostSubform[0].Page2[0].f2_15[0]', p3.l26),
      text('topmostSubform[0].Page2[0].f2_16[0]', p3.l27),
      text('topmostSubform[0].Page2[0].f2_17[0]', p3.l28),
      text('topmostSubform[0].Page2[0].f2_18[0]', p3.l29),
      text('topmostSubform[0].Page2[0].f2_19[0]', p3.l30),
      text('topmostSubform[0].Page2[0].f2_20[0]', p3.l31),
      text('topmostSubform[0].Page2[0].f2_21[0]', p3.l32),
      text('topmostSubform[0].Page2[0].f2_22[0]', p3.l33),
      text('topmostSubform[0].Page2[0].f2_23[0]', p3.l34),
      text('topmostSubform[0].Page2[0].f2_24[0]', p3.l35),
      text('topmostSubform[0].Page2[0].f2_25[0]', p3.l36),
      text('topmostSubform[0].Page2[0].f2_26[0]', p3.l37),
      text('topmostSubform[0].Page2[0].f2_27[0]', p3.l38),
      text('topmostSubform[0].Page2[0].f2_28[0]', p3.l39),
      text('topmostSubform[0].Page2[0].f2_29[0]', p3.l40)
    ]
  }
}
