import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'
import { PDFDocument } from 'pdf-lib'

const runScript = (script: string, args: string[]): string =>
  execFileSync(
    process.execPath,
    ['node_modules/ts-node/dist/bin.js', script, ...args],
    { encoding: 'utf8' }
  )

const withTempDir = async <T>(run: (dir: string) => Promise<T> | T) => {
  const dir = mkdtempSync(path.join(tmpdir(), 'ustaxes-type-imports-'))
  try {
    return await run(dir)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const integrate = (formSource: string): Promise<string> =>
  withTempDir((dir) => {
    const form = path.join(dir, 'Form.ts')
    const output = path.join(dir, 'instructions.txt')
    writeFileSync(form, formSource)
    writeFileSync(
      output,
      '=== Generated fillInstructions() — copy into form class ===\n' +
        "  fillInstructions = (): FillInstructions => [text('field', 1)]\n" +
        '=== End ===\n'
    )
    runScript('scripts/integrateInstructions.ts', ['--write', form, output])
    return readFileSync(form, 'utf8')
  })

describe('form tooling type imports', () => {
  it.each([
    ["import { Field } from 'ustaxes/core/pdfFiller'", 'Field'],
    ["import type { Field } from 'ustaxes/core/pdfFiller'", 'Field'],
    [
      "import type { Field } from 'ustaxes/core/pdfFiller'\nimport { text } from 'ustaxes/core/pdfFiller'",
      'Field'
    ],
    [
      'import { type Field as PdfField } from "ustaxes/core/pdfFiller"',
      'PdfField'
    ]
  ])('integrates instructions with %s', async (imports, fieldType) => {
    const updated = await integrate(
      `${imports}\nclass Form {\n  fields: ${fieldType}[] = []\n}\n`
    )
    const fieldImport = fieldType === 'Field' ? 'Field' : 'Field as PdfField'
    expect(updated).toContain(
      `import type { FillInstructions, ${fieldImport} } from 'ustaxes/core/pdfFiller'`
    )
    expect(updated).toContain(
      "import { text, checkbox, radio } from 'ustaxes/core/pdfFiller'"
    )
    expect(updated).toContain(
      "fillInstructions = (): FillInstructions => [text('field', 1)]"
    )
  })

  it('keeps a relative pdfFiller path instead of adding a second import', async () => {
    const updated = await integrate(
      "import { Field } from '../../pdfFiller'\nclass Form {\n  fields: Field[] = []\n}\n"
    )
    expect(
      updated.startsWith(
        "import type { FillInstructions, Field } from '../../pdfFiller'\n" +
          "import { text, checkbox, radio } from '../../pdfFiller'\n" +
          'class Form {\n'
      )
    ).toBe(true)
    expect(updated).not.toContain('ustaxes/core/pdfFiller')
  })

  it('merges several pdfFiller imports without leaving their lines behind', async () => {
    const updated = await integrate(
      "import { text, RenderedField } from 'ustaxes/core/pdfFiller'\n" +
        '// field types\n' +
        "import type { Field } from 'ustaxes/core/pdfFiller' // for fields\n" +
        "import { sumFields } from 'ustaxes/core/irsForms/util'\n" +
        'class Form {\n  fields: Field[] = []\n}\n'
    )
    expect(
      updated.startsWith(
        "import type { FillInstructions, RenderedField, Field } from 'ustaxes/core/pdfFiller'\n" +
          "import { text, checkbox, radio } from 'ustaxes/core/pdfFiller'\n" +
          "import { sumFields } from 'ustaxes/core/irsForms/util'\n" +
          'class Form {\n'
      )
    ).toBe(true)
  })

  it('generates separate imports for types and PDF helpers', async () => {
    const generated = await withTempDir(async (dir) => {
      const doc = await PDFDocument.create()
      doc.getForm().createTextField('f1_1').addToPage(doc.addPage())
      const pdf = path.join(dir, 'fixture.pdf')
      writeFileSync(pdf, await doc.save())
      return runScript('scripts/formgen.ts', [pdf])
    })
    expect(generated).toContain("import type F1040 from '../../irsForms/F1040'")
    expect(generated).toContain(
      "import type { Field, FillInstructions } from '../../pdfFiller'"
    )
    expect(generated).toContain(
      "import { text, checkbox, radio } from '../../pdfFiller'"
    )
  })
})
