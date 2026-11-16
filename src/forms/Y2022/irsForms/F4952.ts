import F1040Attachment from './F1040Attachment'
import type { Field } from 'ustaxes/core/pdfFiller'
import type { FormTag } from 'ustaxes/core/irsForms/Form'

/**
 * Impacts Schedule D, capital gains and taxes worksheet,
 * TODO: Not implemented yet
 */
export default class F4952 extends F1040Attachment {
  tag: FormTag = 'f4952'
  sequenceIndex = 999

  l4e = (): number | undefined => undefined
  l4g = (): number | undefined => undefined

  fields = (): Field[] => []
}
