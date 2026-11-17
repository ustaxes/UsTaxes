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

import { readFileSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'
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

const pdfFillerIndex = path.resolve(__dirname, '../src/core/pdfFiller/index.ts')

// Types exported by pdfFiller, read from its index so that a type added there
// goes into the type-only import without a change here.
function pdfFillerTypeNames(): Set<string> {
  const file = ts.createSourceFile(
    pdfFillerIndex,
    readFileSync(pdfFillerIndex, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  )
  const names = new Set<string>()
  for (const statement of file.statements) {
    if (
      (ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement)) &&
      (ts.getCombinedModifierFlags(statement) & ts.ModifierFlags.Export) !== 0
    ) {
      names.add(statement.name.text)
    }
  }
  return names
}

// Forms import pdfFiller through the alias, and formgen output uses a relative path.
const isPdfFillerPath = (specifier: string): boolean =>
  specifier === 'pdfFiller' || specifier.endsWith('/pdfFiller')

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
      isPdfFillerPath(statement.moduleSpecifier.text)
  )
  const modulePath =
    imports.length > 0 && ts.isStringLiteral(imports[0].moduleSpecifier)
      ? imports[0].moduleSpecifier.text
      : 'ustaxes/core/pdfFiller'
  const typeNames = pdfFillerTypeNames()
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
  const typeList = Array.from(types).join(', ')
  const valueList = Array.from(values).join(', ')
  const replacement = `import type { ${typeList} } from '${modulePath}'
import { ${valueList} } from '${modulePath}'`
  if (namedImports.length === 0) return replacement + '\n' + source
  for (let index = namedImports.length - 1; index >= 0; index--) {
    const declaration = namedImports[index]
    if (index === 0) {
      source =
        source.slice(0, declaration.getStart(file)) +
        replacement +
        source.slice(declaration.end)
      continue
    }
    // Remove the whole line, with any comments above or after the import.
    const leading =
      ts.getLeadingCommentRanges(source, declaration.getFullStart()) ?? []
    const trailing = ts.getTrailingCommentRanges(source, declaration.end) ?? []
    const start =
      leading.length > 0 ? leading[0].pos : declaration.getStart(file)
    let end =
      trailing.length > 0 ? trailing[trailing.length - 1].end : declaration.end
    const lineBreak = /^[ \t]*\r?\n/.exec(source.slice(end))
    if (lineBreak !== null) end += lineBreak[0].length
    source = source.slice(0, start) + source.slice(end)
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
