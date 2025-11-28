---
name: extract-documents
description: "Extract tax data from documents (W-2, 1099, receipts, etc.) and populate tax return"
args:
  - name: documentPath
    description: "Path to tax document (PDF, image, etc.)"
    required: true
  - name: documentType
    description: "Optional document type hint (w2, 1099-int, 1099-div, etc.)"
    required: false
  - name: year
    description: "Tax year (default: 2024)"
    required: false
---

# Extract Tax Documents

Extract structured data from tax documents using Claude's document analysis and populate your tax return via the **UsTaxes MCP Server**.

## What This Command Does

This command:
- ✅ Reads and analyzes tax documents (PDFs, images, scans)
- ✅ Extracts key fields using Claude's multimodal vision capabilities
- ✅ Maps extracted data to UsTaxes data structures
- ✅ Populates your tax return via MCP tools
- ✅ Validates extracted data for accuracy

## What This Command Does NOT Do

This command does NOT:
- ❌ Use OCR MCP server (none implemented - uses Claude's built-in vision)
- ❌ Guarantee 100% accuracy (always review extracted data)
- ❌ Handle handwritten forms (typed/printed forms work best)
- ❌ Extract from non-standard formats

## Supported Document Types

### Employer Forms
- **W-2** - Wage and Tax Statement
- **W-2G** - Gambling winnings

### 1099 Forms
- **1099-INT** - Interest income
- **1099-DIV** - Dividend income
- **1099-B** - Investment sales
- **1099-NEC** - Non-employee compensation (self-employment)
- **1099-MISC** - Miscellaneous income
- **1099-R** - Retirement distributions

### Deduction Forms
- **1098** - Mortgage interest
- **1098-E** - Student loan interest
- **1098-T** - Tuition statement

### Other
- Property tax statements
- Charitable donation receipts
- HSA/IRA contribution statements

## MCP Tools Used

Depending on the document type:
- `ustaxes_add_w2` - For W-2 forms
- `ustaxes_add_1099` - For 1099 forms
- `ustaxes_add_student_loan` - For 1098-E forms
- `ustaxes_add_hsa` - For HSA statements
- `ustaxes_add_ira` - For IRA contribution statements
- `ustaxes_set_itemized_deductions` - For deductible expenses

## Extraction Workflow

### Phase 1: Read and Analyze Document

```typescript
const documentPath = args.documentPath
const documentType = args.documentType // Optional hint
const taxYear = args.year ?? 2024

console.log(`Analyzing document: ${documentPath}`)
console.log(`Document type: ${documentType || 'auto-detect'}`)
console.log(`Tax year: ${taxYear}\n`)

// Read the document using Claude's Read tool (supports PDF, images)
const documentContent = await readFile(documentPath)

// Claude will analyze the document visually and extract text
console.log('Analyzing document structure...\n')
```

### Phase 2: Detect Document Type

```typescript
// If document type not provided, detect from visual inspection
let detectedType = documentType

if (!detectedType) {
  // Claude examines the document visually
  // Look for key indicators:
  // - "Form W-2" in header → W-2
  // - "Form 1099-INT" → 1099-INT
  // - "Form 1099-DIV" → 1099-DIV
  // - "Form 1099-NEC" → 1099-NEC
  // - "Form 1098-E" → Student loan interest
  // etc.

  console.log('Document type detected: [TYPE]')
  detectedType = '[DETECTED_TYPE]'
}
```

### Phase 3: Extract Fields Based on Document Type

#### W-2 Extraction

```typescript
if (detectedType === 'w2') {
  console.log('Extracting W-2 data...\n')

  // Extract from standard W-2 form boxes
  const w2Data = {
    // Box a: Employee's SSN (do not log)
    // Box b: Employer EIN
    ein: extractFromBox('b'),

    // Box c: Employer name and address
    employerName: extractFromBox('c', 'name'),

    // Box d: Control number (optional)

    // Box e: Employee name (for verification)
    // Box f: Employee address (for verification)

    // Income boxes
    income: parseFloat(extractFromBox('1')),              // Box 1: Wages, tips, other comp
    fedWithholding: parseFloat(extractFromBox('2')),      // Box 2: Federal income tax withheld
    ssWages: parseFloat(extractFromBox('3')),             // Box 3: Social security wages
    ssWithholding: parseFloat(extractFromBox('4')),       // Box 4: Social security tax withheld
    medicareIncome: parseFloat(extractFromBox('5')),      // Box 5: Medicare wages and tips
    medicareWithholding: parseFloat(extractFromBox('6')), // Box 6: Medicare tax withheld

    // State boxes (if present)
    state: extractFromBox('15'),                          // Box 15: State
    stateWages: parseFloat(extractFromBox('16')),         // Box 16: State wages
    stateWithholding: parseFloat(extractFromBox('17')),   // Box 17: State income tax

    // Additional info
    occupation: '[EXTRACTED_JOB_TITLE]',
    personRole: 'PRIMARY' // Or ask user
  }

  // Validate extracted data
  console.log('Extracted W-2 data:')
  console.log(`  Employer: ${w2Data.employerName}`)
  console.log(`  EIN: ${w2Data.ein}`)
  console.log(`  Box 1 (Wages): $${w2Data.income.toLocaleString()}`)
  console.log(`  Box 2 (Federal withholding): $${w2Data.fedWithholding.toLocaleString()}`)
  console.log(`  Box 5 (Medicare wages): $${w2Data.medicareIncome.toLocaleString()}`)
  console.log(`\n`)

  // Ask user to verify
  const confirmed = await askUser('Does this data look correct?', ['Yes', 'No, let me edit'])

  if (confirmed === 'Yes') {
    // Populate using MCP
    await mcp.ustaxes_add_w2({
      year: taxYear,
      w2: w2Data
    })

    console.log('✓ W-2 added to tax return')
  } else {
    // Allow manual correction
    console.log('Please correct the following fields:')
    // Interactive field correction...
  }
}
```

#### 1099-INT Extraction

```typescript
if (detectedType === '1099-int') {
  console.log('Extracting 1099-INT data...\n')

  const f1099Data = {
    form: '1099-INT',
    payer: extractFromBox('payer'),
    payerTin: extractFromBox('payer_tin'),
    personRole: 'PRIMARY',
    income: parseFloat(extractFromBox('1')),              // Box 1: Interest income
    interest: parseFloat(extractFromBox('1')),            // Same as income for INT
    earlyWithdrawalPenalty: parseFloat(extractFromBox('2')), // Box 2: Early withdrawal penalty
    usSavingsBondsInterest: parseFloat(extractFromBox('3')), // Box 3: Interest on US savings bonds
    fedWithholding: parseFloat(extractFromBox('4')),      // Box 4: Federal income tax withheld
    taxExemptInterest: parseFloat(extractFromBox('8'))    // Box 8: Tax-exempt interest
  }

  console.log('Extracted 1099-INT data:')
  console.log(`  Payer: ${f1099Data.payer}`)
  console.log(`  Box 1 (Interest): $${f1099Data.interest.toLocaleString()}`)
  console.log(`  Box 4 (Withholding): $${(f1099Data.fedWithholding || 0).toLocaleString()}`)
  console.log(`\n`)

  const confirmed = await askUser('Does this data look correct?', ['Yes', 'No'])

  if (confirmed === 'Yes') {
    await mcp.ustaxes_add_1099({
      year: taxYear,
      form1099: f1099Data
    })

    console.log('✓ 1099-INT added to tax return')
  }
}
```

#### 1099-DIV Extraction

```typescript
if (detectedType === '1099-div') {
  console.log('Extracting 1099-DIV data...\n')

  const f1099Data = {
    form: '1099-DIV',
    payer: extractFromBox('payer'),
    payerTin: extractFromBox('payer_tin'),
    personRole: 'PRIMARY',
    income: parseFloat(extractFromBox('1a')),             // Box 1a: Total ordinary dividends
    dividends: parseFloat(extractFromBox('1a')),          // Same as income for DIV
    qualifiedDividends: parseFloat(extractFromBox('1b')), // Box 1b: Qualified dividends
    capitalGain: parseFloat(extractFromBox('2a')),        // Box 2a: Total capital gain
    fedWithholding: parseFloat(extractFromBox('4'))       // Box 4: Federal income tax withheld
  }

  console.log('Extracted 1099-DIV data:')
  console.log(`  Payer: ${f1099Data.payer}`)
  console.log(`  Box 1a (Ordinary dividends): $${f1099Data.dividends.toLocaleString()}`)
  console.log(`  Box 1b (Qualified dividends): $${(f1099Data.qualifiedDividends || 0).toLocaleString()}`)
  console.log(`\n`)

  const confirmed = await askUser('Does this data look correct?', ['Yes', 'No'])

  if (confirmed === 'Yes') {
    await mcp.ustaxes_add_1099({
      year: taxYear,
      form1099: f1099Data
    })

    console.log('✓ 1099-DIV added to tax return')
  }
}
```

#### 1099-NEC Extraction (Self-Employment)

```typescript
if (detectedType === '1099-nec') {
  console.log('Extracting 1099-NEC data...\n')

  const f1099Data = {
    form: '1099-NEC',
    payer: extractFromBox('payer'),
    payerTin: extractFromBox('payer_tin'),
    personRole: 'PRIMARY',
    income: parseFloat(extractFromBox('1')),              // Box 1: Nonemployee compensation
    nonEmployeeCompensation: parseFloat(extractFromBox('1')),
    fedWithholding: parseFloat(extractFromBox('4'))       // Box 4: Federal income tax withheld
  }

  console.log('Extracted 1099-NEC data:')
  console.log(`  Payer: ${f1099Data.payer}`)
  console.log(`  Box 1 (Compensation): $${f1099Data.nonEmployeeCompensation.toLocaleString()}`)
  console.log(`\n`)

  const confirmed = await askUser('Does this data look correct?', ['Yes', 'No'])

  if (confirmed === 'Yes') {
    await mcp.ustaxes_add_1099({
      year: taxYear,
      form1099: f1099Data
    })

    console.log('✓ 1099-NEC added to tax return')
    console.log('⚠️  Note: Self-employment income requires Schedule C.')
    console.log('    You may need additional tax preparation for business expenses.')
  }
}
```

#### 1098-E Extraction (Student Loan Interest)

```typescript
if (detectedType === '1098-e') {
  console.log('Extracting 1098-E data...\n')

  const f1098eData = {
    lender: extractFromBox('lender'),
    interest: parseFloat(extractFromBox('1'))             // Box 1: Student loan interest
  }

  console.log('Extracted 1098-E data:')
  console.log(`  Lender: ${f1098eData.lender}`)
  console.log(`  Box 1 (Interest): $${f1098eData.interest.toLocaleString()}`)
  console.log(`\n`)

  // Note: Student loan interest deduction is capped at $2,500
  if (f1098eData.interest > 2500) {
    console.log(`⚠️  Note: Deduction is capped at $2,500 (you paid $${f1098eData.interest.toLocaleString()})`)
  }

  const confirmed = await askUser('Does this data look correct?', ['Yes', 'No'])

  if (confirmed === 'Yes') {
    await mcp.ustaxes_add_student_loan({
      year: taxYear,
      f1098e: f1098eData
    })

    console.log('✓ Student loan interest added to tax return')
  }
}
```

### Phase 4: Data Validation

```typescript
// Common validations
const validations = []

// Check for missing required fields
if (!extractedData.payer && needsPayer) {
  validations.push('⚠️  Payer name could not be extracted')
}

// Check numeric fields are reasonable
if (extractedData.income && extractedData.income < 0) {
  validations.push('❌ Income cannot be negative')
}

if (extractedData.fedWithholding && extractedData.income) {
  if (extractedData.fedWithholding > extractedData.income) {
    validations.push('⚠️  Withholding exceeds income (unusual)')
  }
}

// Check format of identifiers
if (extractedData.ein && !/^\d{2}-\d{7}$/.test(extractedData.ein)) {
  validations.push('⚠️  EIN format may be incorrect (should be XX-XXXXXXX)')
}

// Display validation results
if (validations.length > 0) {
  console.log('\nValidation warnings:')
  validations.forEach(v => console.log(`  ${v}`))
  console.log()
}
```

### Phase 5: Summary and Next Steps

```typescript
console.log('\n' + '='.repeat(60))
console.log('EXTRACTION COMPLETE')
console.log('='.repeat(60))
console.log(`\nDocument type: ${detectedType}`)
console.log(`Tax year: ${taxYear}`)
console.log(`Status: ${validations.length === 0 ? '✅ Added to return' : '⚠️  Review recommended'}`)

console.log('\nNext steps:')
console.log('1. Verify extracted data in your tax return')
console.log('2. Process additional documents if needed')
console.log('3. Run /prepare-return to complete missing fields')
console.log('4. Run /validate-return before filing')

console.log('\n' + '='.repeat(60))
```

## Confidence Scores

When extracting data, Claude provides confidence levels:

- **High (90-100%)**: Clear, printed text in standard form format
- **Medium (70-89%)**: Slightly degraded quality or non-standard format
- **Low (<70%)**: Poor scan quality, handwritten, or unclear

**Always review extracted data regardless of confidence level.**

## Error Handling

**Document Not Found:**
```
❌ Cannot read file: [path]

Solution:
1. Verify the file path is correct
2. Ensure the file exists and is readable
3. Check file permissions
```

**Unsupported Format:**
```
⚠️  Document format not supported: [format]

Supported formats:
- PDF (.pdf)
- Images (.jpg, .png, .tiff)
- Scanned documents

Solution:
1. Convert document to PDF or image format
2. Ensure document is not password-protected
```

**Extraction Failed:**
```
❌ Could not extract data from document

This may occur due to:
- Poor image quality
- Handwritten forms
- Non-standard format
- Corrupted file

Solution:
1. Try a higher quality scan
2. Use typed/printed forms when possible
3. Enter data manually using /prepare-return
```

**Ambiguous Data:**
```
⚠️  Some fields could not be extracted with confidence

Missing fields:
- Employer EIN
- State withholding

Solution:
1. Review the document manually
2. Use /prepare-return to add missing data
3. Re-scan document with better quality if possible
```

## Best Practices

1. **Use high-quality scans** - 300 DPI or higher recommended
2. **Ensure good lighting** - No shadows or glare on document
3. **Keep documents flat** - Avoid wrinkles or folds
4. **Use standard forms** - Official IRS forms work best
5. **Review all extracted data** - Never trust 100% without verification
6. **Process one document at a time** - Easier to catch errors
7. **Keep originals** - Maintain physical/digital copies of all documents

## Batch Processing

To process multiple documents:

```bash
# Process each document one at a time
/extract-documents /path/to/w2-employer1.pdf w2 2024
/extract-documents /path/to/w2-employer2.pdf w2 2024
/extract-documents /path/to/1099-int-bank.pdf 1099-int 2024
/extract-documents /path/to/1098-e-loans.pdf 1098-e 2024

# Or use a loop
for doc in /path/to/tax-docs-2024/*.pdf; do
  /extract-documents "$doc" 2024
done
```

## Limitations

This extraction command:
- ✅ **Can** read most standard IRS forms
- ✅ **Can** extract clear, typed text
- ✅ **Can** handle PDF and image formats
- ❌ **Cannot** read handwritten forms reliably
- ❌ **Cannot** guarantee 100% accuracy
- ❌ **Cannot** handle password-protected PDFs
- ❌ **Cannot** extract from extremely poor quality scans

**Always review extracted data before filing.**

## Privacy Notice

- Documents are analyzed in-memory only
- No data is stored or transmitted after extraction
- Sensitive information (SSNs) is not logged
- Original documents remain unchanged
- Extracted data goes directly to your local tax return

## Example Usage

```bash
# Auto-detect document type
/extract-documents /tmp/my-w2.pdf

# Specify document type explicitly
/extract-documents /tmp/my-w2.pdf w2

# Specify tax year
/extract-documents /tmp/my-w2.pdf w2 2023

# Process 1099-INT
/extract-documents /path/to/bank-interest.pdf 1099-int 2024

# Process student loan interest
/extract-documents /path/to/student-loan.pdf 1098-e 2024
```

## After Extraction

Once documents are extracted:
1. **Verify** - Check all extracted values for accuracy
2. **Complete** - Run `/prepare-return` to fill any missing fields
3. **Validate** - Run `/validate-return` to check for issues
4. **File** - Generate PDFs and file your return

---

**Important:** This command uses Claude's built-in multimodal vision capabilities for document analysis, not a separate OCR MCP server. Extraction accuracy depends on document quality and format.

---

*This command uses only the real UsTaxes MCP Server tools for data population. Document reading uses Claude Code's standard Read tool and Claude's vision capabilities.*
