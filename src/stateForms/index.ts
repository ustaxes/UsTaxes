import F1040 from '../irsForms/F1040'
import { fillPDF } from '../pdfFiller/fillPdf'
import { downloadPDF } from '../pdfFiller/pdfHandler'
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
): Form | undefined => {
  const residency = info.stateResidencies[0]
  if (residency !== undefined) {
    return stateForm[residency.state]?.call(undefined, info, f1040)
  }
}

export const createStatePDF = async (form: Form): Promise<Uint8Array> => {
  const filename = `/states/${form.state}/${form.formName}.pdf`

  const pdf = await downloadPDF(filename)
  fillPDF(pdf, form.fields())
  return pdf.save()
}
