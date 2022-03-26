import { PDFDocument, PDFField } from 'pdf-lib'
import { ReactElement } from 'react'
import useFormLibrary from './FormLibraryContext'
import {
  TextFields as StringIcon,
  PlusOneRounded as NumericIcon,
  CheckBoxRounded as BooleanIcon,
  PlaylistAddCheck as ChoiceIcon
} from '@material-ui/icons'
import { FieldType } from '../data'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'
import { ListItem } from '@material-ui/core'

const colors = {
  white: [1, 1, 1],
  green: [0x66, 0xff, 0xa6].map((x) => x / 0xff),
  yellow: [0xff, 0xff, 0xa6].map((x) => x / 0xff),
  red: [0xff, 0x66, 0x66].map((x) => x / 0xff)
}

const fieldTypeIcons: { [key in FieldType]: ReactElement } = {
  string: <StringIcon />,
  numeric: <NumericIcon />,
  boolean: <BooleanIcon />,
  choice: <ChoiceIcon />
}

type HighlightColor = keyof typeof colors

export const FormDetails = ({
  formIndex
}: {
  formIndex: number
}): ReactElement => {
  const { selectedField, forms, methods: formMethods } = useFormLibrary()

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
    const doc = await PDFDocument.load(forms[formIndex].doc)

    const field = doc.getForm().getFields()[fieldIndex]

    if (field !== undefined) {
      highlightFieldColor(field, 'yellow')
    }

    doc.getForm().updateFieldAppearances()

    const newDoc = await doc.save()
    formMethods.setWorkingPDF(newDoc)
  }

  const selectField = (fieldIndex: number): void => {
    formMethods.setSelectedField(fieldIndex)
    highlightField(fieldIndex)
  }

  const fields = forms[formIndex].fields

  return (
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
              selected={selectedField === index}
              onClick={() => selectField(index)}
            >
              {fieldTypeIcons[fields[index].type]}
              Field {index + 1}: <strong>{fields[index].name}</strong>
            </ListItem>
          )}
        </FixedSizeList>
      )}
    </AutoSizer>
  )
}
