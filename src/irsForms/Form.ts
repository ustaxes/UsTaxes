
export type FormTag =
  'f1040' |
  'f1040v' |
  'f1040s1' |
  'f1040sb' |
  'f1040sd' |
  'f1040se' |
  'f1040sei'
/**
  * Base interface for what every form implementation should include.
  * Any PDF can be filled from an array of values.
  *
  */
export default interface Form {
  tag: FormTag
  fields: () => Array<string | number | boolean | undefined>
}
