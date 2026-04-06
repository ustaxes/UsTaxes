import { PDFDocument, PDFCheckBox, PDFRadioGroup, PDFName } from 'pdf-lib'
import { Field, FillInstructions, RadioSelect } from '.'
import { displayRound } from '../irsForms/util'
import Fill from './Fill'

export type FillMode = 'strict' | 'warn'

function isRadioSelect(value: Field): value is RadioSelect {
  if (typeof value !== 'object') return false
  return typeof value.select === 'number'
}

/**
 * Pair each PDF field (in order) with the positional value from fields()/renderedFields().
 * Same contract as the former index-based filler; used so all fills go through fillPDFByName.
 *
 * Classification order matches legacy behavior: RadioSelect before checkbox-shaped widgets.
 *
 * @deprecated Legacy positional filler for Y2020–Y2023 forms.
 *   Y2024+ forms should implement fillInstructions() with explicit field names instead.
 *   This function will be removed once all tax years are migrated.
 */
export function deriveFillInstructionsFromPdf(
  pdf: PDFDocument,
  values: ReadonlyArray<Field>
): FillInstructions {
  return pdf
    .getForm()
    .getFields()
    .map((pdfField, index) => {
      const name = pdfField.getName()
      const value = values[index]

      if (isRadioSelect(value)) {
        return { name, kind: 'radio' as const, value }
      }
      if (pdfField instanceof PDFCheckBox) {
        return {
          name,
          kind: 'checkbox' as const,
          value: value as boolean | undefined
        }
      }
      if (pdfField instanceof PDFRadioGroup) {
        return {
          name,
          kind: 'radio' as const,
          value: isRadioSelect(value) ? value : undefined
        }
      }
      return {
        name,
        kind: 'text' as const,
        value: value as string | number | undefined
      }
    })
}

/**
 * Fill a PDF using native fillInstructions() when available, or fall back to
 * the legacy positional derive path for Y2020–Y2023 forms.
 *
 * All notifications (including the legacy-path migration banner) are returned
 * in the `warnings` array so callers have a single channel to observe and log.
 */
export function fillPdfFromFill(
  pdf: PDFDocument,
  formName: string,
  fill: Fill,
  values: ReadonlyArray<Field>
): { warnings: string[] } {
  if (fill.fillInstructions) {
    const { warnings } = fillPDFByName(
      pdf,
      fill.fillInstructions(),
      formName,
      'strict'
    )
    return { warnings }
  }
  // Legacy path for Y2020–Y2023 forms that have not yet implemented fillInstructions().
  // The migration banner is returned in warnings[] rather than emitted directly so
  // callers observe all notifications through one consistent channel.
  const legacyWarning = `[${formName}] Using legacy positional fill — implement fillInstructions() to migrate.`
  const { warnings } = fillPDFByName(
    pdf,
    deriveFillInstructionsFromPdf(pdf, values),
    formName,
    'strict'
  )
  return { warnings: [legacyWarning, ...warnings] }
}

/**
 * Format a value for display in a PDF text field.
 */
function formatValue(value: string | number | undefined): string {
  if (value === undefined) return ''
  if (typeof value === 'string') return value
  if (!isNaN(value) && Array.from(value.toString())[0] !== '0') {
    return displayRound(value)?.toString() ?? ''
  }
  return value.toString()
}

/**
 * Fill PDF fields by name using typed fill instructions.
 *
 * @param pdf - The PDF document to fill
 * @param instructions - Array of fill instructions with explicit field names and types
 * @param formName - Name of the form (for error messages)
 * @param mode - 'strict' throws on errors, 'warn' collects warnings and continues
 * @returns Object containing the filled PDF and any warnings
 */
export function fillPDFByName(
  pdf: PDFDocument,
  instructions: FillInstructions,
  formName: string,
  mode: FillMode = 'strict'
): { pdf: PDFDocument; warnings: string[] } {
  const form = pdf.getForm()
  const warnings: string[] = []
  const seenNames = new Set<string>()

  for (const instr of instructions) {
    if (seenNames.has(instr.name)) {
      const msg = `[${formName}] Duplicate field mapping: "${instr.name}"`
      if (mode === 'strict') {
        throw new Error(msg)
      }
      warnings.push(msg)
    }
    seenNames.add(instr.name)

    if (instr.value === undefined) continue

    try {
      if (instr.kind === 'text') {
        const tf = form.getTextField(instr.name)
        tf.setText(formatValue(instr.value))
        tf.enableReadOnly()
      } else if (instr.kind === 'checkbox') {
        const cb = form.getCheckBox(instr.name)
        if (instr.value) {
          cb.check()
        }
        cb.enableReadOnly()
      } else {
        // Use low-level AcroForm dict manipulation instead of PDFRadioGroup.select()
        // because the high-level API rebuilds all widget appearance streams, which
        // corrupts IRS PDFs that embed pre-rendered XFA appearance data.  Setting
        // the 'V' dictionary entry (PDF spec §12.7.4.2) and the widget appearance
        // state directly avoids this issue while still producing a selectable result.
        const pdfField = form.getField(instr.name)
        const children = pdfField.acroField.getWidgets()
        if (instr.value.select >= children.length) {
          throw new Error(
            `Radio field "${instr.name}" has ${children.length} options but tried to select index ${instr.value.select}`
          )
        }
        const setValue = children[instr.value.select].getOnValue()
        if (setValue !== undefined) {
          pdfField.acroField.dict.set(PDFName.of('V'), setValue)
          children[instr.value.select].setAppearanceState(setValue)
        } else {
          throw new Error(
            `Error handling RadioGroup "${instr.name}", could not set index ${instr.value.select}`
          )
        }
        pdfField.enableReadOnly()
      }
    } catch (err) {
      const msg = `[${formName}] Field "${instr.name}" (kind: ${instr.kind}): ${
        err instanceof Error ? err.message : String(err)
      }`
      if (mode === 'strict') {
        throw new Error(msg)
      }
      warnings.push(msg)
    }
  }

  return { pdf, warnings }
}
