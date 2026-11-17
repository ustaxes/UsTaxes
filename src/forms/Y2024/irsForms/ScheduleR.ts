import F1040Attachment from './F1040Attachment'
import type { Field, FillInstructions } from 'ustaxes/core/pdfFiller'
import type { FormTag } from 'ustaxes/core/irsForms/Form'

export default class ScheduleR extends F1040Attachment {
  tag: FormTag = 'f1040sr'
  sequenceIndex = 999

  l22 = (): number | undefined => undefined

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
