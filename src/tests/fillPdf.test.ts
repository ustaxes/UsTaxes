import { fillPDF } from 'ustaxes/pdfFiller/fillPdf'
import { downloadPDF } from '../pdfFiller/pdfHandler'

describe('fillPdf', () => {
  it('should fill PDF according value array', async () => {
    const pdf = await downloadPDF('https://ustaxes.org/forms/f1040.pdf')
    const fieldsValue = [true, false, true, true, true, 'One', 'Two']
    fillPDF(pdf, fieldsValue)

    const fields = pdf.getForm().getFields()
    expect(fields[0].isChecked()).toBe(true)
    expect(fields[1].isChecked()).toBe(false)
    expect(fields[2].isChecked()).toBe(true)
    expect(fields[3].isChecked()).toBe(true)
    expect(fields[4].isChecked()).toBe(true)
    expect(fields[5].getText()).toBe('One')
    expect(fields[6].getText()).toBe('Two')
  })

  it('should stop filling when non-boolean is passed to field type Checkbox', async () => {
    const pdf = await downloadPDF('https://ustaxes.org/forms/f1040.pdf')
    const fieldsValue = ['Test', false, true, true, true, 'One', 'Two']
    fillPDF(pdf, fieldsValue)

    const fields = pdf.getForm().getFields()
    expect(fields[0].isChecked()).toBe(false)
    expect(fields[1].isChecked()).toBe(false)
    expect(fields[2].isChecked()).toBe(false)
    expect(fields[3].isChecked()).toBe(false)
    expect(fields[4].isChecked()).toBe(false)
    expect(fields[5].getText()).toBe(undefined)
    expect(fields[6].getText()).toBe(undefined)
  })
})
