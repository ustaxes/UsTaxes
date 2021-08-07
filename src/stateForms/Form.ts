import { Field } from '../pdfFiller'
import { State } from '../redux/data'

export default interface Form {
  state: State
  formName: string
  fields: () => Field[]
}
