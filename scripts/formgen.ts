import { PDFDocument, PDFField, PDFCheckBox } from 'pdf-lib'
import { readFile } from 'fs/promises'
import * as path from 'path'
import { unzip } from '../src/util'

const loadFile = async (path: string): Promise<PDFDocument> => {
  const file = await readFile(path)
  const bytearray = file.slice(0, file.byteLength)
  return await PDFDocument.load(bytearray)
}

const normalizeName = (name: string): string =>
  name.replace(/[^a-zA-Z0-9]/g, '')

const fieldFunction = (field: PDFField, index: number): [string, string] => {
  const name = normalizeName(field.getName())
  const isNumeric = name.match(/^[0-9]+[a-z]*$/)
  const functionName = isNumeric ? `l${name}` : `f${index}`

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
   * Index ${index}: ${field.getName()}
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

  return [code, functionName]
}

const buildSource = (doc: PDFDocument, formName: string): string => {
  const functions = doc.getForm().getFields().map(fieldFunction)
  const [impls, functionNames] = unzip(functions)
  const className = normalizeName(formName)

  return `import Form from '../Form'
import F1040 from '../../irsForms/F1040'
import { Field } from '../../pdfFiller'
import { displayNumber, sumFields } from '../../irsForms/util'
import { AccountType, FilingStatus, Information, State } from '../../redux/data'

export class ${className} implements Form {
  info: Information
  f1040: F1040
  formName: string
  state: State

  constructor(info: Information, f1040: F1040) {
    this.info = info
    this.f1040 = f1040
    this.formName = '${formName}'
    this.state = 'AK' // <-- Fill here
  }

${impls.join('\n')}

  const fields = (): Field[] => ([
${functionNames
  .map((name) =>
    name.startsWith('l')
      ? `    displayNumber(this.${name}())`
      : `    this.${name}()`
  )
  .join(',\n')}
  ])
}

const make${className} = (info: Information, f1040: F1040): ${className} =>
  new ${className}(info, f1040)

export default make${className}
`
}

const generate = async (
  inFile: string,
  outFile: string | undefined = undefined
): Promise<void> => {
  const pdf = await loadFile(inFile)
  const name = path.parse(inFile).name
  const code = buildSource(pdf, name)
  if (outFile === undefined) {
    console.log(code)
  }
}

const help = () => {
  console.log(`
    Usage:
    npx ts-node ./scripts/formgen.ts <form-file>.pdf
  `)
}

const main = () => {
  const args = process.argv.slice(2)

  if (args.length < 1) {
    help()
    process.exit()
  }

  generate(args[0])
}

if (require.main === module) {
  main()
}
