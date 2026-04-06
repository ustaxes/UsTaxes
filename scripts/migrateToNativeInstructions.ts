#!/usr/bin/env ts-node
/**
 * Generates fillInstructions() code by pairing fields() array expressions
 * with PDF field names from the corresponding PDF schema.
 *
 * Usage:
 *   ts-node scripts/migrateToNativeInstructions.ts <form.ts> <schema.json|form.pdf>
 *   ts-node scripts/migrateToNativeInstructions.ts --verify <form-tag> <form.pdf>
 *
 * Examples:
 *   # Generate fillInstructions() code
 *   ts-node scripts/migrateToNativeInstructions.ts \
 *     src/forms/Y2024/irsForms/Schedule1.ts \
 *     schemas/Y2024/f1040s1.json
 *
 *   ts-node scripts/migrateToNativeInstructions.ts \
 *     src/forms/Y2024/irsForms/ScheduleA.ts \
 *     public/forms/Y2024/irs/f1040sa.pdf
 *
 *   # Verify a form's fillInstructions() against the bridge (after pasting)
 *   ts-node scripts/migrateToNativeInstructions.ts --verify f1040s1 public/forms/Y2024/irs/f1040s1.pdf
 *
 * The --verify flag:
 *   Runs both the native fillInstructions() and the legacy bridge on a blank
 *   PDF, then diffs the filled field values. Use after pasting fillInstructions()
 *   into a form class to confirm correctness before removing the bridge fallback.
 *   Requires the form to already implement fillInstructions().
 *
 * The script outputs a ready-to-paste fillInstructions() method.
 * When field counts differ (due to spread expressions), the mismatch is
 * flagged clearly so the developer can handle the spread manually.
 */

import { PDFDocument, PDFCheckBox, PDFRadioGroup, PDFTextField } from 'pdf-lib'
import { readFile } from 'fs/promises'
import * as path from 'path'
import type { Field, FillInstructions } from '../src/core/pdfFiller'

interface PdfField {
  name: string
  kind: 'text' | 'checkbox' | 'radio'
}

interface SchemaField {
  name: string
  type: 'text' | 'checkbox' | 'radio' | 'dropdown' | 'unknown'
  index: number
}

interface Schema {
  formName: string
  fields: SchemaField[]
  totalFields: number
}

// ---------------------------------------------------------------------------
// TypeScript source parser
// ---------------------------------------------------------------------------

/**
 * Extract top-level comma-separated elements from an array literal's inner
 * content, respecting nested brackets, parens, braces, and string literals.
 */
function extractTopLevelElements(inner: string): string[] {
  const elements: string[] = []
  let current = ''
  let depth = 0
  let inString = false
  let stringChar = ''
  let i = 0

  while (i < inner.length) {
    const ch = inner[i]

    if (inString) {
      current += ch
      // Handle escaped characters in non-template strings
      if (ch === '\\' && stringChar !== '`') {
        i++
        if (i < inner.length) current += inner[i]
      } else if (ch === stringChar) {
        inString = false
        stringChar = ''
      }
      i++
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true
      stringChar = ch
      current += ch
      i++
      continue
    }

    if (ch === '(' || ch === '[' || ch === '{') {
      depth++
      current += ch
      i++
      continue
    }

    if (ch === ')' || ch === ']' || ch === '}') {
      depth--
      current += ch
      i++
      continue
    }

    if (ch === ',' && depth === 0) {
      const trimmed = current.trim()
      if (trimmed.length > 0) elements.push(trimmed)
      current = ''
      i++
      continue
    }

    // Skip line comments at top level to avoid issues
    if (ch === '/' && inner[i + 1] === '/' && depth === 0) {
      // Skip to end of line
      while (i < inner.length && inner[i] !== '\n') i++
      continue
    }

    current += ch
    i++
  }

  const trimmed = current.trim()
  if (trimmed.length > 0) elements.push(trimmed)
  return elements
}

/**
 * Find and extract the fields() method's return array from TypeScript source.
 * Returns the raw source elements (one per PDF field position).
 */
