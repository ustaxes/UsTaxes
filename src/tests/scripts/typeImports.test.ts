import { execFileSync } from 'child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs'
import { tmpdir } from 'os'
import path from 'path'

const runScript = (script: string, args: string[]): string =>
  execFileSync(
    process.execPath,
    ['node_modules/ts-node/dist/bin.js', script, ...args],
    { encoding: 'utf8' }
  )

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
  ])('integrates instructions with %s', (imports, fieldType) => {
    const dir = mkdtempSync(path.join(tmpdir(), 'ustaxes-type-imports-'))
    try {
      const form = path.join(dir, 'Form.ts')
      const output = path.join(dir, 'instructions.txt')
      writeFileSync(
        form,
        `${imports}\nclass Form {\n  fields: ${fieldType}[] = []\n}\n`
      )
      writeFileSync(
        output,
        '=== Generated fillInstructions() — copy into form class ===\n' +
          "  fillInstructions = (): FillInstructions => [text('field', 1)]\n" +
          '=== End ===\n'
      )
      runScript('scripts/integrateInstructions.ts', ['--write', form, output])
      const updated = readFileSync(form, 'utf8')
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
    } finally {
      rmSync(dir, { recursive: true, force: true })
    }
  })

  it('generates separate imports for types and PDF helpers', () => {
    const generated = runScript('scripts/formgen.ts', [
      'public/forms/Y2025/irs/f1040.pdf'
    ])
    expect(generated).toContain("import type F1040 from '../../irsForms/F1040'")
    expect(generated).toContain(
      "import type { Field, FillInstructions } from '../../pdfFiller'"
    )
    expect(generated).toContain(
      "import { text, checkbox, radio } from '../../pdfFiller'"
    )
  })
})
