import _ from 'lodash'
import { PDFDocument } from 'pdf-lib'
import F1040 from '../irsForms/F1040'
import { fillPDF } from '../pdfFiller/fillPdf'
import { combinePdfs, downloadPDF } from '../pdfFiller/pdfHandler'
import { State, Information } from '../redux/data'
import Form from './Form'
import il1040 from './IL/IL1040'

export const stateForm: {
  [K in State]?: (info: Information, f1040: F1040) => Form
} = {
  IL: il1040
}

export const createStateReturn = (
  info: Information,
  f1040: F1040
): Form[] | undefined => {
  const residency = info.stateResidencies[0]
  if (residency !== undefined) {
    const form = stateForm[residency.state]?.call(undefined, info, f1040)
    if (form !== undefined) {
      return [form, ...form?.attachments()].sort(
        (a, b) => a.formOrder - b.formOrder
      )
    }
  }
}

export const createStatePDF = async (forms: Form[]): Promise<PDFDocument> => {
  const filenames = forms.map(
    (form) => `/states/${form.state}/${form.formName}.pdf`
  )

  const pdfs = filenames.map((filename) => downloadPDF(filename))

  const filled: Array<Promise<PDFDocument>> = _.zipWith(
    pdfs,
    forms,
    async (pdf, form) => {
      fillPDF(await pdf, form.fields())
      return pdf
    }
  )

  return combinePdfs(filled)
}
