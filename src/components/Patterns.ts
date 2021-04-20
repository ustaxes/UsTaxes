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

export interface NumericPattern<A> extends PatternConfig<typeof InputType.numeric> {
  thousandSeparator?: boolean
  mask?: string
  prefix?: string
  allowEmptyFormatting?: boolean
  decimalScale?: number
  control: Control<A>
  min?: number
  max?: number
}

// Numeric patterns require the control property, which is not available now.
// This allows us to generate numeric patterns at render time.
type PreNumeric<A> = (control: Control<A>) => NumericPattern<A>

export type TextPattern = PatternConfig<typeof InputType.text>
export type Pattern<A> = NumericPattern<A> | TextPattern

// Convenience record syntax constructor for numeric patterns
const numeric = <A>(
  regexp: RegExp,
  description: string,
  min: (number | undefined) = undefined,
  max: (number | undefined) = undefined,
  format: (string | undefined) = undefined,
  mask: string = '_',
  thousandSeparator: boolean = false,
  prefix: string = '',
  decimalScale: number | undefined = 0
): PreNumeric<A> =>
    (control: Control<A>) => ({
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

const name = text(/^[A-Za-z ]+$/i, 'Input should only include letters and spaces')

const year = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[12][0-9]{3}/, 'Input should be a valid year', 1900, CURRENT_YEAR, '####', '_')(control)

const numMonths = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{1,2}/, 'Input should be 0-12', 0, 12, '##', '')(control)

const zip = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{5}([0-9]{4})?/, 'Input should be filled with 5 or 9 digits', undefined, undefined, '#####-####')(control)

const ssn = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '###-##-####')(control)

const ein = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '##-#######')(control)

const currency = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[1-9][0-9]+(\.[0-9]{1,2})?/, 'Input should be a numeric value', undefined, undefined, undefined, '_', false, '$', 2)(control)

const bankAccount = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{4,17}/, 'Input should be filled with 4-17 digits', undefined, undefined, '#################', '')(control)

const bankRouting = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[0-9]{9}/, 'Input should be filled with 9 digits', undefined, undefined, '#########', '_')(control)

const usPhoneNumber = <A>(control: Control<A>): NumericPattern<A> =>
  numeric<A>(/[2-9][0-9]{9}/, 'Input should be 10 digits, not starting with 0 or 1', undefined, undefined, '(###)-###-####')(control)

export const Patterns = {
  name,
  numMonths,
  year,
  zip,
  ssn,
  ein,
  currency,
  bankAccount,
  bankRouting,
  usPhoneNumber
}
