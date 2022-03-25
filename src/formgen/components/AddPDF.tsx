import {
  PDFCheckBox,
  PDFDocument,
  PDFField,
  PDFRadioGroup,
  PDFTextField
} from 'pdf-lib'
import { ReactElement } from 'react'
import { LoadBinary } from 'ustaxes/redux/fs/Load'
import { FormField } from '../data'
import useFormLibrary from './FormLibraryContext'

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

const AddPDF = (): ReactElement => {
  const { methods: formMethods } = useFormLibrary()

  const handler = async (data: ArrayBuffer) => {
    const pdf = await PDFDocument.load(data)
    const fields: FormField[] = pdf.getForm().getFields().map(parseField)
    formMethods.addForm({
      doc: data,
      fields,
      title: pdf.getTitle() ?? 'Document'
    })
  }

  return (
    <LoadBinary
      accept="application/pdf"
      handleData={(data: ArrayBuffer) => handler(data)}
    >
      Upload PDF
    </LoadBinary>
  )
}

export default AddPDF
