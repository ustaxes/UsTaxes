---
name: tax-document-analyzer
description: Analyze and extract structured data from tax documents. Automatically invoked when user provides tax documents, W-2s, 1099s, receipts, or bank statements.
allowed-tools: [Read, Bash, WebFetch]
---

# Tax Document Analyzer

You automatically analyze tax documents to extract structured data.

## Automatic Activation
Invoke this skill when:
- User mentions "here's my W-2" or similar
- User provides file path to tax document
- User uploads/shares tax-related PDF or image
- User asks to "analyze" or "extract" from document

## Capabilities
- Text extraction from PDFs
- Document type identification
- Form field extraction
- Data validation against IRS structures
- Confidence scoring

## Document Types Supported

### W-2 (Wage and Tax Statement)
Extract all boxes:
- Box 1: Wages, tips, other compensation → `income`
- Box 2: Federal income tax withheld → `fedWithholding`
- Box 3: Social security wages → `ssWages`
- Box 4: Social security tax withheld → `ssWithholding`
- Box 5: Medicare wages and tips → `medicareIncome`
- Box 6: Medicare tax withheld → `medicareWithholding`
- Box 12: Various codes → `box12`
- Boxes 15-17: State info → `state`, `stateWages`, `stateWithholding`
- Employer info → `EIN`, `employerName`, `address`

### 1099-INT (Interest Income)
Extract:
- Box 1: Interest income → `income`
- Box 3: Interest on US savings bonds → `usSavingsBondsInterest`
- Box 8: Tax-exempt interest → `taxExemptInterest`
- Payer info → `payer`

### 1099-DIV (Dividends)
Extract:
- Box 1a: Total ordinary dividends → `dividends`
- Box 1b: Qualified dividends → `qualifiedDividends`
- Box 2a: Total capital gain distributions → `capitalGain`
- Payer info → `payer`

### 1099-B (Broker Transactions)
Extract:
- Short-term proceeds → `shortTermProceeds`
- Short-term cost basis → `shortTermCostBasis`
- Long-term proceeds → `longTermProceeds`
- Long-term cost basis → `longTermCostBasis`
- Payer info → `payer`

### 1099-R (Retirement Distributions)
Extract:
- Box 1: Gross distribution → `grossDistribution`
- Box 2a: Taxable amount → `taxableAmount`
- Box 4: Federal income tax withheld → `federalWithholding`
- Payer info → `payer`

### 1098-E (Student Loan Interest)
Extract:
- Box 1: Student loan interest received → `interest`
- Lender info → `lender`

### Receipts/Invoices
Extract:
- Date → `date`
- Vendor → `vendor`
- Amount → `amount`
- Category → `category` (meals, supplies, travel, etc.)
- Business purpose → `description`

## Extraction Process

### Step 1: Document Type Detection
Analyze document to determine type:
- Look for IRS form numbers (Form W-2, Form 1099-INT, etc.)
- Check for characteristic fields
- Verify tax year

### Step 2: Text Extraction
- Read PDF text content
- Parse structured fields
- Extract all relevant numbers and text
- Preserve formatting where important

### Step 3: Field Mapping
Map extracted text to UsTaxes data model:
- Use `irs-form-structures.json` for field mappings
- Handle variations in form layouts
- Deal with missing/optional fields

### Step 4: Data Validation
Validate extracted data:
- Check required fields are present
- Verify numeric values are valid
- Validate SSN/EIN formats
- Check state codes
- Verify ZIP codes

### Step 5: Confidence Scoring
Assign confidence scores (0-100) based on:
- Field clarity in source document
- Successful validation
- Presence of expected values
- Document quality

## Output Format

Return JSON matching UsTaxes interfaces:

