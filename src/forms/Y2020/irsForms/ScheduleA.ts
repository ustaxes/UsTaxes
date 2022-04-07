import F1040Attachment from './F1040Attachment'
import { Field } from 'ustaxes/core/pdfFiller'
import { FormTag } from 'ustaxes/core/irsForms/Form'

// Not yet implemented
export default class ScheduleA extends F1040Attachment {
  tag: FormTag = 'f1040sa'
  sequenceIndex = 999

  deductions(): number {
    return 0
  }

  // Used in Form 8960
  l9 = (): number | undefined => undefined

  fields = (): Field[] => []
}
