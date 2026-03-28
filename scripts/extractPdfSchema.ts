import {
  PDFDocument,
  PDFField,
  PDFCheckBox,
  PDFTextField,
  PDFDropdown,
  PDFRadioGroup
} from 'pdf-lib'
import { readFile, writeFile, mkdir } from 'fs/promises'
import * as path from 'path'

interface PdfFieldSchema {
  name: string
  fullyQualifiedName: string
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unknown'
  index: number
  page?: number
  maxLength?: number
  options?: string[]
  flags?: {
    readOnly?: boolean
    required?: boolean
  }
}

interface PdfFormSchema {
  formName: string
  fields: PdfFieldSchema[]
  totalFields: number
}

/**
 * Extract schema information from a PDF form field.
 */
function extractFieldSchema(field: PDFField, index: number): PdfFieldSchema {
  const name = field.getName()
  // Note: getFullyQualifiedName() is not available in this version of pdf-lib
  const fullyQualifiedName = name

  let type: PdfFieldSchema['type'] = 'unknown'
  let maxLength: number | undefined
  let options: string[] | undefined

  if (field instanceof PDFTextField) {
    type = 'text'
    // Try to get maxLength if available
    try {
      maxLength = field.getMaxLength() ?? undefined
    } catch {
      // Some PDFs don't have maxLength set
    }
  } else if (field instanceof PDFCheckBox) {
    type = 'checkbox'
  } else if (field instanceof PDFRadioGroup) {
    type = 'radio'
    options = field.getOptions()
  } else if (field instanceof PDFDropdown) {
    type = 'dropdown'
    options = field.getOptions()
  }

  // Extract flags
  const flags = {
    readOnly: field.isReadOnly(),
    required: field.isRequired()
  }

  return {
    name,
    fullyQualifiedName,
    type,
    index,
    maxLength,
    options,
    flags
  }
}

/**
 * Extract complete schema from a PDF document.
 */
async function extractPdfSchema(pdfPath: string): Promise<PdfFormSchema> {
  const file = await readFile(pdfPath)
  const pdf = await PDFDocument.load(file)
  const form = pdf.getForm()
  const fields = form.getFields()

  const formName = path.parse(pdfPath).name

  const fieldSchemas = fields.map((field, index) =>
    extractFieldSchema(field, index)
  )

  return {
    formName,
    fields: fieldSchemas,
    totalFields: fields.length
  }
}

/**
 * Main function to extract schemas from PDF files.
 */
async function main() {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    console.log(`
Usage:
  npm run extract-schema <pdf-file> [output-dir]

Examples:
  npm run extract-schema public/forms/Y2024/irs/f1040.pdf
  npm run extract-schema public/forms/Y2024/irs/f1040.pdf schemas/Y2024
    `)
    process.exit(1)
  }

  const pdfPath = args[0]
  const outputDir = args[1] || 'schemas'
  const formName = path.parse(pdfPath).name

  console.log(`Extracting schema from: ${pdfPath}`)

  try {
    const schema = await extractPdfSchema(pdfPath)

    // Ensure output directory exists
    await mkdir(outputDir, { recursive: true })

    const outputPath = path.join(outputDir, `${formName}.json`)
    await writeFile(outputPath, JSON.stringify(schema, null, 2))

    console.log(`Schema written to: ${outputPath}`)
    console.log(`Total fields: ${schema.totalFields}`)
    console.log(
      `Field types: ${Object.entries(
        schema.fields.reduce((acc, f) => {
          acc[f.type] = (acc[f.type] || 0) + 1
          return acc
        }, {} as Record<string, number>)
      )
        .map(([type, count]) => `${type}=${count}`)
        .join(', ')}`
    )
  } catch (err) {
    console.error('Error extracting schema:', err)
    process.exit(1)
  }
}

if (require.main === module) {
  void main()
}

export { extractPdfSchema, extractFieldSchema }
export type { PdfFormSchema, PdfFieldSchema }
