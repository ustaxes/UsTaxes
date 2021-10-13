import { Field, Fill } from '../pdfFiller'

export type FormTag =
  | 'f1040'
  | 'f1040v'
  | 'f1040s1'
  | 'f1040s2'
  | 'f1040s3'
  | 'f1040sa'
  | 'f1040sb'
  | 'f1040sd'
  | 'f1040se'
  | 'f1040sr'
  | 'f1040sei'
  | 'f1040s8'
  | 'f4797'
  | 'f4972'
  | 'f5695'
  | 'f8959'
  | 'f8814'
  | 'f8863'
  | 'f8888'
  | 'f8889'
  | 'f8910'
  | 'f8936'
  | 'f8995'
  | 'f8995a'

/**
 * Base interface for what every form implementation should include.
 * Any PDF can be filled from an array of values.
 *
 */
export default abstract class Form implements Fill {
  // Match the filename without extension when downloaded from IRS
  abstract tag: FormTag
  // Match the sequence number in the header of the PDF.
  abstract sequenceIndex: number

  abstract fields: () => Field[]

  public toString = (): string => `
    Form ${this.tag}, at sequence ${this.sequenceIndex}
  `
}
