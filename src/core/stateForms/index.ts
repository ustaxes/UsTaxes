import _ from 'lodash'
import { PDFDocument } from 'pdf-lib'
import { fillPdfFromFill } from '../pdfFiller/fillPdf'
import { combinePdfs, PDFDownloader } from '../pdfFiller/pdfHandler'
import Form from './Form'

export const createStatePDF =
  (forms: Form[]) =>
  async (downloader: PDFDownloader): Promise<PDFDocument> => {
    const filenames = forms.map(
      (form) => `/states/${form.state}/${form.formName}.pdf`
    )

    const pdfs = filenames.map(downloader)

    const filled: Array<Promise<PDFDocument>> = _.zipWith(
      pdfs,
      forms,
      async (pdf, form) => {
        const loadedPdf = await pdf
        // State forms implement fields() but not fillInstructions(), so fillPdfFromFill
        // uses the legacy positional bridge (deriveFillInstructionsFromPdf).  This means
        // warnings[] will always include the migration banner until state forms are
        // migrated.  Field count mismatches between the PDF and fields() are silent
        // (extra PDF fields get undefined; extra values are ignored) — not a throw risk.
        const { warnings } = fillPdfFromFill(
          loadedPdf,
          form.formName,
          form,
          form.fields()
        )
        if (warnings.length > 0) {
          console.warn(`State form ${form.formName} warnings:`, warnings)
        }
        return loadedPdf
      }
    )

    return combinePdfs(await Promise.all(filled))
  }
