import Form, { FormMethods } from 'ustaxes/core/stateForms/Form'
import F1040 from '../../irsForms/F1040'
import {
  Field,
  FillInstructions,
  RadioSelect,
  checkbox,
  radio,
  text
} from 'ustaxes/core/pdfFiller'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { AccountType, FilingStatus, State } from 'ustaxes/core/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'
import parameters from './Parameters'
import ScheduleCA540 from './ScheduleCA540'
import CA3506 from './CA3506'
import CA3853 from './CA3853'

/**
 * Form 540 — California Resident Income Tax Return (2025).
 *
 * Not implemented (out of scope / data not collected):
 * - Schedule P (540) AMT (line 61) — a warning applies if federal Form
 *   6251 shows AMT
 * - CalEITC / Young Child / Foster Youth credits (lines 75-77)
 * - Use tax (line 91, reported as 0 / no use tax owed)
 * - Voluntary contributions
 * - County of residence (fill by hand)
 */
export default class CA540 extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State
  formOrder = 0
  methods: FormMethods
  scheduleCA: ScheduleCA540
  ca3506: CA3506
  ca3853: CA3853

  constructor(f1040: F1040) {
    super()
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = '540'
    this.state = 'CA'
    this.methods = new FormMethods(this)
    this.scheduleCA = new ScheduleCA540(f1040)
    this.ca3506 = new CA3506(f1040)
    this.ca3853 = new CA3853(f1040, this.scheduleCA)
  }

  attachments = (): Form[] => [
    ...(this.scheduleCA.isNeeded() ? [this.scheduleCA] : []),
    ...(this.ca3506.isNeeded() ? [this.ca3506] : []),
    ...(this.ca3853.isNeeded() ? [this.ca3853] : [])
  ]

  filingStatus = (): FilingStatus => this.info.taxPayer.filingStatus

  /** PDF radio option order: 1 Single, 2 MFJ, 4 HOH, 3 MFS, 5 QSS */
  filingStatusRadio = (): RadioSelect => {
    switch (this.filingStatus()) {
      case FilingStatus.S:
        return { select: 0 }
      case FilingStatus.MFJ:
        return { select: 1 }
      case FilingStatus.HOH:
        return { select: 2 }
      case FilingStatus.MFS:
        return { select: 3 }
      case FilingStatus.W:
        return { select: 4 }
    }
  }

  // Exemptions -----------------------------------------------------

  l6 = (): boolean => this.info.taxPayer.primaryPerson.isTaxpayerDependent

  l7Count = (): number => {
    if (this.l6()) return 0
    const fs = this.filingStatus()
    return fs === FilingStatus.MFJ || fs === FilingStatus.W ? 2 : 1
  }
  l7 = (): number => this.l7Count() * parameters.personalExemption

  l8Count = (): number =>
    [
      this.info.taxPayer.primaryPerson.isBlind,
      this.info.taxPayer.spouse?.isBlind ?? false
    ].filter((x) => x).length
  l8 = (): number => this.l8Count() * parameters.personalExemption

  l9Count = (): number =>
    [
      this.f1040.bornBeforeDate(),
      this.info.taxPayer.spouse !== undefined
        ? this.f1040.spouseBeforeDate()
        : false
    ].filter((x) => x).length
  l9 = (): number => this.l9Count() * parameters.personalExemption

  l10Count = (): number => this.info.taxPayer.dependents.length
  l10 = (): number => this.l10Count() * parameters.dependentExemption

  l11 = (): number => sumFields([this.l7(), this.l8(), this.l9(), this.l10()])

  // Taxable income -------------------------------------------------

  /** State wages: W-2 box 16 for California */
  l12 = (): number =>
    this.methods.stateW2s().reduce((sum, w2) => sum + (w2.stateWages ?? 0), 0)

  /** Federal AGI (federal Form 1040 line 11b) */
  l13 = (): number => this.f1040.l11b()

  /** CA adjustments — subtractions (Schedule CA Part I line 27 col B) */
  l14 = (): number => this.scheduleCA.l27B()

  l15 = (): number => this.l13() - this.l14()

  /** CA adjustments — additions (Schedule CA Part I line 27 col C) */
  l16 = (): number => this.scheduleCA.l27C()

  /** California AGI */
  l17 = (): number => this.l15() + this.l16()

  /** Larger of CA itemized deductions or CA standard deduction */
  l18 = (): number => this.scheduleCA.p2l30()

  /** Taxable income */
  l19 = (): number => Math.max(0, this.l17() - this.l18())

  // Tax ------------------------------------------------------------

  usedTaxTable = (): boolean => this.l19() <= parameters.taxTableLimit

  l31 = (): number => parameters.computeTax(this.filingStatus(), this.l19())

  /** Exemption credits, phased out for high federal AGI */
  l32 = (): number => {
    const reduction = parameters.exemptionReductionPerCredit(
      this.filingStatus(),
      this.l13()
    )
    if (reduction === 0) return this.l11()
    const personalCount = this.l7Count() + this.l8Count() + this.l9Count()
    const personal = Math.max(
      0,
      personalCount * (parameters.personalExemption - reduction)
    )
    const dependents = Math.max(
      0,
      this.l10Count() * (parameters.dependentExemption - reduction)
    )
    return personal + dependents
  }

  l33 = (): number => Math.max(0, this.l31() - this.l32())

  /** Tax from Schedule G-1 / FTB 5870A (not supported) */
  l34 = (): number => 0

  l35 = (): number => this.l33() + this.l34()

  // Special credits --------------------------------------------------

  /** Nonrefundable child and dependent care expenses credit (FTB 3506) */
  l40 = (): number | undefined =>
    this.ca3506.isNeeded() ? this.ca3506.l12() : undefined

  l43 = (): number | undefined => undefined
  l44 = (): number | undefined => undefined
  l45 = (): number | undefined => undefined

  /** Nonrefundable renter's credit */
  l46 = (): number | undefined => {
    if (this.info.caStateInfo?.qualifiesForRentersCredit !== true)
      return undefined
    const fs = this.filingStatus()
    if (this.l17() > parameters.rentersCredit.caAGILimit(fs)) return undefined
    return parameters.rentersCredit.amount(fs)
  }

  l47 = (): number =>
    sumFields([this.l40(), this.l43(), this.l44(), this.l45(), this.l46()])

  l48 = (): number => Math.max(0, this.l35() - this.l47())

  // Other taxes ------------------------------------------------------

  /**
   * Alternative minimum tax (Schedule P (540)) — not implemented.
   */
  l61 = (): number => 0

  /** Behavioral Health Services Tax: 1% of taxable income over $1M */
  l62 = (): number =>
    Math.round(
      Math.max(0, this.l19() - parameters.behavioralHealthTaxThreshold) *
        parameters.behavioralHealthTaxRate
    )

  l63 = (): number => 0

  /** Total tax */
  l64 = (): number =>
    sumFields([this.l48(), this.l61(), this.l62(), this.l63()])

  // Payments ---------------------------------------------------------

  /** California income tax withheld (W-2 box 17) */
  l71 = (): number => this.methods.stateWithholding()

  /** 2025 CA estimated tax payments */
  l72 = (): number | undefined => this.info.caStateInfo?.estimatedTaxPayments

  l73 = (): number | undefined => undefined
  l74 = (): number | undefined => undefined
  l75 = (): number | undefined => undefined
  l76 = (): number | undefined => undefined
  l77 = (): number | undefined => undefined

  l78 = (): number =>
    sumFields([
      this.l71(),
      this.l72(),
      this.l73(),
      this.l74(),
      this.l75(),
      this.l76(),
      this.l77()
    ])

  // Use tax, ISR penalty, balance --------------------------------------

  l91 = (): number => 0

  fullYearCoverage = (): boolean => this.ca3853.uncoveredMonths() === 0

  /** Individual Shared Responsibility Penalty (FTB 3853) */
  l92 = (): number => this.ca3853.penalty()

  l93 = (): number => Math.max(0, this.l78() - this.l91())
  l94 = (): number => Math.max(0, this.l91() - this.l78())
  l95 = (): number => Math.max(0, this.l93() - this.l92())
  l96 = (): number => Math.max(0, this.l92() - this.l93())
  l97 = (): number => Math.max(0, this.l95() - this.l64())
  l98 = (): number => 0
  l99 = (): number => this.l97() - this.l98()
  l100 = (): number => (this.l95() < this.l64() ? this.l64() - this.l95() : 0)

  l110 = (): number => 0
  l111 = (): number | undefined =>
    this.l99() > 0
      ? undefined
      : sumFields([this.l94(), this.l96(), this.l100(), this.l110()])
  l112 = (): number | undefined => undefined
  l113 = (): number | undefined => undefined
  l114 = (): number | undefined => this.l111()

  /** Refund */
  l115 = (): number =>
    Math.max(0, this.l99() - sumFields([this.l110(), this.l112(), this.l113()]))

  payment = (): number | undefined => this.l111()

  // Fill ----------------------------------------------------------------

  private formatDate = (d: Date | undefined): string | undefined => {
    if (d === undefined) return undefined
    const dt = new Date(d)
    const mm = (dt.getMonth() + 1).toString().padStart(2, '0')
    const dd = dt.getDate().toString().padStart(2, '0')
    return `${mm}/${dd}/${dt.getFullYear()}`
  }

  fillInstructions = (): FillInstructions => {
    const tp = this.info.taxPayer
    const primary = tp.primaryPerson
    const spouse = tp.spouse
    const address = primary.address
    const deps = tp.dependents
    const refund = this.info.refund
    const depositing = refund !== undefined && this.l115() > 0

    return [
      // Names, SSNs, address
      text('540_form_1003', primary.firstName),
      text('540_form_1005', primary.lastName),
      text('540_form_1007', primary.ssid),
      text('540_form_1008', spouse?.firstName),
      text('540_form_1010', spouse?.lastName),
      text('540_form_1012', spouse?.ssid),
      text('540_form_1015', address.address),
      text('540_form_1016', address.aptNo),
      text('540_form_1018', address.city),
      text('540_form_1019', address.state),
      text('540_form_1020', address.zip),
      text('540_form_1021', address.foreignCountry),
      text('540_form_1022', address.province),
      text('540_form_1023', address.postalCode),
      text('540_form_1024', this.formatDate(primary.dateOfBirth)),
      text('540_form_1025', this.formatDate(spouse?.dateOfBirth)),
      checkbox('540_form_1029 CB', true),
      // Filing status
      radio('540_form_1036 RB', this.filingStatusRadio()),
      text(
        '540_form_1037',
        this.filingStatus() === FilingStatus.MFS && spouse !== undefined
          ? `${spouse.ssid} ${spouse.firstName} ${spouse.lastName}`
          : undefined
      ),
      // Exemptions
      checkbox('540_form_1040 CB', this.l6()),
      text('540_form_1041', this.l7Count()),
      text('540_form_1042', this.l7()),
      text('540_form_1043', this.l8Count() > 0 ? this.l8Count() : undefined),
      text('540_form_1044', this.l8Count() > 0 ? this.l8() : undefined),
      text('540_form_1045', this.l9Count() > 0 ? this.l9Count() : undefined),
      text('540_form_1046', this.l9Count() > 0 ? this.l9() : undefined),
      // Dependents (first three fit on the form)
      text('540_form_2003', deps[0]?.firstName),
      text('540_form_2004', deps[0]?.lastName),
      text('540_form_2005', deps[0]?.ssid),
      text('540_form_2006', deps[0]?.relationship),
      text('540_form_2007', deps[1]?.firstName),
      text('540_form_2008', deps[1]?.lastName),
      text('540_form_2009', deps[1]?.ssid),
      text('540_form_2010', deps[1]?.relationship),
      text('540_form_2011', deps[2]?.firstName),
      text('540_form_2012', deps[2]?.lastName),
      text('540_form_2013', deps[2]?.ssid),
      text('540_form_2014', deps[2]?.relationship),
      text('540_form_2015', this.l10Count()),
      text('540_form_2016', this.l10()),
      text('540_form_2017', this.l11()),
      // Side 2 header
      text('540_form_2001', `${primary.firstName} ${primary.lastName}`),
      text('540_form_2002', primary.ssid),
      // Taxable income
      text('540_form_2018', this.l12()),
      text('540_form_2019', this.l13()),
      text('540_form_2020', this.l14()),
      text('540_form_2021', this.l15()),
      text('540_form_2022', this.l16()),
      text('540_form_2023', this.l17()),
      text('540_form_2024', this.l18()),
      text('540_form_2025', this.l19()),
      // Tax
      checkbox('540_form_2026 CB', this.usedTaxTable()),
      checkbox('540_form_2027 CB', !this.usedTaxTable()),
      text('540_form_2030', this.l31()),
      text('540_form_2031', this.l32()),
      text('540_form_2032', this.l33()),
      text('540_form_2035', this.l34()),
      text('540_form_2036', this.l35()),
      // Special credits
      text('540_form_2037', this.l40()),
      text('540_form_3003', this.l45()),
      text('540_form_3004', this.l46()),
      text('540_form_3005', this.l47()),
      text('540_form_3006', this.l48()),
      // Other taxes
      text('540_form_3007', this.l61()),
      text('540_form_3008', this.l62()),
      text('540_form_3009', this.l63()),
      text('540_form_3010', this.l64()),
      // Payments
      text('540_form_3011', this.l71()),
      text('540_form_3012', this.l72()),
      text('540_form_3018', this.l78()),
      // Use tax
      text('540_form_3019', this.l91()),
      radio('540_form_3020 RB', { select: 0 }),
      // ISR penalty
      checkbox('540_form_3021 CB', this.fullYearCoverage()),
      text('540_form_3022', this.l92() > 0 ? this.l92() : undefined),
      // Balance
      text('540_form_3023', this.l93()),
      text('540_form_3024', this.l94() > 0 ? this.l94() : undefined),
      text('540_form_3025', this.l95()),
      text('540_form_3026', this.l96() > 0 ? this.l96() : undefined),
      text('540_form_3027', this.l97()),
      text('540_form_4003', this.l98()),
      text('540_form_4004', this.l99()),
      text('540_form_4005', this.l100() > 0 ? this.l100() : undefined),
      text('540_form_4024', this.l110()),
      // Amount owed / interest
      text('540_form_5002', this.l111()),
      text('540_form_5006', this.l114()),
      // Refund and direct deposit
      text('540_form_5007', this.l115()),
      checkbox(
        '540_form_5009A CB',
        depositing && refund.accountType === AccountType.checking
      ),
      checkbox(
        '540_form_5009B CB',
        depositing && refund.accountType === AccountType.savings
      ),
      text('540_form_5008', depositing ? refund.routingNumber : undefined),
      text('540_form_5010', depositing ? refund.accountNumber : undefined),
      text('540_form_5011', depositing ? this.l115() : undefined),
      text('540_form_6002', tp.contactEmail),
      text('540_form_6003', tp.contactPhoneNumber)
    ]
  }

  fields = (): Field[] => this.fillInstructions().map((i) => i.value)
}

export const ca540 = (f1040: F1040): CA540 => new CA540(f1040)
