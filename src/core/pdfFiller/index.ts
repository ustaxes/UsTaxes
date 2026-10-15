export interface RadioSelect {
  select: number
}
export type Field = string | number | boolean | RadioSelect | undefined
export type RenderedField = string | boolean | RadioSelect | undefined

// Name-based field mapping types
export type FillInstruction =
  | { name: string; kind: 'text'; value: string | number | undefined }
  | { name: string; kind: 'checkbox'; value: boolean | undefined }
  | { name: string; kind: 'select'; value: string | number | undefined }
  | { name: string; kind: 'radio'; value: RadioSelect | undefined }

export type FillInstructions = FillInstruction[]

// Helper constructors for cleaner form code
export const text = (
  name: string,
  value: string | number | undefined
): FillInstruction => ({ name, kind: 'text', value })

export const checkbox = (
  name: string,
  value: boolean | undefined
): FillInstruction => ({ name, kind: 'checkbox', value })

export const select = (
  name: string,
  value: string | number | undefined
): FillInstruction => ({ name, kind: 'select', value })

export const radio = (
  name: string,
  value: RadioSelect | undefined
): FillInstruction => ({ name, kind: 'radio', value })
