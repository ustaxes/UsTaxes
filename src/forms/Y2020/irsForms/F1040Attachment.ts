import Form from 'ustaxes/core/irsForms/Form'
import F1040 from './F1040'

abstract class F1040Attachment extends Form {
  f1040: F1040

  constructor(f1040: F1040) {
    super()
    this.f1040 = f1040
  }
}

export default F1040Attachment