```json
{
  "documentType": "W2",
  "taxYear": 2024,
  "extractedData": {
    "occupation": "Software Engineer",
    "income": 120000,
    "medicareIncome": 120000,
    "fedWithholding": 18000,
    "ssWages": 120000,
    "ssWithholding": 7440,
    "medicareWithholding": 1740,
    "employer": {
      "EIN": "12-3456789",
      "employerName": "Tech Company Inc",
      "address": {
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105"
      }
    },
    "personRole": "PRIMARY"
  },
  "confidence": {
    "income": 100,
    "fedWithholding": 100,
    "ssWages": 100,
    "employer": 95,
    "overall": 98
  },
  "ambiguities": [],
  "validationErrors": [],
  "readyForDispatch": true
}
```

## Validation Rules

### Required Fields by Document Type

**W-2:**
- Required: income, fedWithholding, ssWages, ssWithholding, medicareIncome, medicareWithholding, employer.EIN, employer.employerName
- Optional: occupation, state info, box12

**1099-INT:**
- Required: payer, income
- Optional: usSavingsBondsInterest, taxExemptInterest

**1099-DIV:**
- Required: payer, dividends
- Optional: qualifiedDividends, capitalGain

**1099-B:**
- Required: payer, either short-term or long-term data
- Optional: cost basis (if not reported by broker)

### Format Validation

- **SSN:** 9 digits, format XXX-XX-XXXX
- **EIN:** 9 digits, format XX-XXXXXXX
- **State Code:** Valid 2-letter US state code
- **ZIP:** 5 digits or 9 digits (XXXXX-XXXX)
- **Currency:** Positive numbers, up to 2 decimal places

## Error Handling

### Missing Required Fields
```json
{
  "validationErrors": [
    {
      "field": "fedWithholding",
      "error": "Required field not found in document",
      "suggestion": "Check Box 2 on W-2 form"
    }
  ]
}
```

### Ambiguous Values
```json
{
  "ambiguities": [
    {
      "field": "income",
      "extractedValue": "120,000 or 121,000",
      "reason": "Document text unclear",
      "suggestion": "Manual verification needed"
    }
  ]
}
```

### Low Confidence
If overall confidence < 90%, recommend manual review.

## Integration with Redux

After successful extraction:

1. Present data to user
2. Ask for confirmation
3. Dispatch to Redux store:

```typescript
import { addW2 } from 'ustaxes/redux/actions'
import * as validators from 'ustaxes/core/data/validate'

// Validate before dispatch
if (validators.incomeW2(extractedData)) {
  dispatch(addW2(extractedData))
} else {
  // Report validation errors
}
```

## Supporting Files

Reference these files in the skill directory:
- `irs-form-structures.json` - Field mappings and validation rules
- `validation-rules.json` - Data validation rules
- `common-variations.json` - Handle form layout variations

## Tips for Accurate Extraction

1. **Tax Year Matters:** Always extract and verify the tax year - form layouts change
2. **Employer vs Payer:** W-2 has "employer", 1099 has "payer"
3. **Person Role:** Determine if income is for PRIMARY or SPOUSE
4. **State Information:** W-2 can have multiple state entries
5. **Box 12 Codes:** W-2 Box 12 has letter codes (D, DD, W, etc.)

## Example Workflow

```
User: "Here's my W-2 at /path/to/w2.pdf"
  ↓
[Skill Auto-Activates]
  ↓
1. Read PDF content
2. Detect: This is a W-2 form for tax year 2024
3. Extract all box values
4. Map to IncomeW2 interface
5. Validate all fields
6. Calculate confidence scores
  ↓
Present extracted data:
"I've extracted the following W-2 data:
- Employer: Tech Company Inc
- Income (Box 1): $120,000
- Federal Withholding (Box 2): $18,000
- ...

Confidence: 98%
Ready to add to your tax return?"
```

## Next Steps After Extraction

1. **Single Document:** Offer to dispatch to Redux
2. **Multiple Documents:** Offer batch processing
3. **Validation Errors:** Explain issues and suggest fixes
4. **Low Confidence:** Recommend manual review of specific fields
5. **Complete Set:** Suggest next steps in tax preparation workflow
