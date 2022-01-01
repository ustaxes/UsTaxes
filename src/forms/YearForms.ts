import { Information } from 'ustaxes/core/data'
import { Either, isRight, run, runAsync } from 'ustaxes/core/util'
import { TaxYear } from 'ustaxes/data'
import { create1040 as create1040For2019 } from 'ustaxes/forms/Y2019/irsForms/Main'
import { create1040 as create1040For2020 } from 'ustaxes/forms/Y2020/irsForms/Main'
import { create1040 as create1040For2021 } from 'ustaxes/forms/Y2021/irsForms/Main'

import F1040For2019 from 'ustaxes/forms/Y2019/irsForms/F1040'
import F1040For2020 from 'ustaxes/forms/Y2020/irsForms/F1040'
import F1040For2021 from 'ustaxes/forms/Y2021/irsForms/F1040'

import Form from 'ustaxes/core/irsForms/Form'
import StateForm from 'ustaxes/core/stateForms/Form'

import { createStateReturn as createStateReturn2019 } from 'ustaxes/forms/Y2019/stateForms'
import { createStateReturn as createStateReturn2020 } from 'ustaxes/forms/Y2020/stateForms'
import { createStateReturn as createStateReturn2021 } from 'ustaxes/forms/Y2021/stateForms'

import { PDFDocument } from 'pdf-lib'
import { fillPDF } from 'ustaxes/core/pdfFiller/fillPdf'
import {
  combinePdfs,
  downloadPDF,
  PDFDownloader
} from 'ustaxes/core/pdfFiller/pdfHandler'

export class YearCreateForm {
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
        const f1040 = forms.find((f) => f.tag === 'f1040')
        if (f1040 === undefined) {
          throw new Error('Fed forms sent to state creator without 1040')
        }
        return this.createStateReturn(f1040)
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

export class CreateForms {
  readonly year: TaxYear
  downloader: PDFDownloader

  constructor(year: TaxYear) {
    this.year = year
    this.downloader = (url: string) => downloadPDF(`/forms/${year}/${url}`)
  }

  setDownloader = (downloader: PDFDownloader): CreateForms => {
    this.downloader = downloader
    return this
  }

  build = (info: Information): YearCreateForm => {
    const takeSecond =
      <A, E, B, C>(f: (a: A) => Either<E, [B, C]>): ((a: A) => Either<E, C>) =>
      (a: A): Either<E, C> =>
        run(f(a))
          .map(([, c]) => c)
          .value()

    const getPDF = (form: Form): Promise<PDFDocument> =>
      this.downloader(`irs/${form.tag}.pdf`)

    const getStatePDF = (form: StateForm): Promise<PDFDocument> =>
      this.downloader(`states/${form.state}/${form.formName}.pdf`)

    const params = {
      Y2019: {
        createF1040: takeSecond(create1040For2019),
        createStateReturn: (f: Form) =>
          createStateReturn2019(info, f as F1040For2019)
      },
      Y2020: {
        createF1040: takeSecond(create1040For2020),
        createStateReturn: (f: Form) =>
          createStateReturn2020(info, f as F1040For2020)
      },
      Y2021: {
        createF1040: takeSecond(create1040For2021),
        createStateReturn: (f: Form) =>
          createStateReturn2021(info, f as F1040For2021)
      }
    }

    return new YearCreateForm(
      this.year,
      info,
      params[this.year].createF1040,
      getPDF,
      getStatePDF,
      params[this.year].createStateReturn
    )
  }
}

export const yearFormBuilder = (year: TaxYear): CreateForms =>
  new CreateForms(year)

export default (year: TaxYear, info: Information): YearCreateForm =>
  yearFormBuilder(year).build(info)
