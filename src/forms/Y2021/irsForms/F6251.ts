import F1040Attachment from './F1040Attachment'
import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field } from 'ustaxes/core/pdfFiller'

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
      return this.part3().l40
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

  part3 = (): Part3 => {
    if (!this.requiresPartIII()) {
      return {}
    }
    const fs = this.f1040.info.taxPayer.filingStatus
    if (fs === undefined) {
      throw new Error('Filing status is undefined')
    }

    const qdivWorksheet = this.f1040.qualifiedAndCapGainsWorksheet
    const schDWksht = this.f1040.scheduleD?.taxWorksheet
    const usingTaxWorksheet = schDWksht !== undefined && schDWksht.isNeeded()

    const l18Consts: [number, number] = (() => {
      if (this.f1040.info.taxPayer.filingStatus === FilingStatus.MFS) {
        return [99950, 1999]
      }
      return [199900, 3998]
    })()

    const l19Value: { [k in FilingStatus]: number } = {
      [FilingStatus.MFJ]: 80800,
      [FilingStatus.W]: 80800,
      [FilingStatus.S]: 40400,
      [FilingStatus.MFS]: 40400,
      [FilingStatus.HOH]: 54100
    }

    const l25Value: { [k in FilingStatus]: number } = {
      [FilingStatus.MFJ]: 501600,
      [FilingStatus.W]: 501600,
      [FilingStatus.S]: 445860,
      [FilingStatus.MFS]: 250800,
      [FilingStatus.HOH]: 473750
    }

    const l12 = this.l6()

    // TODO - for F2555, see the instructions for amount
    const l13: number = (() => {
      if (usingTaxWorksheet) {
        return schDWksht.l13() ?? 0
      }

      return qdivWorksheet?.l4() ?? 0
    })()

    const l14 = this.f1040.scheduleD?.l19() ?? 0

    const l15 = (() => {
      if (!usingTaxWorksheet) {
        return l13
      }
      return Math.min(l13 + l14, schDWksht.l10() ?? 0)
    })()

    const l16 = Math.min(l12 ?? 0, l15 ?? 0)

    const l17 = (l12 ?? 0) - (l16 ?? 0)

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

    const l21 = Math.max(0, (l19 ?? 0) - (l20 ?? 0))

    const l22 = Math.min(l12 ?? 0, l13 ?? 0)

    const l23 = Math.min(l21 ?? 0, l22 ?? 0)

    const l24 = Math.max(0, (l22 ?? 0) - (l23 ?? 0))

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

    const l30 = Math.min(0, l24, l29)

    const l31 = l30 * 0.15

    const l32 = l23 + l30

    const l33 = l22 - l32

    const l34 = l33 * 0.2

    const l35 = l17 + l32 + l33

    const l36 = l12 - l35

    const l37 = l36 * 0.25

    const l38 = l17 + l31 + l34 + l37

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
}
