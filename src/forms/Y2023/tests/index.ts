import CommonTests, { FormTestInfo } from 'ustaxes/forms/tests/CommonTests'
import TestKit from 'ustaxes/forms/tests/TestKit'
import F1040 from '../irsForms/F1040'

export const testKit = new TestKit('Y2022')

class FormTestInfo2022 extends FormTestInfo<F1040> {
  getAssets = (f1040: F1040) => f1040.assets
  getInfo = (f1040: F1040) => f1040.info
}

export const commonTests = new CommonTests<F1040>(
  testKit,
  new FormTestInfo2022()
)
