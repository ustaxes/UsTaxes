import { Information, Asset } from 'ustaxes/core/data'
import { Either, isLeft, isRight, left, run, runAsync } from 'ustaxes/core/util'
import { TaxYear } from 'ustaxes/core/data'
import { create1040 as create1040For2020 } from 'ustaxes/forms/Y2020/irsForms/Main'
import { create1040 as create1040For2021 } from 'ustaxes/forms/Y2021/irsForms/Main'
import { create1040 as create1040For2022 } from 'ustaxes/forms/Y2022/irsForms/Main'
import { create1040 as create1040For2023 } from 'ustaxes/forms/Y2023/irsForms/Main'
import { create1040 as create1040For2024 } from 'ustaxes/forms/Y2024/irsForms/Main'

import F1040For2020 from 'ustaxes/forms/Y2020/irsForms/F1040'
import F1040For2021 from 'ustaxes/forms/Y2021/irsForms/F1040'
import F1040For2022 from 'ustaxes/forms/Y2022/irsForms/F1040'
import F1040For2023 from 'ustaxes/forms/Y2023/irsForms/F1040'
import F1040For2024 from 'ustaxes/forms/Y2024/irsForms/F1040'

import Form from 'ustaxes/core/irsForms/Form'
import StateForm from 'ustaxes/core/stateForms/Form'

import { createStateReturn as createStateReturn2020 } from 'ustaxes/forms/Y2020/stateForms'
import { createStateReturn as createStateReturn2021 } from 'ustaxes/forms/Y2021/stateForms'
import { createStateReturn as createStateReturn2022 } from 'ustaxes/forms/Y2022/stateForms'
import { createStateReturn as createStateReturn2023 } from 'ustaxes/forms/Y2023/stateForms'
import { createStateReturn as createStateReturn2024 } from 'ustaxes/forms/Y2024/stateForms'
import { PDFDocument } from 'pdf-lib'
import { fillPDF } from 'ustaxes/core/pdfFiller/fillPdf'
import {
  combinePdfs,
  downloadPDF,
  PDFDownloader
} from 'ustaxes/core/pdfFiller/pdfHandler'
import { F1040Error } from './errors'
import { StateFormError } from './StateForms'
import { validate } from './F1040Base'

interface CreateFormConfig {
  createF1040: (
    info: Information,
    assets: Asset[]
  ) => Either<F1040Error[], Form[]>
  getPDF: (f: Form) => Promise<PDFDocument>
  getStatePDF: (f: StateForm) => Promise<PDFDocument>
  createStateReturn: (
    f1040: Form
  ) => Either<Array<F1040Error | StateFormError>, StateForm[]>
}

export class YearCreateForm {
  year: TaxYear
  unvalidatedInfo: Information
  assets: Asset[]
  config: CreateFormConfig

  constructor(
    year: TaxYear,
    info: Information,
    assets: Asset[],
    config: CreateFormConfig
  ) {
    this.year = year
    this.unvalidatedInfo = info
    this.assets = assets

    this.config = config
  }

  errors = (): F1040Error[] => {
    const errors = validate(this.unvalidatedInfo)
    return isLeft(errors) ? errors.left : []
  }

  f1040 = (): Either<F1040Error[], Form[]> =>
    run(validate(this.unvalidatedInfo))
      .chain((info) => this.config.createF1040(info, this.assets))
      .value()

  f1040Pdfs = async (): Promise<Either<string[], PDFDocument[]>> => {
    const r1 = await run(this.f1040()).mapAsync((forms) =>
      Promise.all(
        forms.map(async (form) =>
          fillPDF(
            await this.config.getPDF(form),
            form.renderedFields(),
            form.tag
          )
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

  makeStateReturn = (): Either<(F1040Error | StateFormError)[], StateForm[]> =>
    run(this.f1040())
      .mapLeft<Array<F1040Error | StateFormError>>((e) => e)
      .chain((forms) => {
        if (forms.length < 1) {
          throw new Error('No forms to create state return')
        }
        const f1040 = forms.find((f) => f.tag === 'f1040')
        if (f1040 === undefined) {
          throw new Error('Fed forms sent to state creator without 1040')
        }
        return this.config.createStateReturn(f1040)
      })
      .value()

  stateReturnPDFs = async (): Promise<Either<string[], PDFDocument[]>> => {
    const r1 = run(this.makeStateReturn())
    const r2 = await r1.mapAsync((forms) =>
      Promise.all(
        forms.map(async (form) =>
          fillPDF(
            await this.config.getStatePDF(form),
            form.renderedFields(),
            form.formName
          )
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

  build = (info: Information, assets: Asset<Date>[]): YearCreateForm => {
    const takeSecond =
      <A, AA, E, B, C>(
        f: (a: A, aa: AA) => Either<E, [B, C]>
      ): ((a: A, aa: AA) => Either<E, C>) =>
      (a: A, aa: AA): Either<E, C> =>
        run(f(a, aa))
          .map(([, c]) => c)
          .value()

    const baseConfig = {
      getPDF: (form: Form): Promise<PDFDocument> =>
        this.downloader(`irs/${form.tag}.pdf`),

      getStatePDF: (form: StateForm): Promise<PDFDocument> =>
        this.downloader(`states/${form.state}/${form.formName}.pdf`)
    }

    const configs: { [K in TaxYear]: CreateFormConfig } = {
      Y2019: {
        ...baseConfig,
        createF1040: () => left([F1040Error.unsupportedTaxYear]),
        createStateReturn: () => left([StateFormError.unsupportedTaxYear])
      },
      Y2020: {
        ...baseConfig,
        createF1040: takeSecond(create1040For2020),
        createStateReturn: (f: Form) => createStateReturn2020(f as F1040For2020)
      },
      Y2021: {
        ...baseConfig,
        createF1040: takeSecond(create1040For2021),
        createStateReturn: (f: Form) => createStateReturn2021(f as F1040For2021)
      },
      Y2022: {
        ...baseConfig,
        createF1040: takeSecond(create1040For2022),
        createStateReturn: (f: Form) => createStateReturn2022(f as F1040For2022)
      },
      Y2023: {
        ...baseConfig,
        createF1040: takeSecond(create1040For2023),
        createStateReturn: (f: Form) => createStateReturn2023(f as F1040For2023)
      },
      Y2024: {
        ...baseConfig,
        createF1040: takeSecond(create1040For2024),
        createStateReturn: (f: Form) => createStateReturn2024(f as F1040For2024)
      }
    }

    return new YearCreateForm(this.year, info, assets, configs[this.year])
  }
}

export const yearFormBuilder = (year: TaxYear): CreateForms =>
  new CreateForms(year)

export default (
  year: TaxYear,
  info: Information,
  assets: Asset<Date>[]
): YearCreateForm => yearFormBuilder(year).build(info, assets)
