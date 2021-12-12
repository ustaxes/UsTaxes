import { Information } from 'ustaxes-core/data'
import { Either, isRight, run, runAsync } from 'ustaxes-core/util'
import { TaxYear } from 'ustaxes/data'
import { create1040 as create1040For2020 } from 'ustaxes-forms-2020/irsForms/Main'
import { create1040 as create1040For2021 } from 'ustaxes-forms-2021/irsForms/Main'

import F1040For2020 from 'ustaxes-forms-2020/irsForms/F1040'
import F1040For2021 from 'ustaxes-forms-2021/irsForms/F1040'

import Form from 'ustaxes-core/irsForms/Form'
import StateForm from 'ustaxes-core/stateForms/Form'

import { createStateReturn as createStateReturn2020 } from 'ustaxes-forms-2020/stateForms'
import { createStateReturn as createStateReturn2021 } from 'ustaxes-forms-2021/stateForms'
import { PDFDocument } from 'pdf-lib'
import { fillPDF } from 'ustaxes-core/pdfFiller/fillPdf'
import { combinePdfs, downloadPDF } from 'ustaxes-core/pdfFiller/pdfHandler'

class YearCreateForm {
  readonly year: TaxYear
  readonly info: Information
  readonly createF1040: (info: Information) => Either<string[], Form[]>
  readonly getPDF: (f: Form) => Promise<PDFDocument>
  readonly getStatePDF: (f: StateForm) => Promise<PDFDocument>
  readonly createStateReturn: (f1040: Form) => Either<string[], StateForm[]>

  constructor(
    year: TaxYear,
    info: Information,
    f1040Creator: (info: Information) => Either<string[], Form[]>,
    getPDF: (f: Form) => Promise<PDFDocument>,
    getStatePDF: (f: StateForm) => Promise<PDFDocument>,
    createStateReturn: (f1040: Form) => Either<string[], StateForm[]>
  ) {
    this.year = year
    this.info = info
    this.createF1040 = f1040Creator
    this.getPDF = getPDF
    this.getStatePDF = getStatePDF
    this.createStateReturn = createStateReturn
  }

  f1040 = (): Either<string[], Form[]> => this.createF1040(this.info)

  f1040Pdfs = async (): Promise<Either<string[], PDFDocument[]>> => {
    const r1 = await run(this.f1040()).mapAsync((forms) =>
      Promise.all(
        forms.map(async (form) =>
          fillPDF(await this.getPDF(form), form.renderedFields())
        )
      )
    )
    return r1.value()
  }

  f1040Pdf = async (): Promise<Either<string[], PDFDocument>> => {
    const r1 = await runAsync(this.f1040Pdfs())
    const r2 = await r1.mapAsync(combinePdfs)
    return r2.value()
  }

  f1040Bytes = async (): Promise<Either<string[], Uint8Array>> => {
    const r1 = await runAsync(this.f1040Pdf())
    const r2 = await r1.mapAsync((pdf) => pdf.save())
    return r2.value()
  }

  makeStateReturn = (): Either<string[], StateForm[]> =>
    run(this.f1040())
      .chain((forms) => {
        if (forms.length < 1) {
          throw new Error('No forms to create state return')
        }
        return this.createStateReturn(forms[0])
      })
      .value()

  stateReturnPDFs = async (): Promise<Either<string[], PDFDocument[]>> => {
    const r1 = run(this.makeStateReturn())
    const r2 = await r1.mapAsync((forms) =>
      Promise.all(
        forms.map(async (form) =>
          fillPDF(await this.getStatePDF(form), form.renderedFields())
        )
      )
    )
    return r2.value()
  }

  stateReturnPDF = async (): Promise<Either<string[], PDFDocument>> => {
    const r1 = await runAsync(this.stateReturnPDFs())
    const r2 = await r1.mapAsync(combinePdfs)
    return r2.value()
  }

  stateReturnBytes = async (): Promise<Either<string[], Uint8Array>> => {
    const r1 = await runAsync(this.stateReturnPDF())
    const r2 = await r1.mapAsync((pdf) => pdf.save())
    return r2.value()
  }

  canCreateFederal = (): boolean => isRight(this.f1040())
  canCreateState = (): boolean => isRight(this.makeStateReturn())
}

class CreateForms {
  readonly year: TaxYear
  readonly info: Information
  constructor(year: TaxYear, info: Information) {
    this.year = year
    this.info = info
  }

  builder = (): YearCreateForm => {
    const takeSecond =
      <A, E, B, C>(f: (a: A) => Either<E, [B, C]>): ((a: A) => Either<E, C>) =>
      (a: A): Either<E, C> =>
        run(f(a))
          .map(([, c]) => c)
          .value()

    const yearIrsDownloader =
      (y: TaxYear) =>
      (form: Form): Promise<PDFDocument> =>
        downloadPDF(`/forms/${y}/irs/${form.tag}.pdf`)

    const yearStateDownloader =
      (y: TaxYear) =>
      (form: StateForm): Promise<PDFDocument> =>
        downloadPDF(`/forms/${y}/state/${form.state}/${form.formName}.pdf`)

    if (this.year === 'Y2020') {
      return new YearCreateForm(
        'Y2020',
        this.info,
        takeSecond(create1040For2020),
        yearIrsDownloader('Y2020'),
        yearStateDownloader('Y2020'),
        (f: Form) => createStateReturn2020(this.info, f as F1040For2020)
      )
    } else if (this.year === 'Y2021') {
      return new YearCreateForm(
        'Y2021',
        this.info,
        takeSecond(create1040For2021),
        yearIrsDownloader('Y2021'),
        yearStateDownloader('Y2021'),
        (f: Form) => createStateReturn2021(this.info, f as F1040For2021)
      )
    } else {
      throw new Error('Unsupported year')
    }
  }
}

export default (year: TaxYear, info: Information): YearCreateForm => {
  if (info === undefined) {
    throw new Error('info is undefined')
  }
  const createForms = new CreateForms(year, info)
  return createForms.builder()
}
