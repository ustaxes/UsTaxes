
/**
  * Base interface for what every form implementation should include.
  * Any PDF can be filled from an array of values.
  *
  */
export default interface Form {
  fields: () => Array<string | number | boolean>
}
