export interface RadioSelect {
  select: number
}
export type Field = string | number | boolean | RadioSelect | undefined
export type RenderedField = string | boolean | RadioSelect | undefined
