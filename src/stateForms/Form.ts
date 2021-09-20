import F1040 from 'ustaxes/irsForms/F1040'
import { Fill } from '../pdfFiller'
import { IncomeW2, Information, State } from '../redux/data'

/**
 * Represents a state's income tax form, or schedule
 */
export default interface Form extends Fill {
  state: State
  formName: string
  formOrder: number
  attachments: () => Form[]
  info: Information
  f1040: F1040
}

/**
 * Methods that would apply to any state tax form
 */
export class FormMethods {
  form: Form

  constructor(form: Form) {
    this.form = form
  }

  stateW2s = (): IncomeW2[] =>
    this.form.f1040.validW2s().filter((w2) => w2.state === this.form.state)

  stateWithholding = (): number =>
    this.stateW2s().reduce(
      (withholding, w2) => withholding + (w2.stateWithholding ?? 0),
      0
    )
}
