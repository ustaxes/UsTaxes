import { Button } from '@material-ui/core'
import { ArrowLeft, ArrowRight } from '@material-ui/icons'
import { ReactElement, useState } from 'react'
import { Document, Page } from 'react-pdf'

interface DisplayPDFProps {
  pdf: Uint8Array
}

export const DisplayPDF = ({ pdf }: DisplayPDFProps): ReactElement => {
  const [pageNumber, setPageNumber] = useState<number | undefined>(1)
  const [numPages, setNumPages] = useState<number | undefined>()

  const backButton = (() => {
    if (pageNumber !== undefined && pageNumber > 1) {
      return (
        <Button onClick={() => setPageNumber(pageNumber - 1)}>
          <ArrowLeft />
        </Button>
      )
    }
  })()

  const forwardButton = (() => {
    if (
      pageNumber !== undefined &&
      numPages !== undefined &&
      pageNumber < numPages
    ) {
      return (
        <Button onClick={() => setPageNumber(pageNumber + 1)}>
          <ArrowRight />
        </Button>
      )
    }
  })()

  const pdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const pageChange = (() => {
    if (pageNumber !== undefined) {
      return (
        <>
          {backButton}
          Page {pageNumber} of {numPages}
          {forwardButton}
        </>
      )
    }
  })()

  return (
    <>
      <Document file={{ data: pdf }} onLoadSuccess={pdfLoadSuccess}>
        <Page pageNumber={pageNumber} />
      </Document>
      <div>{pageChange}</div>
    </>
  )
}

export default DisplayPDF
