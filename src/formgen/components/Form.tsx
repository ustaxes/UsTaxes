import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid
} from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { PDFDocument, PDFTextField, PDFField } from 'pdf-lib'
import { ChangeEvent, ReactElement, useState } from 'react'
import DisplayPDF from './DisplayPDF'
import useFormLibrary, { FormLibraryProvider } from './FormLibraryContext'
import AddPDF from './AddPDF'
import { FormDetails } from './FormDetails'

// 0-1 indexed colors for PDF lib

const Library = (): ReactElement => {
  const { forms, workingPDF, methods: formMethods } = useFormLibrary()
  const [selectedForm, setSelectedForm] = useState<number | undefined>()

  const handleExpand =
    (panel: number) => async (_: ChangeEvent<unknown>, isExpanded: boolean) => {
      setSelectedForm(isExpanded ? panel : undefined)
      if (isExpanded) {
        const doc = await PDFDocument.load(forms[panel].doc)
        const bytes = await doc.save()
        formMethods.setWorkingPDF(bytes)
      } else {
        formMethods.setWorkingPDF(undefined)
      }
    }

  const fillAllFields = async (
    f: (field: PDFField, index: number) => void
  ): Promise<void> => {
    if (selectedForm !== undefined) {
      const doc = await PDFDocument.load(forms[selectedForm].doc)
      doc
        .getForm()
        .getFields()
        .forEach((field, index) => f(field, index))

      formMethods.setWorkingPDF(await doc.save())
    }
  }

  const changeFieldText = (field: PDFField, value: string | number): void => {
    if (field instanceof PDFTextField) {
      const toFill = value.toString()
      field.setText('')
      field.setMaxLength(toFill.length)
      field.setText(toFill)
    }
  }

  const fillIndices = async (): Promise<void> =>
    fillAllFields((field, index) => changeFieldText(field, index + 1))

  const fillNames = async (): Promise<void> =>
    fillAllFields((field, index) =>
      changeFieldText(field, field.getName().toString() ?? index + 1)
    )

  return (
    <>
      {forms.map(({ title }, i) => (
        <Accordion
          expanded={selectedForm === i}
          onChange={handleExpand(i)}
          key={i}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <h3>Form {title}</h3>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={2} direction="row">
              <Grid item sm={12} md={6} lg={6}>
                <FormDetails formIndex={i} />
              </Grid>
              <Grid item sm={12} md={6} lg={6}>
                {(() => {
                  if (workingPDF !== undefined) {
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
                        <DisplayPDF pdf={workingPDF} />
                      </div>
                    )
                  }
                })()}
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      ))}
    </>
  )
}

const Editor = (): ReactElement => {
  return (
    <div>
      <h1>Editor</h1>

      <h2>Forms</h2>
      <Library />
      <AddPDF />
    </div>
  )
}

const FormLibrary = (): ReactElement => {
  return (
    <FormLibraryProvider>
      <Editor />
    </FormLibraryProvider>
  )
}

export default FormLibrary
