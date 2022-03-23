import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button
} from '@material-ui/core'
import { ArrowLeft, ArrowRight, ExpandMore } from '@material-ui/icons'
import { PDFCheckBox, PDFDocument, PDFField, PDFRadioGroup } from 'pdf-lib'
import { ChangeEvent, ReactElement, useState } from 'react'
import { LoadBinary } from 'ustaxes/redux/fs/Load'
import { FormField } from '../data'
import { FixedSizeList } from 'react-window'

// https://github.com/wojtekmaj/react-pdf#create-react-app
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const Editor = (): ReactElement => {
  const [prelimDocs, setPrelimDocs] = useState<PrelimFormData[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | undefined>()
  const [pageNumber, setPageNumber] = useState<number | undefined>()
  const [numPages, setNumPages] = useState<number | undefined>()
  const [displayingPDF, setDisplayingPDF] = useState<Uint8Array | undefined>()

  const handler = async (data: ArrayBuffer) => {
    const pdf = await PDFDocument.load(data)
    const fields: FormField[] = pdf.getForm().getFields().map(parseField)
    setPrelimDocs([
      ...prelimDocs,
      {
        doc: pdf,
        fields
      }
    ])
  }

  const pdfLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const handleExpand =
    (panel: number) => async (_: ChangeEvent<unknown>, isExpanded: boolean) => {
      setSelectedIndex(isExpanded ? panel : undefined)
      if (isExpanded) {
        const bytes = await prelimDocs[panel].doc.save()
        setDisplayingPDF(bytes)
        setPageNumber(1)
      } else {
        setPageNumber(undefined)
        setDisplayingPDF(undefined)
      }
    }

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
    <div>
      <h1>Editor</h1>

      <h2>Forms</h2>
      {prelimDocs.map((doc, i) => (
        <Accordion
          expanded={selectedIndex === i}
          onChange={handleExpand(i)}
          key={i}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <h3>Form {doc.doc.getTitle()}</h3>
          </AccordionSummary>
          <AccordionDetails>
            <FixedSizeList
              itemCount={doc.fields.length}
              itemSize={35}
              height={400}
              width={400}
            >
              {({ index, style }) => (
                <div style={style}>
                  Field {index + 1}: <strong>{doc.fields[index].name}</strong>
                </div>
              )}
            </FixedSizeList>
            {(() => {
              if (displayingPDF !== undefined) {
                return (
                  <div>
                    <div>{pageChange}</div>
                    <Document
                      file={{ data: displayingPDF }}
                      onLoadSuccess={pdfLoadSuccess}
                    >
                      <Page pageNumber={pageNumber} />
                    </Document>
                  </div>
                )
              }
            })()}
          </AccordionDetails>
        </Accordion>
      ))}

      <LoadBinary
        accept="application/pdf"
        handleData={(data: ArrayBuffer) => handler(data)}
      >
        Upload PDF
      </LoadBinary>
    </div>
  )
}

export const FormLibrary = (): ReactElement => {
  return <div></div>
}

export const FormView = (): ReactElement => {
  return <div></div>
}

const parseField = (field: PDFField, index: number): FormField => {
  const base = {
    formName: field.doc.getTitle() ?? '',
    formIndex: index,
    name: field.getName(),
    description: field.acroField.getFullyQualifiedName() ?? ''
  }

  if (
    field instanceof PDFRadioGroup ||
    (field instanceof PDFCheckBox && field.acroField.getWidgets().length > 1)
  ) {
    return {
      ...base,
      type: 'choice',
      extra: {
        choices: field.acroField
          .getWidgets()
          .map((w, i) => w.getOnValue()?.toString() ?? `${i}`)
      }
    }
  } else if (field instanceof PDFCheckBox) {
    return {
      ...base,
      type: 'boolean',
      extra: undefined
    }
  } else {
    return { ...base, type: 'string', extra: undefined }
  }
}

interface PrelimFormData {
  doc: PDFDocument
  fields: FormField[]
}

export default Editor
