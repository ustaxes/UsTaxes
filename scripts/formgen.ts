import { PDFDocument, PDFField, PDFCheckBox, PDFRadioGroup } from 'pdf-lib'
import { readFile } from 'fs/promises'
import * as path from 'path'

const loadFile = async (path: string): Promise<PDFDocument> => {
  const file = await readFile(path)
  const bytearray = file.slice(0, file.byteLength)
  return await PDFDocument.load(bytearray)
}

const normalizeName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9]/g, '')

interface FieldInfo {
  code: string
  functionName: string
  pdfFieldName: string
  fullyQualifiedName: string
  kind: 'text' | 'checkbox' | 'radio'
}

const fieldFunction = (field: PDFField, index: number): FieldInfo => {
  const pdfFieldName = field.getName()
  // Note: getFullyQualifiedName() is not available in this version of pdf-lib
  // In future versions, use field.getFullyQualifiedName() for hierarchical names
  const fullyQualifiedName = pdfFieldName
  const name = normalizeName(pdfFieldName)
  const isNumeric = name.match(/^[0-9]+[a-z]*$/)
  const functionName = isNumeric ? `l${name}` : `f${index}`

  const kind: 'text' | 'checkbox' | 'radio' = (() => {
    if (field instanceof PDFCheckBox) return 'checkbox'
    if (field instanceof PDFRadioGroup) return 'radio'
    return 'text'
  })()

  const returnType = (() => {
    if (isNumeric) return 'number'
    if (field instanceof PDFCheckBox) return 'boolean'
    return 'string'
  })()

  const fullReturnType = `${returnType}${
    field.isRequired() ? '' : ' | undefined'
  }`

  const defaultValue: string = (() => {
    if (field.isRequired()) {
      if (field instanceof PDFCheckBox) {
        return 'false'
      }
      return "''"
    }
    return 'undefined'
  })()

  // If the pdfField has a plain numeric name, we'll assume that
  // it corresponds to a numbered line on the return, and it will be given
  // a simple implementation like const l5 = (): number | undefined => ...
  // If a pdffield has a string name, then we'll provide a named implementation like
  // const spouseSocialNumber = () => ...
  // and an alias with the pdf index field number.
  const namedImplementation = `  /**
   * Index ${index}: ${pdfFieldName}
   * FQN: ${fullyQualifiedName}
   */
  const ${isNumeric ? functionName : name} = (): ${fullReturnType} => {
    return ${defaultValue}
  }
`

  const alias = isNumeric
    ? undefined
    : `  const ${functionName} = (): ${fullReturnType} => this.${name}()
`

  const code: string = [namedImplementation, alias]
    .filter((x) => x !== undefined)
    .join('\n')

  return { code, functionName, pdfFieldName, fullyQualifiedName, kind }
}

const buildSource = (doc: PDFDocument, formName: string): string => {
  const fieldInfos = doc.getForm().getFields().map(fieldFunction)
  const className = normalizeName(formName)

  const impls = fieldInfos.map((f) => f.code)
  const functionNames = fieldInfos.map((f) => f.functionName)

  // Generate fillInstructions entries
  const fillInstructionsEntries = fieldInfos.map((info) => {
    const { functionName, pdfFieldName, kind } = info
    const helperName = kind // 'text', 'checkbox', or 'radio'
    const valueExpr = `this.${functionName}()`

    return `    ${helperName}('${pdfFieldName}', ${valueExpr})`
  })

  return `import Form from '../Form'
import F1040 from '../../irsForms/F1040'
import { Field, FillInstructions, text, checkbox, radio } from '../../pdfFiller'
import { displayNumber, sumFields } from '../../irsForms/util'
import { AccountType, FilingStatus, State } from '../../redux/data'
import { ValidatedInformation } from 'ustaxes/forms/F1040Base'

export class ${className} extends Form {
  info: ValidatedInformation
  f1040: F1040
  formName: string
  state: State

  constructor(f1040: F1040) {
    this.info = f1040.info
    this.f1040 = f1040
    this.formName = '${formName}'
    this.state = 'AK' // <-- Fill here
  }

${impls.join('\n')}

  fields = (): Field[] => ([
${functionNames
  .map((name) =>
    name.startsWith('l')
      ? `    displayNumber(this.${name}())`
      : `    this.${name}()`
  )
  .join(',\n')}
  ])

  fillInstructions = (): FillInstructions => [
${fillInstructionsEntries.join(',\n')}
  ]
}

const make${className} = (f1040: F1040): ${className} =>
  new ${className}(f1040)

export default make${className}
`
}

/**
 * Generate only the fillInstructions() method body — useful when adding to an existing form class.
 */
const buildFillInstructionsOnly = (
  doc: PDFDocument,
  formName: string
): string => {
  const fieldInfos = doc.getForm().getFields().map(fieldFunction)
  const entries = fieldInfos.map((info) => {
    const { functionName, pdfFieldName, kind } = info
    return `    ${kind}('${pdfFieldName}', this.${functionName}())`
  })
  return `  // Generated from ${formName} PDF via scripts/formgen.ts
  fillInstructions = (): FillInstructions => [
${entries.join(',\n')}
  ]`
}

const generate = async (inFile: string, fillOnly = false): Promise<void> => {
  const pdf = await loadFile(inFile)
  const name = path.parse(inFile).name
  const code = fillOnly
    ? buildFillInstructionsOnly(pdf, name)
    : buildSource(pdf, name)
  console.log(code)
}

const help = () => {
  console.log(`
    Usage:
      npm run formgen <form-file>.pdf
      npm run formgen -- --fill-instructions-only <form-file>.pdf

    Options:
      --fill-instructions-only   Output only the fillInstructions() method (for inserting into an existing class)
  `)
}

const main = async () => {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    help()
    process.exit()
  }

  const fillOnly = args.includes('--fill-instructions-only')
  const files = args.filter((a) => !a.startsWith('-'))

  if (files.length < 1) {
    help()
    process.exit()
  }

  await generate(files[0], fillOnly)
}

if (require.main === module) {
  void main()
}
