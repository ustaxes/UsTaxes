# Tax Document Test Fixtures

This directory contains sample tax documents in JSON format for testing the Claude Code tax automation layer.

## Purpose

These fixtures provide:
1. **Realistic test data** for development and testing
2. **Documentation** of expected data structures
3. **Validation examples** for document extraction
4. **Integration test cases** for the full workflow

## Files

### W-2 Forms
- `sample-w2-1.json` - Primary taxpayer with $120K income (software engineer)
- `sample-w2-2.json` - Spouse with $55K income (teacher)

### 1099 Forms
- `sample-1099-int.json` - Interest income ($450)
- `sample-1099-div.json` - Dividends and capital gains ($3,250 dividends, $1,500 cap gains)
- `sample-1099-b.json` - Stock transactions ($3K short-term gain, $7K long-term gain)

## Test Scenarios

### Scenario 1: Simple Return (W-2 Only)
Use `sample-w2-1.json`
- Filing Status: Single
- Income: $120,000
- Federal Withholding: $18,000
- Expected Tax: ~$18,300
- Expected Refund: ~$0 (slight payment due)

### Scenario 2: Married Filing Jointly
Use `sample-w2-1.json` + `sample-w2-2.json`
- Filing Status: Married Filing Jointly
- Combined Income: $175,000
- Combined Federal Withholding: $24,500
- Expected Tax: ~$25,000
- Expected Refund/Payment: ~$500 payment due

### Scenario 3: W-2 + Investment Income
Use `sample-w2-1.json` + `sample-1099-int.json` + `sample-1099-div.json` + `sample-1099-b.json`
- Filing Status: Single
- W-2 Income: $120,000
- Interest Income: $450
- Dividend Income: $3,250 (qualified: $2,800)
- Capital Gains: $10,000 ($3K short-term, $7K long-term)
- Total Income: $133,700
- Expected Tax: ~$22,500
- Forms Needed: 1040, Schedule B, Schedule D, Form 8949

## Using Test Fixtures

### Command Line Testing
```bash
# Extract and validate
/extract-documents .claude/test-fixtures/sample-w2-1.json W2

# Estimate taxes
/estimate-taxes 120000 single
```

### Programmatic Testing
```typescript
import testData from '.claude/test-fixtures/sample-w2-1.json'
import { addW2 } from 'ustaxes/redux/actions'
import * as validators from 'ustaxes/core/data/validate'

// Validate
if (validators.incomeW2(testData.extractedData)) {
  dispatch(addW2(testData.extractedData))
}
```

### Integration Testing
1. Load fixture
2. Extract data
3. Validate against schema
4. Dispatch to Redux
5. Generate forms
6. Verify PDF output

## Validation Checklist

When using fixtures, verify:
- ✅ All required fields present
- ✅ Numeric values in valid ranges
- ✅ SSN/EIN formats correct
- ✅ State codes valid
- ✅ ZIP codes valid
- ✅ Math calculations correct
- ✅ Cross-form references valid

## Adding New Fixtures

To create new fixtures:
1. Use actual IRS form data (anonymized)
2. Follow the structure in existing fixtures
3. Include all required fields from `irs-form-structures.json`
4. Add confidence scores
5. Document any special cases in `description`
6. Update this README with new scenario

## Data Privacy

**IMPORTANT:**
- Never use real SSNs, EINs, or personal information
- All test data must be fictional
- Use pattern: `12-3456789` for EINs, `123-45-6789` for SSNs
- Use generic names and addresses

## Form Generation Testing

To test complete form generation:
```bash
cd /mnt/nas/data/code/forks/UsTaxes

# Load test data
# (Would need to programmatically dispatch actions or manually enter via UI)

# Generate PDF
# (Use /validate-return command or generate via UI)
```

## Expected Results

### Sample W-2 #1 (Single, $120K)
```
Standard Deduction: $14,600
Taxable Income: $105,400
Tax (2024 brackets):
- 10% on $11,600 = $1,160
- 12% on $35,550 = $4,266
- 22% on $53,375 = $11,743
- 24% on $4,875 = $1,170
Total Tax: $18,339
Withholding: $18,000
Amount Owed: $339
```

### Sample W-2 #1 + #2 (MFJ, $175K)
```
Standard Deduction: $29,200
Taxable Income: $145,800
Tax (2024 MFJ brackets):
- 10% on $23,200 = $2,320
- 12% on $71,100 = $8,532
- 22% on $51,500 = $11,330
Total Tax: $22,182
Withholding: $24,500
Refund: $2,318
```

## Troubleshooting

### Validation Errors
Check that all required fields match the schema in `irs-form-structures.json`

### Confidence Scores Low
Review extraction logic and document quality

### Redux Dispatch Fails
Verify AJV validation passes before dispatch

### PDF Generation Issues
Ensure all dependencies are installed and state is complete

---

Last Updated: 2025-11-27
