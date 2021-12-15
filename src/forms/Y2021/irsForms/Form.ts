import Fill from 'ustaxes/core/pdfFiller/Fill'

export type FormTag = string

/**
 * Base interface for what every form implementation should include.
 * Any PDF can be filled from an array of values.
 *
 */
export default abstract class Form extends Fill {
  // Match the filename without extension when downloaded from IRS
  abstract tag: FormTag
  // Match the sequence number in the header of the PDF.
  abstract sequenceIndex: number

  public toString = (): string => `
    Form ${this.tag}, at sequence ${this.sequenceIndex}
  `
}
