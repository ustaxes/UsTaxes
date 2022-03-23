export type FieldType = 'string' | 'numeric' | 'boolean' | 'choice'

interface IFormField<T, A = undefined> {
  formName?: string
  formIndex?: number
  name?: string
  description?: string
  type: T
  extra: A
}

export interface ChoiceExtra {
  choices: string[]
}

export type StringFormField = IFormField<'string'>
export type NumericFormField = IFormField<'numeric'>
export type BooleanFormField = IFormField<'boolean'>
export type ChoiceFormField = IFormField<'choice', ChoiceExtra>

export type FormField =
  | StringFormField
  | NumericFormField
  | BooleanFormField
  | ChoiceFormField

interface NumericField {
  value: number
}

export interface DeriveField {
  readonly _tag: 'DeriveField'
  compute: (field: NumericField) => number
}

export const deriveField = (
  compute: (field: NumericField) => number
): DeriveField => ({
  _tag: 'DeriveField',
  compute
})

interface ComputeField {
  readonly _tag: 'ComputeField'
  compute: (fieldA: NumericField, fieldB: NumericField) => number
}

export const computeField = (
  compute: (fieldA: NumericField, fieldB: NumericField) => number
): ComputeField => ({
  _tag: 'ComputeField',
  compute
})

interface PositiveDifference {
  readonly _tag: 'positiveDifference'
  subtract: NumericField
  from: NumericField
}

export const positiveDifference = (
  subtract: NumericField,
  from: NumericField
): PositiveDifference => ({
  _tag: 'positiveDifference',
  subtract,
  from
})

interface SumField {
  readonly _tag: 'SumField'
  fields: NumericFormField[]
}

export const sumField = (fields: NumericFormField[]): SumField => ({
  _tag: 'SumField',
  fields
})

type Field = DeriveField | ComputeField | PositiveDifference | SumField

export interface Form {
  name: string
  fields: IFormField<unknown, unknown>[]
}

export interface Assignment {
  formName: string
  fields: Field[]
}
