import F1040Attachment from './F1040Attachment'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import SDQualifiedAndCapGains from './worksheets/SDQualifiedAndCapGains'
import { Field } from 'ustaxes/core/pdfFiller'

export default class F6251 extends F1040Attachment {
  tag: FormTag = 'f6251'
  sequenceIndex = 72

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

  l1 = (): number | undefined => {
    const l15 = this.f1040.l15()
    if (l15 !== 0) {
      return l15
    }
    return this.f1040.l11() - this.f1040.l14()
  }

  l2a = (): number | undefined => {
    if (this.f1040.scheduleA) {
      return this.f1040.scheduleA.l7()
    }
    return this.f1040.l12a()
  }

  l2b = (): number | undefined => {
    return (
      (this.f1040.schedule1?.l1() ?? 0) + (this.f1040.schedule1?.l8z() ?? 0)
    )
  }

  // TODO: Investment interest expense (difference between regular tax and AMT)
  l2c = (): number | undefined => undefined

  // TODO: Depletion (difference between regular tax and AMT)
  l2d = (): number | undefined => undefined

  l2e = (): number | undefined => {
    return Math.abs(this.f1040.schedule1?.l8a() ?? 0)
  }

  // TODO: Alternative tax net operating loss deduction
  l2f = (): number | undefined => undefined
  // TODO: Interest from specified private activity bonds exempt from the regular tax
  l2g = (): number | undefined => undefined
  // TODO: Qualified small business stock, see instructions
  l2h = (): number | undefined => undefined

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

  // TODO: Estates and trusts (amount from Schedule K-1 (Form 1041), box 12, code A)
  l2j = (): number | undefined => undefined
  // TODO: Disposition of property (difference between AMT and regular tax gain or loss)
  l2k = (): number | undefined => undefined
  // TODO: Depreciation on assets placed in service after 1986 (difference between regular tax and AMT)
  l2l = (): number | undefined => undefined
  // TODO: Passive activities (difference between AMT and regular tax income or loss)
  l2m = (): number | undefined => undefined
  // TODO: Loss limitations (difference between AMT and regular tax income or loss)
  l2n = (): number | undefined => undefined
  // TODO: Circulation costs (difference between regular tax and AMT)
  l2o = (): number | undefined => undefined
  // TODO: Long-term contracts (difference between AMT and regular tax income)
  l2p = (): number | undefined => undefined
  // TODO: Mining costs (difference between regular tax and AMT)
  l2q = (): number | undefined => undefined
  // TODO: Research and experimental costs (difference between regular tax and AMT)
  l2r = (): number | undefined => undefined
  // TODO: Income from certain installment sales before January 1, 1987
  l2s = (): number | undefined => undefined
  // TODO: Intangible drilling costs preference
  l2t = (): number | undefined => undefined

  // TODO: Other adjustments, including income-based related adjustments
  l3 = (): number | undefined => undefined

