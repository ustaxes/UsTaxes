import CommonTests from 'ustaxes/forms/tests/CommonTests'
import TestKit from 'ustaxes/forms/tests/TestKit'
import F1040 from '../irsForms/F1040'

export const testKit = new TestKit('Y2020')
export const commonTests = new CommonTests<F1040>(testKit, {
  getInfo: (f1040) => f1040.info,
  getErrors: (f1040) => f1040.errors()
})
