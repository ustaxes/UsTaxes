import { Field, RenderedField } from '.'

export const fieldIsNumber = (field: Field): field is number =>
  typeof field === 'number' || (!Number.isNaN(field) && Number.isFinite(field))

export default abstract class Fill {
  abstract fields: () => Field[]

  renderedFields = (): RenderedField[] =>
    this.fields().map((field) => {
      if (fieldIsNumber(field)) {
        if (Number.isInteger(field)) {
          return field.toString()
        }
        return field.toFixed(2).toString()
      } else {
        return field
      }
    })
}
