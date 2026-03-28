import { Field, RenderedField, FillInstructions } from '.'

export const fieldIsNumber = (field: Field): field is number =>
  typeof field === 'number' || (!Number.isNaN(field) && Number.isFinite(field))

export default abstract class Fill {
  abstract fields: () => Field[]

  // All Y2024 IRS forms implement this (native name-based filling).
  // Y2020-Y2023 forms do not yet implement it and fall back to the
  // @deprecated deriveFillInstructionsFromPdf positional bridge in fillPdf.ts.
  // Once all older years are migrated, this should be made abstract and
  // fields()/renderedFields() should be removed.
  fillInstructions?: () => FillInstructions

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
