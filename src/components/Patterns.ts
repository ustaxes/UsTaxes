import { Control } from 'react-hook-form'

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
  name: text(/^[A-Za-z ]+$/i, 'Input should only include letters and spaces'),
  zip: numeric(/[0-9]{5}([0-9]{4})?/, 'Input should be filled with 5 or 9 digits', '#####-####'),
  ssn: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', '###-##-####'),
  ein: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', '##-#######'),
  currency: numeric(/[1-9][0-9]+(\.[0-9]{1,2})?/, 'Input should be a numeric value', undefined, '_', true, '$', 2),
  bankAccount: numeric(/[0-9]{4,17}/, 'Input should be filled with 4-17 digits', '#################', ''),
  bankRouting: numeric(/[0-9]{9}/, 'Input should be filled with 9 digits', '#########', '_'),
  usPhoneNumber: numeric(/[2-9][0-9]{9}/, 'Input should be 10 digits, not starting with 0 or 1', '(###)-###-####')
}
