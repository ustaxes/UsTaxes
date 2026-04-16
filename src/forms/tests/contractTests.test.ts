import { readFile } from 'fs/promises'
import * as path from 'path'
import { existsSync } from 'fs'
import { testKit } from 'ustaxes/forms/Y2025/tests'
import {
  PdfFormSchema,
  PdfFieldSchema
} from '../../../scripts/extractPdfSchema'

jest.setTimeout(300000)

/**
 * Load a PDF schema from a JSON file.
 */
async function loadSchema(schemaPath: string): Promise<PdfFormSchema> {
  const content = await readFile(schemaPath, 'utf-8')
  return JSON.parse(content) as PdfFormSchema
}

/**
 * Map FillInstruction kind to PDF field type for comparison.
 */
function mapKindToType(kind: 'text' | 'checkbox' | 'select' | 'radio'): string {
  return kind // They happen to map 1:1
}

/**
 * Fields present in the PDF schema but intentionally excluded from fillInstructions().
 *
 * When to add an entry here vs filling with `undefined`:
 *   - Use `undefined` value in fillInstructions() for fields the form owns but leaves
 *     blank (e.g. read-only calculated fields, preparer sections, inapplicable lines).
 *     This keeps them tracked by the contract and visible in equivalence tests.
 *   - Add to ALLOWLIST only for fields the form can never meaningfully own: barcodes,
 *     watermarks, or PDF metadata fields that the IRS adds outside the form logic.
 *
 * If a new IRS PDF version adds fields not covered by fillInstructions(), add them
 * here (with a comment) rather than silently failing CI.
 */
const ALLOWLIST: Partial<Record<string, string[]>> = {
  // Example for a hypothetical barcode field added in a future IRS PDF revision:
  // f1040: ['topmostSubform[0].Page1[0].Barcode[0]'],
}

describe('Contract Tests: PDF Schema vs TypeScript Forms', () => {
  describe('Parameterized: all Y2025 forms with fillInstructions() + schema', () => {
    it('TS<->PDF contract: field names exist, types match, coverage complete', async () => {
      await testKit.with1040Assert(async (forms) => {
        const schemasDir = path.resolve(__dirname, '../../../schemas/Y2025')
        const failures: string[] = []

        for (const form of forms) {
          if (!form.fillInstructions) continue

          const instructions = form.fillInstructions()

          const schemaPath = path.join(schemasDir, `${form.tag}.json`)
          if (!existsSync(schemaPath)) {
            // Strict: non-empty fillInstructions with no schema is a contract violation
            if (instructions.length > 0) {
              failures.push(
                `[${form.tag}] has non-empty fillInstructions() but no schema file — run: npm run extract-schema <pdf> schemas/Y2025`
              )
            }
            continue
          }

          const schema = await loadSchema(schemaPath)
          const schemaFieldNames = new Set(
            schema.fields.map((f: PdfFieldSchema) => f.name)
          )
          const tsFieldNames = new Set(instructions.map((i) => i.name))
          const allowlist = new Set(ALLOWLIST[form.tag] ?? [])
          const schemaByName = new Map(
            schema.fields.map((f: PdfFieldSchema) => [f.name, f])
          )

          // TS->PDF: every instruction name must exist in the schema
          for (const instr of instructions) {
            if (!schemaFieldNames.has(instr.name)) {
              failures.push(
                `[${form.tag}] TS->PDF: instruction references unknown field "${instr.name}"`
              )
            }
          }

          // PDF->TS: every schema field must be handled or in the allowlist
          for (const field of schema.fields) {
            if (!tsFieldNames.has(field.name) && !allowlist.has(field.name)) {
              failures.push(
                `[${form.tag}] PDF->TS: schema field "${field.name}" (${field.type}) not in fillInstructions()`
              )
            }
          }

          // Type match: instruction kinds must match schema field types
          for (const instr of instructions) {
            const schemaField = schemaByName.get(instr.name)
            if (schemaField && schemaField.type !== mapKindToType(instr.kind)) {
              failures.push(
                `[${form.tag}] Type mismatch: "${instr.name}" — TS kind "${instr.kind}" but PDF type "${schemaField.type}"`
              )
            }
          }
        }

        if (failures.length > 0) {
          throw new Error(
            `Contract violations found:\n` +
              failures.map((f) => `  • ${f}`).join('\n')
          )
        }
      })
    })
  })

  describe('Schema files: all Y2025 schemas should be loadable', () => {
    it('should load all extracted Y2025 schemas', async () => {
      const schemasDir = path.resolve(__dirname, '../../../schemas/Y2025')
      const expectedForms = [
        'f1040',
        'f1040v',
        'f1040s1',
        'f1040s1a',
        'f1040s2',
        'f1040s3',
        'f1040sa',
        'f1040sb',
        'f1040sd',
        'f1040se',
        'f1040sei',
        'f1040sse',
        'f1040s8',
        'f4547',
        'f4797',
        'f4952',
        'f4972',
        'f5695',
        'f6251',
        'f8814',
        'f8888',
        'f8889',
        'f8910',
        'f8936',
        'f8949',
        'f8959',
        'f8960',
        'f8995',
        'f8995a',
        'f1040sr',
        'f5329',
        'f8839',
        'f8880'
      ]

      const missingSchemas: string[] = []
      for (const formTag of expectedForms) {
        const schemaPath = path.join(schemasDir, `${formTag}.json`)
        if (!existsSync(schemaPath)) {
          missingSchemas.push(formTag)
          continue
        }
        const schema = await loadSchema(schemaPath)
        expect(schema.formName).toBe(formTag)
        expect(schema.fields.length).toBeGreaterThan(0)
      }
      if (missingSchemas.length > 0) {
        throw new Error(
          `Missing schema files for: ${missingSchemas.join(', ')}\n` +
            `Run: npm run extract-schema <pdf> schemas/Y2025 for each missing form.`
        )
      }
    })
  })
})
