import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  ListItem
} from '@material-ui/core'
import {
  ArrowLeft,
  ArrowRight,
  ExpandMore,
  TextFields as StringIcon,
  PlusOneRounded as NumericIcon,
  CheckBoxRounded as BooleanIcon,
  PlaylistAddCheck as ChoiceIcon
} from '@material-ui/icons'
import {
  PDFCheckBox,
  PDFDocument,
  PDFTextField,
  PDFField,
  PDFRadioGroup
} from 'pdf-lib'
import { ChangeEvent, ReactElement, useState } from 'react'
import { LoadBinary } from 'ustaxes/redux/fs/Load'
import { FieldType, FormField } from '../data'
import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'

// https://github.com/wojtekmaj/react-pdf#create-react-app
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

// 0-1 indexed colors for PDF lib

const colors = {
  white: [1, 1, 1],
  green: [0x66, 0xff, 0xa6].map((x) => x / 0xff),
  yellow: [0xff, 0xff, 0xa6].map((x) => x / 0xff),
  red: [0xff, 0x66, 0x66].map((x) => x / 0xff)
}

type HighlightColor = keyof typeof colors

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
        doc: data,
        fields,
        title: pdf.getTitle() ?? 'Document'
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
        const doc = await PDFDocument.load(prelimDocs[panel].doc)
        const bytes = await doc.save()
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

  const highlightFieldColor = (
    field: PDFField,
    color: HighlightColor
  ): void => {
    const ac = field.acroField
      .getWidgets()[0]
      .getOrCreateAppearanceCharacteristics()
    ac.setBackgroundColor(colors[color])
    const b = field.acroField.getWidgets()[0].getOrCreateBorderStyle()
    b.setWidth(2)
    ac.setBorderColor(colors['red'])
    field.needsAppearancesUpdate()
  }

  const highlightField = async (fieldIndex: number): Promise<void> => {
    if (selectedIndex !== undefined) {
      const doc = await PDFDocument.load(prelimDocs[selectedIndex].doc)

      const field = doc.getForm().getFields()[fieldIndex]

      if (field !== undefined) {
        highlightFieldColor(field, 'yellow')
      }
      doc.getForm().updateFieldAppearances()

      const newDoc = await doc.save()
      setDisplayingPDF(newDoc)
    }
  }

  const fillAllFields = async (
    f: (field: PDFField, index: number) => void
  ): Promise<void> => {
    if (selectedIndex !== undefined) {
      const doc = await PDFDocument.load(prelimDocs[selectedIndex].doc)
      doc
        .getForm()
        .getFields()
        .forEach((field, index) => f(field, index))

      setDisplayingPDF(await doc.save())
    }
  }

  const fillIndices = async (): Promise<void> =>
    fillAllFields((field, index) => {
      if (field instanceof PDFTextField) {
        field.setText(`${index + 1}`)
      }
    })

  const fillNames = async (): Promise<void> => {
    fillAllFields((field, index) => {
      if (field instanceof PDFTextField) {
        if (field.getMaxLength() ?? 0 < field.getName().length) {
          field.setText('')
          field.setMaxLength(field.getName().length)
        }
        field.setText(field.getName().toString() ?? `index: ${index + 1}`)
      }
    })
  }

  const fieldIcon = (fieldType: FieldType): ReactElement => {
    switch (fieldType) {
      case 'string':
        return <StringIcon />
      case 'numeric':
        return <NumericIcon />
      case 'boolean':
        return <BooleanIcon />
      case 'choice':
        return <ChoiceIcon />
    }
  }

  return (
    <div>
      <h1>Editor</h1>

      <h2>Forms</h2>
      {prelimDocs.map(({ title, fields }, i) => (
        <Accordion
          expanded={selectedIndex === i}
          onChange={handleExpand(i)}
          key={i}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <h3>Form {title}</h3>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} direction="row">
              <Grid item sm={12} md={6} lg={6}>
                <AutoSizer defaultHeight={500} defaultWidth={400}>
                  {({ height, width }) => (
                    <FixedSizeList
                      itemCount={fields.length}
                      itemSize={35}
                      height={height / 2}
                      width={width}
                    >
                      {({ index, style }) => (
                        <ListItem
                          style={{ ...style, cursor: 'pointer' }}
                          onClick={() => highlightField(index)}
                        >
                          {fieldIcon(fields[index].type)}
                          Field {index + 1}:{' '}
                          <strong>{fields[index].name}</strong>
                        </ListItem>
                      )}
                    </FixedSizeList>
                  )}
                </AutoSizer>
              </Grid>
              <Grid item sm={12} md={6} lg={6}>
                {(() => {
                  if (displayingPDF !== undefined) {
                    return (
                      <div style={{ minHeight: 400 }}>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={fillIndices}
                        >
                          Fill with Indices
                        </Button>
                        <Button
                          variant="contained"
                          color="secondary"
                          onClick={fillNames}
                        >
                          Fill with Names
                        </Button>
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
              </Grid>
            </Grid>
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
  } else if (field instanceof PDFTextField) {
    return {
      ...base,
      type: 'string',
      extra: { maxLength: field.getMaxLength() }
    }
  } else {
    return {
      ...base,
      type: 'string',
      extra: {}
    }
  }
}

interface PrelimFormData {
  doc: ArrayBuffer
  fields: FormField[]
  title: string
}

export default Editor