  l4 = (additionalAmount = 0): number | undefined =>
    additionalAmount +
    (this.l1() ?? 0) +
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
    switch (this.f1040.info.taxPayer.filingStatus) {
      case FilingStatus.S:
        if (l4 <= 523600) {
          return 73600
        }
        break
      case FilingStatus.MFJ:
        if (l4 <= 1047200) {
          return 114600
        }
        break
      case FilingStatus.MFS:
        if (l4 <= 523600) {
          return 57300
        } else {
          return 57300
        }
        break
    }
    // TODO: Handle "Exemption Worksheet"
    return undefined
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
      ((this.f1040.scheduleD?.l15() ?? 0) > 0 &&
        (this.f1040.scheduleD?.l16() ?? 0) > 0)
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
      return this.l40()
    }

    const cap =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS
        ? 99950
        : 199900
    if (l6 <= cap) {
      return l6 * 0.26
    }
    return l6 * 0.28
  }

  // TODO: Alternative minimum tax foreign tax credit
  l8 = (): number | undefined => undefined

  l9 = (additionalAmount = 0): number => {
    const l6 = this.l6(additionalAmount)
    if (l6 === 0) {
      return 0
    }
    return (this.l7(additionalAmount) ?? 0) - (this.l8() ?? 0)
  }

  // Add Form 1040 or 1040-SR, line 16 (minus any tax from Form 4972),
  // and Schedule 2 (Form 1040), line 2.
  // Subtract from the result Schedule 3 (Form 1040), line 1
  // and any negative amount reported on Form 8978, line 14 (treated as a positive number).
  // If zero or less, enter -0-.
  // TODO: If you used Schedule J to figure your tax on Form 1040 or 1040-SR, line 16, refigure that tax without using Schedule J before completing this line. See instructions
  l10 = (): number => {
    const f1040L16 = this.f1040.l16() ?? 0
    const f4972 = this.f1040.f4972?.tax() ?? 0
    const sch2L2 = this.f1040.schedule2?.l2() ?? 0
    const sch3L1 = this.f1040.schedule3?.l1() ?? 0
    const f8978L14 = Math.abs(0) // TODO: Form 8978
    return Math.max(0, f1040L16 - f4972 + sch2L2 - sch3L1 - f8978L14)
  }

  l11 = (): number => {
    const l6 = this.l6()
    if (l6 === 0) {
      return 0
    }
    return Math.max(0, (this.l9() ?? 0) - (this.l10() ?? 0))
  }

  l12 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return this.l6()
  }

  l13 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    const schDWksht = this.f1040.scheduleD?.rateGainWorksheet
    if (schDWksht) {
      const amount = schDWksht.l13()
      if (amount != undefined) {
        return amount
      }
    }

    const filingStatus = this.f1040.info.taxPayer.filingStatus
    if (filingStatus !== undefined) {
      const wksht = new SDQualifiedAndCapGains(this.f1040)
      return wksht.l4()
    }

    return undefined
  }

  l14 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    return this.f1040.scheduleD?.l14()
  }

  l15 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    if (!this.f1040.scheduleD?.rateGainWorksheet) {
      return this.l13()
    }

    const l13And14 = (this.l13() ?? 0) + (this.l14() ?? 0)
    return Math.min(
      l13And14,
      this.f1040.scheduleD?.rateGainWorksheet.l10() ?? 0
    )
  }

  l16 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return Math.min(this.l12() ?? 0, this.l14() ?? 0)
  }

  l17 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return (this.l12() ?? 0) - (this.l16() ?? 0)
  }

  l18 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    const l17 = this.l17() ?? 0
    const cap =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS
        ? 99950
        : 199900
    if (l17 <= cap) {
      return l17 * 0.26
    }
    const subtract =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS ? 1999 : 3998
    return l17 * 0.28 - subtract
  }

  l19 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    switch (this.f1040.info.taxPayer.filingStatus) {
      case FilingStatus.MFS:
      case FilingStatus.S:
        return 40400
      case FilingStatus.MFJ:
      case FilingStatus.W:
        return 80800
      case FilingStatus.HOH:
        return 54100
    }

    return undefined
  }

  l20 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    const schDWksht = this.f1040.scheduleD?.rateGainWorksheet
    if (schDWksht) {
      const amount = schDWksht.l14()
      if (amount !== undefined) {
        return amount
      }
    }

    if (this.f1040.totalQualifiedDividends() > 0) {
      const wksht = new SDQualifiedAndCapGains(this.f1040)
      return wksht.l5()
    }

    return Math.max(0, this.f1040.l15() ?? 0)
  }

  l21 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    return Math.max(0, (this.l19() ?? 0) - (this.l20() ?? 0))
  }

  l22 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return Math.min(this.l12() ?? 0, this.l13() ?? 0)
  }

  l23 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return Math.min(this.l21() ?? 0, this.l22() ?? 0)
  }

  l24 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    return Math.max(0, (this.l22() ?? 0) - (this.l23() ?? 0))
  }

  l25 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    switch (this.f1040.info.taxPayer.filingStatus) {
      case FilingStatus.S:
        return 445850
      case FilingStatus.MFS:
        return 250800
      case FilingStatus.MFJ:
      case FilingStatus.W:
        return 501600
      case FilingStatus.HOH:
        return 473750
    }

    return undefined
  }

  l26 = (): number | undefined => this.l21()

  l27 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    const schDWksht = this.f1040.scheduleD?.rateGainWorksheet
    if (schDWksht) {
      const amount = schDWksht.l21()
      if (amount !== undefined) {
        return amount
      }
    }

    if (this.f1040.totalQualifiedDividends() > 0) {
      const wksht = new SDQualifiedAndCapGains(this.f1040)
      return wksht.l5()
    }

    return Math.max(0, this.f1040.l15() ?? 0)
  }

  l28 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return (this.l26() ?? 0) + (this.l27() ?? 0)
  }

  l29 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return Math.max(0, (this.l25() ?? 0) - (this.l28() ?? 0))
  }

  l30 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return Math.min(this.l24() ?? 0, this.l29() ?? 0)
  }

  l31 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return (this.l30() ?? 0) * 0.15
  }

  l32 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return (this.l23() ?? 0) + (this.l30() ?? 0)
  }

  l33 = (): number | undefined => {
    if (
      !this.requiresPartIII() ||
      (this.l12() ?? 0) - (this.l32() ?? 0) < 0.01
    ) {
      return undefined
    }
    return (this.l22() ?? 0) + (this.l32() ?? 0)
  }

  l34 = (): number | undefined => {
    const l33 = this.l33()
    if (l33 === undefined) {
      return undefined
    }
    return l33 * 0.2
  }

  l35 = (): number | undefined => {
    if ((this.l14() ?? 0) === 0) {
      return undefined
    }
    return (this.l17() ?? 0) + (this.l32() ?? 0) + (this.l33() ?? 0)
  }

  l36 = (): number | undefined => {
    if ((this.l14() ?? 0) === 0) {
      return undefined
    }
    return (this.l12() ?? 0) - (this.l35() ?? 0)
  }

  l37 = (): number | undefined => {
    if ((this.l14() ?? 0) === 0) {
      return undefined
    }
    return (this.l36() ?? 0) * 0.25
  }

  l38 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }
    return (
      (this.l18() ?? 0) +
      (this.l31() ?? 0) +
      (this.l34() ?? 0) +
      (this.l37() ?? 0)
    )
  }

  l39 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    const l12 = this.l12() ?? 0
    const cap =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS
        ? 99950
        : 199900
    if (l12 <= cap) {
      return l12 * 0.26
    }
    const subtract =
      this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS ? 1999 : 3998
    return l12 * 0.28 - subtract
  }

  l40 = (): number | undefined => {
    if (!this.requiresPartIII()) {
      return undefined
    }

    return Math.min(this.l38() ?? 0, this.l39() ?? 0)
  }

  fields = (): Field[] => [
    this.f1040.info.namesString(),
    this.f1040.info.taxPayer.primaryPerson?.ssid,
    // Part I
    this.l1(),
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
    this.l12(),
    this.l13(),
    this.l14(),
    this.l15(),
    this.l16(),
    this.l17(),
    this.l18(),
    this.l19(),
    this.l20(),
    this.l21(),
    this.l22(),
    this.l23(),
    this.l24(),
    this.l25(),
    this.l26(),
    this.l27(),
    this.l28(),
    this.l29(),
    this.l30(),
    this.l31(),
    this.l32(),
    this.l33(),
    this.l34(),
    this.l35(),
    this.l36(),
    this.l37(),
    this.l38(),
    this.l39(),
    this.l40()
  ]
}
