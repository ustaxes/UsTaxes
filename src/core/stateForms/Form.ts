import Fill from '../pdfFiller/Fill'
import { IncomeW2, Information, State } from '../data'

/**
 * Represents a state's income tax form, or schedule
 */
export default abstract class Form extends Fill {
  abstract state: State
  abstract formName: string
  abstract formOrder: number
  abstract attachments: () => Form[]
  abstract info: Information
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
    this.form.info.w2s.filter((w2) => w2.state === this.form.state)

  stateWithholding = (): number =>
    this.stateW2s().reduce(
      (withholding, w2) => withholding + (w2.stateWithholding ?? 0),
      0
    )

  witholdingForState = (state: State) =>
    this.stateW2s()
      .filter((w2) => w2.state === state)
      .reduce((withholding, w2) => withholding + (w2.stateWithholding ?? 0), 0)
}