function parseFieldsArray(source: string): {
  elements: string[]
  hasMap: boolean
  hasSpread: boolean
} {
  // Match: fields = (): Field[] => or fields = (): Field[] => {
  const methodMatch = /fields\s*=\s*\(\)\s*:\s*Field\[\]\s*=>/.exec(source)
  if (!methodMatch) {
    throw new Error('Could not find "fields = (): Field[] =>" in source')
  }

  let pos = methodMatch.index + methodMatch[0].length

  // Skip whitespace
  while (pos < source.length && /\s/.test(source[pos])) pos++

  // Locate the array start
  let arrayStart = -1
  if (source[pos] === '[') {
    arrayStart = pos
  } else if (source[pos] === '{') {
    const block = source.slice(pos)
    const returnMatch = /return\s*\[/.exec(block)
    if (!returnMatch) {
      throw new Error('Could not find "return [" in fields() block')
    }
    arrayStart = pos + returnMatch.index + returnMatch[0].length - 1
  } else {
    throw new Error(
      `Unexpected token at fields() start: '${source[pos]}' (pos ${pos})`
    )
  }

  // Walk to the matching closing bracket
  let depth = 0
  let inString = false
  let stringChar = ''
  let endPos = -1

  for (let i = arrayStart; i < source.length; i++) {
    const ch = source[i]

    if (inString) {
      if (ch === '\\' && stringChar !== '`') {
        i++ // skip escaped char
        continue
      }
      if (ch === stringChar) inString = false
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') {
      inString = true
      stringChar = ch
      continue
    }

    if (ch === '[' || ch === '(' || ch === '{') depth++
    if (ch === ']' || ch === ')' || ch === '}') {
      depth--
      if (depth === 0 && ch === ']') {
        endPos = i
        break
      }
    }
  }

  if (endPos === -1) {
    throw new Error('Could not find matching ] for fields() array')
  }

  // Check for trailing .map(...)
  const afterBracket = source.slice(endPos + 1).trimStart()
  const hasMap = afterBracket.startsWith('.map(')

  const inner = source.slice(arrayStart + 1, endPos)
  const elements = extractTopLevelElements(inner)

  const hasSpread = elements.some((e) => e.startsWith('...'))
  return { elements, hasMap, hasSpread }
}

// ---------------------------------------------------------------------------
// PDF / schema loaders
// ---------------------------------------------------------------------------

async function loadFromPdf(pdfPath: string): Promise<PdfField[]> {
  const buf = await readFile(pdfPath)
  const pdf = await PDFDocument.load(buf)
  const form = pdf.getForm()
  return form.getFields().map((field) => {
    const name = field.getName()
    let kind: 'text' | 'checkbox' | 'radio' = 'text'
    if (field instanceof PDFCheckBox) kind = 'checkbox'
    else if (field instanceof PDFRadioGroup) kind = 'radio'
    return { name, kind }
  })
}

async function loadFromSchema(schemaPath: string): Promise<PdfField[]> {
  const content = await readFile(schemaPath, 'utf-8')
  const schema = JSON.parse(content) as unknown as Schema
  return schema.fields
    .sort((a, b) => a.index - b.index)
    .map((f) => ({
      name: f.name,
      kind:
        f.type === 'checkbox'
          ? ('checkbox' as const)
          : f.type === 'radio'
          ? ('radio' as const)
          : ('text' as const)
    }))
}

async function loadPdfFields(fieldSource: string): Promise<PdfField[]> {
  const ext = path.extname(fieldSource).toLowerCase()
  if (ext === '.json') return loadFromSchema(fieldSource)
  if (ext === '.pdf') return loadFromPdf(fieldSource)
  throw new Error(`Unsupported field source extension: ${ext}`)
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

function generateFillInstructions(
  elements: string[],
  pdfFields: PdfField[]
): string {
  const lines: string[] = []
  const count = Math.min(elements.length, pdfFields.length)

  for (let i = 0; i < count; i++) {
    const expr = elements[i]
    const pdfField = pdfFields[i]

    // Determine the correct helper function based on PDF type and expression
    const helper = pdfField.kind // 'text', 'checkbox', or 'radio'

    // Spread expressions — cannot map directly; mark as TODO
    if (expr.startsWith('...')) {
      lines.push(
        `      // TODO: expand spread "${expr}" — see _depFieldMappings or similar helper`
      )
      lines.push(`      // text('${pdfField.name}', /* spread element */),`)
      continue
    }

    lines.push(`      ${helper}('${pdfField.name}', ${expr}),`)
  }

  // Warn about mismatches
  if (elements.length > pdfFields.length) {
    lines.push(
      `      // WARNING: ${
        elements.length - pdfFields.length
      } extra TS expression(s) with no PDF field:`
    )
    for (let i = count; i < elements.length; i++) {
      lines.push(`      // EXTRA TS: ${elements[i]}`)
    }
  } else if (pdfFields.length > elements.length) {
    lines.push(
      `      // WARNING: ${
        pdfFields.length - elements.length
      } extra PDF field(s) with no TS expression:`
    )
    for (let i = count; i < pdfFields.length; i++) {
      lines.push(
        `      // EXTRA PDF: ${pdfFields[i].kind}('${pdfFields[i].name}', undefined),`
      )
    }
  }

  const countSummary = `${elements.length} TS expressions, ${pdfFields.length} PDF fields`
  return `  // Generated from Y2024 PDF schema + fields() via scripts/migrateToNativeInstructions.ts
  // ${countSummary}
  fillInstructions = (): FillInstructions => [
${lines.join('\n')}
  ]`
}

// ---------------------------------------------------------------------------
// --verify mode: compare native fillInstructions() vs bridge on live PDF
// ---------------------------------------------------------------------------

/**
 * Extract all filled field values from a PDF (text + checkbox only).
 * Normalises '' → undefined so the comparison is not sensitive to
 * the old fields() path writing empty strings vs fillPDFByName skipping undefined.
 */
function extractFilledValues(
  pdf: PDFDocument
): Record<string, string | boolean | undefined> {
  const result: Record<string, string | boolean | undefined> = {}
  for (const field of pdf.getForm().getFields()) {
    const name = field.getName()
    if (field instanceof PDFTextField) {
      const v = field.getText()
      result[name] = v || undefined
    } else if (field instanceof PDFCheckBox) {
      result[name] = field.isChecked()
    }
  }
  return result
}

async function runVerify(formTag: string, pdfPath: string): Promise<void> {
  // Dynamic import so the verification can load compiled form modules.
  // The testKit gives us a real, validated form instance with random data.
  const { testKit } = await import('../src/forms/Y2024/tests')
  const { deriveFillInstructionsFromPdf, fillPDFByName } = await import(
    '../src/core/pdfFiller/fillPdf'
  )

  const pdfBytes = await readFile(pdfPath)
  let foundForm:
    | {
        tag: string
        fillInstructions?: () => FillInstructions
        renderedFields: () => Field[]
      }
    | undefined

  await testKit.with1040Assert(
    (
      forms: Array<{
        tag: string
        fillInstructions?: () => FillInstructions
        renderedFields: () => Field[]
      }>
    ) => {
      foundForm = forms.find((f) => f.tag === formTag)
      return Promise.resolve()
    }
  )

  if (!foundForm) {
    console.error(`Form with tag "${formTag}" not found in testKit`)
    process.exit(1)
  }

  if (!foundForm.fillInstructions) {
    console.error(
      `Form "${formTag}" has no fillInstructions() — paste the generated method first, then re-run --verify`
    )
    process.exit(1)
  }

  // Load two independent copies of the blank PDF (one per path)
  const pdfNative = await PDFDocument.load(pdfBytes)
  const pdfBridge = await PDFDocument.load(pdfBytes)

  const nativeInstructions = foundForm.fillInstructions()
  const bridgeInstructions = deriveFillInstructionsFromPdf(
    pdfBridge,
    foundForm.renderedFields()
  )

  fillPDFByName(pdfNative, nativeInstructions, formTag, 'warn')
  fillPDFByName(pdfBridge, bridgeInstructions, formTag, 'warn')

  const nativeValues = extractFilledValues(pdfNative)
  const bridgeValues = extractFilledValues(pdfBridge)

  const allKeys = new Set([
    ...Object.keys(nativeValues),
    ...Object.keys(bridgeValues)
  ])

  const mismatches: Array<{ field: string; native: unknown; bridge: unknown }> =
    []
  for (const key of Array.from(allKeys)) {
    const n = nativeValues[key]
    const b = bridgeValues[key]
    if (n !== b) {
      // Normalise numeric equivalents: "5431.50" ≈ "5431.5"
      const toNum = (v: unknown): number | undefined => {
        if (typeof v === 'string') {
          const n = Number(v)
          return isFinite(n) ? Math.round(n * 100) / 100 : undefined
        }
        return undefined
      }
      const nn = toNum(n)
      const nb = toNum(b)
      if (nn !== undefined && nb !== undefined && nn === nb) continue
      mismatches.push({ field: key, native: n, bridge: b })
    }
  }

  if (mismatches.length === 0) {
    console.log(
      `\n✅ [${formTag}] native fillInstructions() matches bridge — ${allKeys.size} fields checked`
    )
  } else {
    console.error(`\n❌ [${formTag}] ${mismatches.length} mismatch(es) found:`)
    for (const { field, native, bridge } of mismatches) {
      console.error(`  ${field}:`)
      console.error(`    native: ${JSON.stringify(native)}`)
      console.error(`    bridge: ${JSON.stringify(bridge)}`)
    }
    process.exit(1)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2)

  // --verify mode
  if (args[0] === '--verify') {
    if (args.length < 3) {
      console.log(`
Usage (--verify):
  ts-node scripts/migrateToNativeInstructions.ts --verify <form-tag> <form.pdf>

Example:
  ts-node scripts/migrateToNativeInstructions.ts --verify f1040s1 public/forms/Y2024/irs/f1040s1.pdf
      `)
      process.exit(1)
    }
    await runVerify(args[1], args[2])
    return
  }

  if (args.length < 2) {
    console.log(`
Usage:
  ts-node scripts/migrateToNativeInstructions.ts <form.ts> <schema.json|form.pdf>
  ts-node scripts/migrateToNativeInstructions.ts --verify <form-tag> <form.pdf>

Examples:
  ts-node scripts/migrateToNativeInstructions.ts \\
    src/forms/Y2024/irsForms/Schedule1.ts \\
    schemas/Y2024/f1040s1.json

  ts-node scripts/migrateToNativeInstructions.ts \\
    src/forms/Y2024/irsForms/ScheduleA.ts \\
    public/forms/Y2024/irs/f1040sa.pdf
    `)
    process.exit(1)
  }

  const [formTsPath, fieldSource] = args

  // --- Parse TypeScript source ---
  console.log(`\nParsing fields() from: ${formTsPath}`)
  let source: string
  try {
    source = await readFile(formTsPath, 'utf-8')
  } catch (err) {
    console.error(`Cannot read ${formTsPath}:`, err)
    process.exit(1)
  }

  let parseResult: ReturnType<typeof parseFieldsArray>
  try {
    parseResult = parseFieldsArray(source)
  } catch (err) {
    console.error('Error parsing fields():', err)
    process.exit(1)
  }

  const { elements, hasMap, hasSpread } = parseResult
  console.log(`  → Found ${elements.length} field expression(s)`)
  if (hasMap) {
    console.log(
      '  → Trailing .map() detected — stripping (fillPDFByName handles formatting)'
    )
  }
  if (hasSpread) {
    const spreads = elements.filter((e) => e.startsWith('...'))
    console.log(
      `  → WARNING: Spread expression(s) detected: ${spreads.join(', ')}`
    )
    console.log(
      '    These will be marked as TODO in the output. Handle manually.'
    )
  }

  // --- Load PDF fields ---
  console.log(`\nLoading PDF fields from: ${fieldSource}`)
  let pdfFields: PdfField[]
  try {
    pdfFields = await loadPdfFields(fieldSource)
  } catch (err) {
    console.error('Error loading PDF fields:', err)
    process.exit(1)
  }
  console.log(`  → Found ${pdfFields.length} field(s) in PDF/schema`)

  // --- Validate count ---
  if (elements.length !== pdfFields.length) {
    console.warn(
      `\n  ⚠ Count mismatch: ${elements.length} TS expressions vs ${pdfFields.length} PDF fields`
    )
    if (hasSpread) {
      // Account for the spread taking 1 slot in elements but N slots in PDF
      const nonSpread = elements.filter((e) => !e.startsWith('...')).length
      const spreadCount = pdfFields.length - nonSpread
      console.warn(
        `    Non-spread expressions: ${nonSpread}, spread should expand to: ${spreadCount}`
      )
    }
  } else {
    console.log(`  ✓ Count matches: ${elements.length}`)
  }

  // --- Generate output ---
  const code = generateFillInstructions(elements, pdfFields)

  console.log('\n=== Generated fillInstructions() — copy into form class ===\n')
  console.log(code)
  console.log('\n=== End ===')

  console.log('\nNext steps:')
  console.log('  1. Copy the fillInstructions() method into the form class')
  console.log(
    "  2. Add imports: import { FillInstructions, text, checkbox, radio } from 'ustaxes/core/pdfFiller'"
  )
  if (hasSpread) {
    console.log(
      '  3. Manually expand any TODO spread entries using indexed accessors'
    )
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
