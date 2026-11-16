#!/usr/bin/env ts-node
/**
 * Reads a pre-generated fillInstructions() output file (from migrateToNativeInstructions.ts)
 * and inserts the method into the corresponding form TypeScript file.
 *
 * Usage:
 *   ts-node scripts/integrateInstructions.ts <form.ts> <output.txt>
 *
 * The script:
 *  1. Extracts the fillInstructions() code block from the output file
 *  2. Inserts it before the closing } of the class in the form file
 *  3. Adds FillInstructions, text, checkbox to the pdfFiller import
 *  4. Writes the updated file (dry-run by default, pass --write to save)
 */

import { readFile, writeFile } from 'fs/promises'
import ts from 'typescript'

function extractGeneratedCode(outputTxt: string): string {
  const startMarker =
    '=== Generated fillInstructions() — copy into form class ==='
  const endMarker = '=== End ==='
  const start = outputTxt.indexOf(startMarker)
  const end = outputTxt.indexOf(endMarker, start)
  if (start === -1 || end === -1) {
    throw new Error('Could not find generated code markers in output file')
  }
  // Content between start marker (skip the line) and end marker
  const code = outputTxt
    .slice(outputTxt.indexOf('\n', start) + 1, end)
    .trimEnd()
  // Strip leading blank lines
  return code.replace(/^\n+/, '')
}

function updateImport(source: string): string {
  const file = ts.createSourceFile(
    'form.ts',
    source,
    ts.ScriptTarget.Latest,
    true
  )
  const imports = file.statements.filter(
    (statement): statement is ts.ImportDeclaration =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === 'ustaxes/core/pdfFiller'
  )
  const typeNames = new Set([
    'Field',
    'RenderedField',
    'RadioSelect',
    'FillInstruction',
    'FillInstructions'
  ])
  const types = new Set(['FillInstructions'])
  const values = new Set(['text', 'checkbox', 'radio'])
  const namedImports: ts.ImportDeclaration[] = []
  for (const declaration of imports) {
    const clause = declaration.importClause
    const bindings = clause?.namedBindings
    if (
      clause === undefined ||
      bindings === undefined ||
      !ts.isNamedImports(bindings)
    ) {
      continue
    }
    namedImports.push(declaration)
    for (const specifier of bindings.elements) {
      const name = (specifier.propertyName ?? specifier.name).text
      const names =
        clause.isTypeOnly || specifier.isTypeOnly || typeNames.has(name)
          ? types
          : values
      names.add(specifier.getText(file).replace(/^type\s+/, ''))
    }
  }
  const replacement = `import type { ${Array.from(types).join(', ')} } from 'ustaxes/core/pdfFiller'
import { ${Array.from(values).join(', ')} } from 'ustaxes/core/pdfFiller'`
  if (namedImports.length === 0) return replacement + '\n' + source
  for (let index = namedImports.length - 1; index >= 0; index--) {
    const declaration = namedImports[index]
    source =
      source.slice(0, declaration.getStart(file)) +
      (index === 0 ? replacement : '') +
      source.slice(declaration.end)
  }
  return source
}

function insertFillInstructions(source: string, code: string): string {
  // Find the last closing brace of the class (last } in file)
  const lastBrace = source.lastIndexOf('\n}')
  if (lastBrace === -1) {
    throw new Error('Could not find closing } of class')
  }
  return source.slice(0, lastBrace) + '\n\n' + code + source.slice(lastBrace)
}

async function main() {
  const args = process.argv.slice(2)
  const write = args.includes('--write')
  const files = args.filter((a) => !a.startsWith('-'))

  if (files.length < 2) {
    console.log(`
Usage:
  ts-node scripts/integrateInstructions.ts [--write] <form.ts> <output.txt>

  --write   Write changes to disk (default is dry-run)
    `)
    process.exit(1)
  }

  const [formPath, outputPath] = files

  const [source, outputTxt] = await Promise.all([
    readFile(formPath, 'utf-8'),
    readFile(outputPath, 'utf-8')
  ])

  const code = extractGeneratedCode(outputTxt)
  const updated = insertFillInstructions(updateImport(source), code)

  if (write) {
    await writeFile(formPath, updated)
    console.log(`✓ Written: ${formPath}`)
  } else {
    console.log(`--- DRY RUN: would update ${formPath} ---`)
    // Show diff-like view of last 20 lines
    const newLines = updated.split('\n')
    const oldLines = source.split('\n')
    console.log(`Old: ${oldLines.length} lines → New: ${newLines.length} lines`)
    console.log('Last 10 lines of new file:')
    console.log(newLines.slice(-10).join('\n'))
  }
}

main().catch((err) => {
  console.error('Fatal:', err)
  process.exit(1)
})
