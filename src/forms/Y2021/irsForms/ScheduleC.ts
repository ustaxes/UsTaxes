import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { sumFields } from 'ustaxes/core/irsForms/util'
import { Business } from 'ustaxes/core/data'

export default class ScheduleC extends F1040Attachment {
  tag: FormTag = 'f1040sc'
  sequenceIndex = 9

  businesses = (): Business[] => this.f1040.info.businesses ?? []

  isNeeded = (): boolean => this.businesses().length > 0

  sumBusinesses = (f: (b: Business) => number | undefined): number =>
    sumFields(this.businesses().map((b) => f(b)))

  totalExpenses = (b: Business): number => {
    const values = Object.values(b.expenses ?? {}) as Array<number | undefined>
    return sumFields(values)
  }

  l1 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.grossReceipts)

  l2 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.returnsAndAllowances)

  l6 = (): number | undefined =>
    this.sumBusinesses((b) => b.income.otherIncome ?? 0)

  l7 = (): number => sumFields([this.l1(), this.l6()]) - (this.l2() ?? 0)

  l28 = (): number => this.sumBusinesses((b) => this.totalExpenses(b))

  l29 = (): number => this.l7() - this.l28()

  l30 = (): number | undefined =>
    this.sumBusinesses((b) => b.homeOfficeDeduction ?? 0)

  l31 = (): number => this.l29() - (this.l30() ?? 0)

  fields = (): Field[] => []
}
