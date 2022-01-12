import CommonTests from 'ustaxes/forms/tests/CommonTests'
import TestKit from 'ustaxes/forms/tests/TestKit'
import F1040 from '../irsForms/F1040'

export const testKit = new TestKit('Y2021')
export const commonTests = new CommonTests<F1040>(testKit, {
  getAssets: (f1040) => f1040.f8949[0]?.assets ?? [],
  getInfo: (f1040) => f1040.info,
  getErrors: (f1040) => f1040.errors()
})
