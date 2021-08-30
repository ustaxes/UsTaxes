import { Fill } from '../pdfFiller'
import { State } from '../redux/data'

/**
 * Represents a state's income tax form, or schedule
 */
export default interface Form extends Fill {
  state: State
  formName: string
  formOrder: number
  attachments: () => Form[]
}
