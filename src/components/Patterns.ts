import { Control } from 'react-hook-form'
import { CURRENT_YEAR } from '../data/federal'

export enum InputType {
  text = 'text',
  numeric = 'numeric',
  preNumeric = 'prenumeric'
}

export interface PatternConfig<A> {
  regexp?: RegExp
  inputType: A
  description?: string
  format?: string
}

export interface NumericPattern extends PatternConfig<typeof InputType.numeric> {
  thousandSeparator?: boolean
  mask?: string
  prefix?: string
  allowEmptyFormatting?: boolean
  decimalScale?: number
  control: Control
  min?: number
  max?: number
}

// Numeric patterns require the control property, which is not available now.
// This allows us to generate numeric patterns at render time.
type PreNumeric = (control: Control) => NumericPattern

export type TextPattern = PatternConfig<typeof InputType.text>
export type Pattern = NumericPattern | TextPattern

// Convenience record syntax constructor for numeric patterns
const numeric = (
  regexp: RegExp,
  description: string,
  min: (number | undefined) = undefined,
  max: (number | undefined) = undefined,
  format: (string | undefined) = undefined,
  mask: string = '_',
  thousandSeparator: boolean = false,
  prefix: string = '',
  decimalScale: number | undefined = 0
): PreNumeric =>
  (control: Control) => ({
    inputType: InputType.numeric,
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
  inputType: InputType.text,
  regexp,
  description
})

export const Patterns = {
  year: numeric(/[12][0-9]{3}/, 'Input should be a valid year', 1900, CURRENT_YEAR, '####', '_'),
  numMonths: numeric(/[0-9]{1,2}/, 'Input should be 0-12', 0, 12, '##', ''),
  name: text(/^[A-Za-z ]+$/i, 'Input should only include letters and spaces'),
  zip: numeric(/[0-9]{5}([0-9]{4})?/, 'Input should be filled with 5 or 9 digits', undefined, undefined, '#####-####'),
  ssn: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '###-##-####'),
  ein: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '##-#######'),
  currency: numeric(/[1-9][0-9]+(\.[0-9]{1,2})?/, 'Input should be a numeric value', undefined, undefined, undefined, '_', true, '$', 2),
  bankAccount: numeric(/[0-9]{4,17}/, 'Input should be filled with 4-17 digits', undefined, undefined, '#################', ''),
  bankRouting: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '#########', '_'),
  usPhoneNumber: numeric(/[2-9][0-9]{9}/, 'Input should be 10 digits, not starting with 0 or 1', undefined, undefined, '(###)-###-####')
}
