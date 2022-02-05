import { Information, Asset } from 'ustaxes/core/data'
import Form from 'ustaxes/core/irsForms/Form'
import { run } from 'ustaxes/core/util'
import TestKit from './TestKit'

interface FormTestInfo<A> {
  getAssets: (a: A) => Asset<Date>[]
  getInfo: (a: A) => Information
  getErrors: (a: A) => string[]
}

export default class CommonTests<F1040 extends Form> {
  testKit: TestKit
  formTestInfo: FormTestInfo<F1040>

  constructor(testKit: TestKit, formTestInfo: FormTestInfo<F1040>) {
    this.testKit = testKit
    this.formTestInfo = formTestInfo
  }

  findF1040 = (forms: Form[]): F1040 | undefined =>
    forms.find((v) => v.tag === 'f1040') as F1040 | undefined

  findF1040OrFail = (forms: Form[]): F1040 => {
    const res = this.findF1040(forms)
    if (res === undefined) {
      throw new Error(
        `Looked for F1040 in ${forms.map((f) => f.tag)}, not found`
      )
    }
    return res
  }

  run = (): void => {
    it('should be created in', async () => {
      await this.testKit.with1040Assert(async (forms) => {
        const f1040 = this.findF1040(forms)
        expect(f1040).not.toBeUndefined()
        if (f1040 !== undefined) {
          expect(this.formTestInfo.getErrors(f1040)).toEqual([])
        }
      })
    })

    it('should arrange attachments according to sequence order', async () => {
      await this.testKit.with1040Assert(async (forms) => {
        expect(forms.sort((a, b) => a.sequenceIndex - b.sequenceIndex)).toEqual(
          forms
        )
      })
    })

    it('should create a PDF without failing', async () => {
      await this.testKit.with1040Assert(async (forms) => {
        const f1040 = this.findF1040(forms)
        expect(f1040).not.toBeUndefined()
        if (f1040 !== undefined) {
          const builder = this.testKit.builder.build(
            this.formTestInfo.getInfo(f1040),
            this.formTestInfo.getAssets(f1040)
          )
          const pdfs = await builder.f1040Pdfs()
          run(pdfs).fold(
            (e) => fail(e),
            (pdfs) => {
              expect(pdfs).not.toHaveLength(0)
            }
          )
        }
      })
    })
  }
}
