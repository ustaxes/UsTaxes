import { PDFDocument } from 'pdf-lib'
import { fillPDFByName } from 'ustaxes/core/pdfFiller/fillPdf'

const printed = async (
  value: string | number | undefined
): Promise<string | undefined> => {
  const pdf = await PDFDocument.create()
  pdf.getForm().createTextField('line')
  fillPDFByName(pdf, [{ name: 'line', kind: 'text', value }], 'test')
  return pdf.getForm().getTextField('line').getText()
}

describe('text values printed on a PDF', () => {
  // Amounts under a dollar used to be printed unrounded (#2662)
  it.each([
    [925 + 9994 - 10918.2, '1'], // 0.7999999999992724
    [0.8, '1'],
    [0.5, '1'],
    [0.3, '0'],
    [0.1 + 0.2, '0'],
    [5e-7, '0'],
    [-0.3, '0'],
    [-0.8, '-1'],
    [0, '0'],
    [1.4, '1'],
    [10918.199999999999, '10918'],
    [-1234.56, '-1235']
  ])('prints %d as %s', async (value, expected) => {
    expect(await printed(value)).toEqual(expected)
  })

  it.each(['012345678', '0.80', '0', '12.34%'])(
    'leaves the string %s as it is',
    async (value) => {
      expect(await printed(value)).toEqual(value)
    }
  )

  it('leaves the field empty when there is no value', async () => {
    expect(await printed(undefined)).toBeUndefined()
  })
})
