import { TaxPayer as TP } from 'ustaxes/core/data'
import Form, { FormTag } from './Form'
import { sumFields } from './util'
import TaxPayer from 'ustaxes/core/data/TaxPayer'
import F1040 from './F1040'

export default class Schedule2 extends Form {
  tag: FormTag = 'f1040s2'
  sequenceIndex = 2
  tp: TaxPayer
  f1040: F1040

  constructor(tp: TP, f1040: F1040) {
    super()
    this.tp = new TaxPayer(tp)
    this.f1040 = f1040
  }

  // Part I: Tax
  l1 = (): number | undefined => undefined // TODO: Alternative Minimum Tax (form 6251)
  l2 = (): number | undefined => undefined // TODO: excess advance premium tax credit repayment (form 8962)
  l3 = (): number => sumFields([this.l1(), this.l2()])

  // Part II: Other Tax
  l4 = (): number | undefined => undefined // TODO: self-employment tax (schedule SE)
  l5 = (): number | undefined => undefined // TODO: unreported FICA tax
  l6 = (): number | undefined => undefined // TODO: additional tax on retirement accounts
  l7 = (): number | undefined => undefined // TODO: total additional ss and medicare tax
  l8 = (): number | undefined => undefined // TODO: additional tax on IRAs or other tax favored accoutns, form 5329
  l9 = (): number | undefined => undefined // TODO: household employment taxes, schedule H
  l10 = (): number | undefined => undefined // repayment of firsttime homebuyer credit, form 5405
  l11 = (): number | undefined => this.f1040.f8959?.toSchedule2l11()
  l12 = (): number | undefined => this.f1040.f8960?.toSchedule2l12()
  l13 = (): number | undefined => undefined // TODO: uncollected ss and medicare or rrta tax on tips or group-term life insurance, w-2, box 12
  l14 = (): number | undefined => undefined // TODO - interest on tax due on installment income from the sale of residential lots and timeshares
  l15 = (): number | undefined => undefined //interest on the deferred tax on gain from certain installment sales with a sales price over 150000.
  l16 = (): number | undefined => undefined // recapture of low-income housing credit, form 8611

  // Other additional taxes:
  // TODO: Recapture of other credits. List type, form number, and
  // amount ▶
  l17aDesc = (): string | undefined => undefined
  l17a = (): number | undefined => undefined
  // TODO: Recapture of federal mortgage subsidy. If you sold your home in
  // 2021, see instructions
  l17b = (): number | undefined => undefined
  // TODO: Additional tax on HSA distributions. Attach Form 8889..
  l17c = (): number | undefined => undefined
  // TODO: Additional tax on an HSA because you didn’t remain an eligible
  // individual. Attach Form 8889
  l17d = (): number | undefined => undefined
  // TODO: Additional tax on Archer MSA distributions. Attach Form 8853
  l17e = (): number | undefined => undefined
  // TODO: Additional tax on Medicare Advantage MSA distributions. Attach
  // Form 8853
  l17f = (): number | undefined => undefined
  // TODO: Recapture of a charitable contribution deduction related to a
  // fractional interest in tangible personal property...17g
  l17g = (): number | undefined => undefined
  // TODO: Income you received from a nonqualified deferred compensation
  // plan that fails to meet the requirements of section 409A.17h
  l17h = (): number | undefined => undefined
  // TODO Compensation you received from a nonqualified deferred
  // compensation plan described in section 457A
  l17i = (): number | undefined => undefined
  // Section 72(m)(5) excess benefits tax
  l17j = (): number | undefined => undefined
  // TODO: Golden parachute payments
  l17k = (): number | undefined => undefined
  // Tax on accumulation distribution of trusts
  l17l = (): number | undefined => undefined
  // m Excise tax on insider stock compensation from an expatriated
  // corporation
  l17m = (): number | undefined => undefined
  // n Look-back interest under section 167(g) or 460(b) from Form
  // 8697 or 8866
  l17n = (): number | undefined => undefined
  // o Tax on non-effectively connected income for any part of the
  // year you were a nonresident alien from Form 1040-NR
  l17o = (): number | undefined => undefined
  // p Any interest from Form 8621, line 16f, relating to distributions
  // from, and dispositions of, stock of a section 1291 fund.. 17p
  l17p = (): number | undefined => undefined
  // q Any interest from Form 8621, line 24
  l17q = (): number | undefined => undefined
  // z Any other taxes. List type and amount ▶
  l17zDesc = (): string | undefined => undefined
  l17z = (): number | undefined => undefined
  // 18Total additional taxes. Add lines 17a through 17z.......18
  l18 = (): number =>
    sumFields([
      this.l17a(),
      this.l17b(),
      this.l17c(),
      this.l17d(),
      this.l17e(),
      this.l17f(),
      this.l17g(),
      this.l17h(),
      this.l17i(),
      this.l17j(),
      this.l17k(),
      this.l17l(),
      this.l17m(),
      this.l17n(),
      this.l17o(),
      this.l17p(),
      this.l17q(),
      this.l17z()
    ])
  // 19Additional tax from Schedule 8812
  l19 = (): number | undefined => this.f1040.schedule8812?.l40()
  // TODO: Section 965 net tax liability installment from Form 965-A. .
  l20 = (): number | undefined => undefined

  // Add lines 4, 7 through 16, 18, and 19. These are your total other taxes. Enter here
  l21 = (): number =>
    sumFields([
      this.l4(),
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l18(),
      this.l19()
    ])

  to1040l23 = (): number => this.l21()
  // and on Form 1040 or 1040-SR, line 23, or Form 1040-NR, line 23b

  fields = (): Array<string | number | boolean | undefined> => {
    return [
      this.tp.namesString(),
      this.tp.tp.primaryPerson?.ssid,

      this.l1(),
      this.l2(),
      this.l3(),

      this.l4(),
      this.l5(),
      this.l6(),
      this.l7(),
      this.l8(),
      this.l9(),
      this.l10(),
      this.l11(),
      this.l12(),
      this.l13(),
      this.l14(),
      this.l15(),
      this.l16(),
      this.l17aDesc(),
      this.l17a(),
      this.l17b(),
      this.l17c(),
      this.l17d(),
      this.l17e(),
      this.l17f(),
      this.l17g(),
      this.l17h(),
      this.l17i(),
      this.l17j(),
      this.l17k(),
      this.l17l(),
      this.l17m(),
      this.l17n(),
      this.l17o(),
      this.l17p(),
      this.l17q(),
      this.l17zDesc(),
      this.l17z(),
      this.l18(),
      this.l19(),
      this.l20(),
      this.l21()
    ]
  }
}
