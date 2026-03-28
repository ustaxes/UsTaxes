import { PDFDocument, PDFCheckBox, PDFTextField, PDFRadioGroup } from 'pdf-lib'
import { testKit } from 'ustaxes/forms/Y2024/tests'
import {
  deriveFillInstructionsFromPdf,
  fillPDFByName
} from 'ustaxes/core/pdfFiller/fillPdf'
import { FillInstructions, RadioSelect } from 'ustaxes/core/pdfFiller'

jest.setTimeout(360000)

/**
 * Sorted PDF field names we could read back (text + checkbox only).
 * Snapshot names only — not values — so tests stay stable with randomized testKit data.
 */
function sortedExtractableFieldNames(
  values: Record<string, string | boolean | undefined>
): string[] {
  return Object.keys(values).sort((a, b) => a.localeCompare(b))
}

/**
 * Extract all readable field values from a filled PDF for comparison.
 * Includes text, checkbox, and radio group fields so that radio fill
 * correctness is visible in snapshots and equivalence checks.
 */
function extractFilledValues(
  pdf: PDFDocument
): Record<string, string | boolean | undefined> {
  const result: Record<string, string | boolean | undefined> = {}
  const form = pdf.getForm()

  for (const field of form.getFields()) {
    const name = field.getName()
    if (field instanceof PDFTextField) {
      result[name] = field.getText() || undefined
    } else if (field instanceof PDFCheckBox) {
      result[name] = field.isChecked()
    } else if (field instanceof PDFRadioGroup) {
      result[name] = field.getSelected() ?? undefined
    }
  }

  return result
}

/** Ensure derive output matches pdf-lib field kinds (strict mode already exercises fill). */
function assertInstructionKindsMatchPdf(
  pdf: PDFDocument,
  instructions: FillInstructions
): void {
  const form = pdf.getForm()
  for (const instr of instructions) {
    if (instr.kind === 'text') {
      expect(() => form.getTextField(instr.name)).not.toThrow()
    } else if (instr.kind === 'checkbox') {
      expect(() => form.getCheckBox(instr.name)).not.toThrow()
    } else {
      expect(() => form.getField(instr.name)).not.toThrow()
    }
  }
}

describe('PDF fill via fillPDFByName (derive bridge)', () => {
  it('fills each Y2024 IRS form: instruction count, strict fill, extractable field names snapshot', async () => {
    const extractableNamesByTag: Record<string, string[]> = {}
    await testKit.with1040Assert(async (forms) => {
      for (const form of forms) {
        const pdf = await testKit.downloader(`irs/${form.tag}.pdf`)
        const renderedFields = form.renderedFields()
        const pdfFields = pdf.getForm().getFields()

        const instructions =
          form.fillInstructions?.() ??
          deriveFillInstructionsFromPdf(pdf, renderedFields)

        expect(instructions.length).toBe(pdfFields.length)

        assertInstructionKindsMatchPdf(pdf, instructions)

        const { warnings } = fillPDFByName(
          pdf,
          instructions,
          form.tag,
          'strict'
        )
        expect(warnings).toEqual([])

        extractableNamesByTag[form.tag] = sortedExtractableFieldNames(
          extractFilledValues(pdf)
        )
      }
    })
    // Canonical extractable field names after migration to name-based filling (text + checkbox only).
    // Update snapshots only when PDFs or which fields are readable change — not for randomized test data values.
    expect(extractableNamesByTag).toMatchSnapshot()
  })

  it('should detect duplicate field names in strict mode', async () => {
    const pdf = await testKit.downloader('irs/f1040.pdf')

    const form = pdf.getForm()
    const fields = form.getFields()
    const firstFieldName = fields[0]?.getName() || 'test_field'

    const duplicateInstructions: FillInstructions = [
      { name: firstFieldName, kind: 'text', value: 'First' },
      { name: firstFieldName, kind: 'text', value: 'Second' }
    ]

    expect(() => {
      fillPDFByName(pdf, duplicateInstructions, 'test-form', 'strict')
    }).toThrow(/Duplicate field mapping/)
  })

  it('should collect warnings in warn mode instead of throwing', async () => {
    const pdf = await testKit.downloader('irs/f1040.pdf')

    const invalidInstructions: FillInstructions = [
      { name: 'nonexistent_field', kind: 'text', value: 'Test' }
    ]

    const { warnings } = fillPDFByName(
      pdf,
      invalidInstructions,
      'test-form',
      'warn'
    )

    expect(warnings.length).toBeGreaterThan(0)
    expect(warnings[0]).toContain('nonexistent_field')
  })

  it('F1040: native fillInstructions() should match bridge-derived instructions', async () => {
    // numRuns is kept small: each iteration loads a PDF + computes 141 fields,
    // making the default 100-run suite exceed the Jest timeout.
    await testKit.with1040Assert(
      async (forms) => {
        const f1040 = forms.find((f) => f.tag === 'f1040')
        expect(f1040).toBeDefined()
        expect(f1040?.fillInstructions).toBeDefined()
        if (!f1040?.fillInstructions) return

        const pdf = await testKit.downloader('irs/f1040.pdf')
        const renderedFields = f1040.renderedFields()

        const nativeInstructions = f1040.fillInstructions()
        const bridgeInstructions = deriveFillInstructionsFromPdf(
          pdf,
          renderedFields
        )

        expect(nativeInstructions.length).toBe(bridgeInstructions.length)

        for (let i = 0; i < nativeInstructions.length; i++) {
          const native = nativeInstructions[i]
          const bridge = bridgeInstructions[i]

          expect(native.name).toBe(bridge.name)
          expect(native.kind).toBe(bridge.kind)

          // Normalize to the same representation that renderedFields() produces:
          // integers → plain string, non-integers → toFixed(2).
          // This lets us compare native fillInstructions() (which may return raw
          // floats like 8194.009999999998) with the bridge (which pre-formats via
          // renderedFields(), producing "8194.01").  Both render identically in the
          // PDF once formatValue / displayRound are applied.
          const normalizeValue = (
            v: string | number | boolean | RadioSelect | undefined
          ): string | boolean | RadioSelect | undefined => {
            if (v === '' || v === undefined) return undefined
            if (typeof v === 'boolean') return v
            // Mirror displayRound semantics: values within half a cent of an
            // integer are treated as that integer (handles floating-point noise
            // in raw computations vs pre-rounded renderedFields() output).
            const toNumericString = (n: number): string => {
              const rounded = Math.round(n)
              return Math.abs(n - rounded) < 0.005
                ? rounded.toString()
                : n.toFixed(2)
            }
            if (typeof v === 'number') return toNumericString(v)
            // Numeric strings: parse → normalize (handles "5431.50" ↔ 5431.5,
            // "831380.00" ↔ "831380", etc.).
            // Guard with !v.startsWith('0') so SSNs / zip codes are untouched.
            // Also guard against strings with non-numeric chars (e.g. "234-56-7890").
            if (typeof v === 'string' && !v.startsWith('0')) {
              const asNum = Number(v)
              if (isFinite(asNum) && !isNaN(asNum))
                return toNumericString(asNum)
            }
            return v
          }

          expect(normalizeValue(native.value)).toEqual(
            normalizeValue(bridge.value)
          )
        }
        // numRuns is capped at 10: each iteration loads a PDF, computes 141 fields,
        // and does two full fills — the default 100 runs would exceed the 360 s timeout.
        // If the test suite becomes faster, this can be increased.
      },
      { numRuns: 10 }
    )
  })
})
