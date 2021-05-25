import { FieldValues, useForm as reactHookForm, UseFormReturn } from 'react-hook-form'
import Patterns from './Patterns'

type OurUseFormReturn<A extends FieldValues> = UseFormReturn<A> & { patterns: Patterns<A>}

/**
 * Improve react-hook-form's useForm to also include our patterns defintions
 * for use with NumberFormat
 * @returns
 */
const useForm = <A extends FieldValues>(): OurUseFormReturn<A> => {
  const result = reactHookForm<A>()
  return {
    ...result,
    patterns: new Patterns<A>(result.control)
  }
}

export default useForm
