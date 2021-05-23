import { Control, FieldValues } from 'react-hook-form'
import { CURRENT_YEAR } from '../data/federal'
import { daysInYear } from '../util'

export interface PatternConfig {
  inputType: 'text' | 'numeric'
  regexp?: RegExp
  description?: string
  format?: string
}

export interface NumericPattern<A> extends PatternConfig {
  thousandSeparator?: boolean
  mask?: string
  prefix?: string
  allowEmptyFormatting?: boolean
  decimalScale?: number
  control: Control<A>
  min?: number
  max?: number
}

export type TextPattern = PatternConfig
export type Pattern<A> = NumericPattern<A> | TextPattern

// Convenience record syntax constructor for numeric patterns
const numeric = <A extends FieldValues>(
  control: Control<A>,
  regexp: RegExp,
  description: string,
  min: (number | undefined) = undefined,
  max: (number | undefined) = undefined,
  format: (string | undefined) = undefined,
  mask: string = '_',
  thousandSeparator: boolean = false,
  prefix: string = '',
  decimalScale: number | undefined = 0
): NumericPattern<A> => ({
    inputType: 'numeric',
    regexp,
    description,
    decimalScale,
    min,
    max,
    format,
    mask,
    thousandSeparator,
    prefix,
    control
  })

const text = (regexp: RegExp, description: string): TextPattern => ({
  inputType: 'text',
  regexp,
  description
})

export const isNumeric = <A>(pattern: Pattern<A>): pattern is NumericPattern<A> => pattern.inputType === 'numeric'
export const isText = <A>(pattern: Pattern<A>): pattern is TextPattern => pattern.inputType === 'text'

const numDaysInYear = daysInYear(CURRENT_YEAR)

export default class Patterns<A extends FieldValues> {
  control: Control<A>
  year: NumericPattern<A>
  name: TextPattern = text(/^[A-Za-z ]+$/i, 'Input should only include letters and spaces')
  numMonths: NumericPattern<A>
  numDays: NumericPattern<A>
  zip: NumericPattern<A>
  ssn: NumericPattern<A>
  ein: NumericPattern<A>
  currency: NumericPattern<A>
  bankAccount: NumericPattern<A>
  bankRouting: NumericPattern<A>
  usPhoneNumber: NumericPattern<A>

  constructor (control: Control<A>) {
    this.control = control
    this.year = numeric(this.control, /[12][0-9]{3}/, 'Input should be a valid year', 1900, CURRENT_YEAR, '####', '_')
    this.numMonths = numeric(this.control, /[0-9]{1,2}/, 'Input should be 0-12', 0, 12, '##', '')
    this.numDays = numeric(this.control, /[0-9]{1,3}/, `Input should be 0-${numDaysInYear}`, 0, numDaysInYear, '###', '')
    this.zip = numeric(this.control, /[0-9]{5}([0-9]{4})?/, 'Input should be filled with 5 or 9 digits', undefined, undefined, '#####-####')
    this.ssn = numeric(this.control, /[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '###-##-####')
    this.ein = numeric(this.control, /[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '##-#######')
    this.currency = numeric(this.control, /[0-9]+(\.[0-9]{1,2})?/, 'Input should be a numeric value', undefined, undefined, undefined, '_', true, '$', 2)
    this.bankAccount = numeric(this.control, /[0-9]{4,17}/, 'Input should be filled with 4-17 digits', undefined, undefined, '#################', '')
    this.bankRouting = numeric(this.control, /[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '#########', '_')
    this.usPhoneNumber = numeric(this.control, /[2-9][0-9]{9}/, 'Input should be 10 digits, not starting with 0 or 1', undefined, undefined, '(###)-###-####')
  }
}
