export type Field = string | number | boolean | undefined

export interface Fill {
  fields: () => Field[]
}
