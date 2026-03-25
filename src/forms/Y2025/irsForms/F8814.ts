import F1040Attachment from './F1040Attachment'
import { FormTag } from 'ustaxes/core/irsForms/Form'
import { Field, FillInstructions } from 'ustaxes/core/pdfFiller'

export default class F8814 extends F1040Attachment {
  tag: FormTag = 'f8814'
  sequenceIndex = 999

  // TODO: required from schedule EIC, pub596, worksheet 2
  l1a = (): number | undefined => undefined

  // TODO: required from schedule EIC, pub596, worksheet 1, worksheet 2
  l1b = (): number | undefined => undefined

  // TODO: required from pub596, worksheet 2
  l2a = (): number | undefined => undefined

  // TODO: required from pub596, worksheet 2
  l2b = (): number | undefined => undefined

  // TODO: required from pub596, worksheet 2
  l12 = (): number | undefined => undefined

  tax = (): number => 0

  fields = (): Field[] => []
  fillInstructions = (): FillInstructions => []
}
