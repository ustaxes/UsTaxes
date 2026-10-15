# Claude Code Tax Automation Test Suite

Comprehensive testing framework for autonomous tax return preparation.

## ⚠️ IMPORTANT: Privacy & Git

**This directory is .gitignored and should NEVER be committed.**

- Contains real tax documents from `~/files/taxes`
- Includes actual PII (SSNs, names, addresses, financial data)
- Test results may contain sensitive information
- Keep this directory local only

## Overview

This test suite validates the entire tax automation workflow:

1. Document extraction (W-2, 1099, receipts)
2. Intelligent questioning
3. Redux state population
4. Form generation
5. Tax calculation accuracy
6. Audit validation
7. PDF generation

## Directory Structure

```
.claude/test-suite/
├── README.md                 # This file
├── run-tests.sh              # Main test runner
├── test-cases/               # Test case definitions
│   ├── simple-w2.json
│   ├── married-filing-jointly.json
│   ├── complex-return.json
│   ├── rental-property.json
│   ├── self-employed.json
│   └── itemized-deductions.json
├── expected-results/         # Expected outputs for validation
│   ├── simple-w2/
│   │   ├── redux-state.json
│   │   ├── tax-calculation.json
│   │   └── forms-list.txt
│   └── ...
└── test-data/               # Symlinks to ~/files/taxes
    ├── 2024/ -> ~/files/taxes/2024/
    ├── 2023/ -> ~/files/taxes/2023/
    └── ...
```

## Test Case Format

Each test case is a JSON file defining:

- Input documents (paths to ~/files/taxes)
- Expected user responses
- Expected Redux state
- Expected tax calculations
- Expected forms generated
- Expected audit results

### Example Test Case

```json
{
  "name": "Simple W-2 Return - Single Filer",
  "description": "Basic return with single W-2, standard deduction, no dependents",
  "taxYear": 2024,
  "documents": [
    {
      "type": "W2",
      "path": "~/files/taxes/2024/w2-acme-corp.pdf",
      "source": "real"
    }
  ],
  "userResponses": {
    "filingStatus": "S",
    "dependents": [],
    "otherIncome": [],
    "deductionChoice": "standard"
  },
  "expectedState": {
    "filingStatus": "S",
    "w2Count": 1,
    "totalIncome": 75000,
    "agi": 75000,
    "taxableIncome": 60400,
    "totalTax": 9617,
    "refund": 2383
  },
  "expectedForms": ["F1040"],
  "validations": {
    "mathCorrect": true,
    "compliancePass": true,
    "auditRisk": "low",
    "criticalIssues": 0,
    "warnings": 0
  }
}
```

## Running Tests

### Run All Tests

```bash
cd /mnt/nas/data/code/forks/UsTaxes
./.claude/test-suite/run-tests.sh
```

### Run Specific Test

```bash
./.claude/test-suite/run-tests.sh test-cases/simple-w2.json
```

### Run Tests by Category

```bash
# Simple returns only
./.claude/test-suite/run-tests.sh --category=simple

# Complex returns (itemized, business, rental)
./.claude/test-suite/run-tests.sh --category=complex

# Specific tax year
./.claude/test-suite/run-tests.sh --year=2024
```

### Verbose Mode

```bash
./.claude/test-suite/run-tests.sh --verbose
```

## Test Workflow

For each test case:

1. **Setup**

   - Clear Redux state
   - Initialize clean session
   - Load test case definition

2. **Document Extraction**

   - Run `/extract-documents` on each input document
   - Validate extraction confidence
   - Compare extracted data to expected values

3. **Question Phase**

   - Simulate user responses from test case
   - Validate question logic and flow
   - Ensure no unnecessary questions asked

4. **State Population**

   - Dispatch Redux actions
   - Validate state matches expected structure
   - Check all required fields populated

5. **Tax Calculation**

   - Run tax liability calculator
   - Validate all line items
   - Compare to expected tax amounts
   - Check for mathematical errors

6. **Form Generation**

   - Generate all required forms
   - Validate correct forms included/excluded
   - Check all fields populated correctly

7. **Audit**

   - Run tax-return-auditor agent
   - Validate no critical issues
   - Check expected warnings appear
   - Verify audit risk assessment

8. **PDF Generation**

   - Generate final PDF
   - Validate PDF structure
   - Check page count
   - Verify file size reasonable

9. **Results**
   - Compare all outputs to expected results
   - Generate test report
   - Flag any discrepancies

## Expected Results

Expected results are stored in `expected-results/[test-name]/`:

### redux-state.json

```json
{
  "taxPayer": {
    "filingStatus": "S",
    "primaryPerson": {
      "firstName": "John",
      "lastName": "Doe",
      "ssid": "XXX-XX-6789"
    }
  },
  "w2s": [...],
  "f1099s": [...]
}
```

### tax-calculation.json

```json
{
  "totalIncome": 75000,
  "adjustments": 0,
  "agi": 75000,
  "deductions": 14600,
  "taxableIncome": 60400,
  "tax": 9617,
  "credits": 0,
  "totalTax": 9617,
  "withholding": 12000,
  "refund": 2383
}
```

### forms-list.txt

```
F1040
```

### audit-report.md

```markdown
# Audit Report

Overall Status: PASS
Critical Issues: 0
Warnings: 0
Audit Risk: LOW
```

## Creating New Test Cases

### Step 1: Gather Real Documents

Place documents in `~/files/taxes/[year]/`:

```bash
~/files/taxes/
├── 2024/
│   ├── w2-employer.pdf
│   ├── 1099-int-bank.pdf
│   ├── 1099-div-brokerage.pdf
│   ├── 1098-mortgage.pdf
│   └── receipts/
│       ├── charity-receipt-1.pdf
│       └── medical-receipt.pdf
└── 2023/
    └── ...
```

### Step 2: Run Manual Preparation

```bash
# Manually prepare the return
/prepare-return 2024

# Provide documents from ~/files/taxes/2024/
# Answer all questions
# Review completed return
```

### Step 3: Export State and Results

```bash
# Export Redux state
./.claude/test-suite/export-state.sh 2024 test-name

# This creates:
# - expected-results/test-name/redux-state.json
# - expected-results/test-name/tax-calculation.json
# - expected-results/test-name/forms-list.txt
# - expected-results/test-name/audit-report.md
```

### Step 4: Create Test Case Definition

Create `.claude/test-suite/test-cases/test-name.json`:

```json
{
  "name": "Descriptive Test Name",
  "description": "What this test validates",
  "taxYear": 2024,
  "documents": [
    {
      "type": "W2",
      "path": "~/files/taxes/2024/w2-employer.pdf",
      "source": "real"
    }
  ],
  "userResponses": {
    // Copy from your manual run
  },
  "expectedState": {
    // From exported redux-state.json
  },
  "expectedForms": [
    // From exported forms-list.txt
  ],
  "validations": {
    // From exported audit-report.md
  }
}
```

### Step 5: Run Test

```bash
./.claude/test-suite/run-tests.sh test-cases/test-name.json
```

### Step 6: Fix Discrepancies

If test fails:

1. Review the diff output
2. Determine if:
   - Test case definition is wrong → Update test case
   - Expected results are wrong → Re-export expected results
   - Code has bug → Fix the bug and re-run

## Test Categories

### Simple Returns

- Single W-2, standard deduction
- Married Filing Jointly, 2 W-2s, standard deduction
- Single with dependent, child tax credit

### Itemized Deductions

- Mortgage interest + charitable
- Medical expenses over threshold
- SALT cap scenarios

### Investment Income

- Interest and dividends
- Capital gains (short and long term)
- Qualified dividends

### Self-Employment

- Schedule C with home office
- Schedule C with vehicle deduction
- Schedule C with business expenses

### Rental Property

- Schedule E with single property
- Multiple rental properties
- Passive loss limitations

### Complex Scenarios

- Multiple income sources
- Itemized deductions + business income
- Education credits + student loan interest
- HSA + IRA contributions

### Edge Cases

- Alternative Minimum Tax (AMT)
- Net Investment Income Tax (NIIT)
- Additional Medicare Tax
- Premium Tax Credit reconciliation

## Regression Testing

After making changes to:

- Extraction algorithms
- Tax calculations
- Form generation logic
- Audit rules

**Always run:**

```bash
./.claude/test-suite/run-tests.sh --all
```

Expected: All tests pass.

If tests fail:

1. Review the failing test
2. Determine if change is intentional
3. Update expected results if change is correct
4. Fix bug if change is unintentional

## Test Coverage Goals

- **Document Extraction:** 95%+ accuracy
- **Tax Calculation:** 100% accuracy (zero tolerance for math errors)
- **Form Generation:** All forms generated correctly
- **Audit Validation:** No false positives/negatives
- **Performance:** < 60 seconds per test case

## Test Results Format

After running tests, results are saved to `.claude/test-sessions/[timestamp]/`:

```
.claude/test-sessions/2024-11-27-14-35-42/
├── summary.md           # Overall test results
├── simple-w2/
│   ├── test-log.txt     # Detailed execution log
│   ├── redux-state.json # Actual Redux state
│   ├── diff.txt         # Diff vs expected
│   └── passed.txt       # PASS or FAIL
├── married-filing-jointly/
│   └── ...
└── test-report.html     # HTML report (optional)
```

### summary.md

```markdown
# Test Run Summary

**Timestamp:** 2024-11-27 14:35:42
**Total Tests:** 12
**Passed:** 11
**Failed:** 1
**Pass Rate:** 91.7%

## Results

| Test Case              | Status  | Time | Issues       |
| ---------------------- | ------- | ---- | ------------ |
| simple-w2              | ✅ PASS | 45s  | -            |
| married-filing-jointly | ✅ PASS | 52s  | -            |
| complex-return         | ❌ FAIL | 38s  | AGI mismatch |
| ...                    |         |      |              |

## Failed Tests

### complex-return

- **Expected AGI:** $187,500
- **Actual AGI:** $187,200
- **Difference:** -$300
- **Likely Cause:** Missing student loan interest deduction
- **Action:** Review extraction logic for Form 1098-E
```

## Continuous Integration

For automated testing in CI/CD:

```bash
# In GitHub Actions, GitLab CI, etc.
# Note: Requires access to ~/files/taxes (local only)

# Run tests
./.claude/test-suite/run-tests.sh --ci --json-output

# Check exit code
if [ $? -eq 0 ]; then
  echo "All tests passed"
else
  echo "Tests failed"
  exit 1
fi
```

## Performance Benchmarks

Target performance per test case:

- Document extraction: < 10s
- Question phase: < 5s
- State population: < 1s
- Tax calculation: < 2s
- Form generation: < 10s
- Audit: < 5s
- PDF generation: < 15s

**Total per test: < 60s**

## Troubleshooting

### Test Fails But Manual Run Works

Possible causes:

- Test case definition incomplete
- Expected results outdated
- Non-deterministic behavior (timestamps, randomness)

**Solution:**
Re-export expected results from manual run.

### All Tests Fail After Code Change

Possible causes:

- Breaking change in Redux actions
- Form calculation logic changed
- Schema validation changed

**Solution:**
Review changes, update test cases or fix bug.

### Tests Pass Locally But Fail in CI

Possible causes:

- Missing ~/files/taxes in CI environment
- Different Node.js version
- Different dependency versions

**Solution:**
Tests requiring ~/files/taxes should only run locally (not in CI).

## Security & Privacy

**Never:**

- Commit test-suite/ directory to git
- Share test results with unredacted PII
- Upload test data to cloud services
- Log SSNs or financial data in plain text

**Always:**

- Keep test data local
- Redact sensitive info in bug reports
- Use sanitized test fixtures for public issues
- Encrypt backups containing test data

## Adding ~/files/taxes Data

To use your real tax documents:

```bash
# Create symlink to your tax files
ln -s ~/files/taxes /mnt/nas/data/code/forks/UsTaxes/.claude/test-suite/test-data

# Now test cases can reference:
# ~/files/taxes/2024/w2-employer.pdf
# or
# .claude/test-suite/test-data/2024/w2-employer.pdf
```

## Contributing Test Cases

When adding new test cases:

1. Use anonymized/sanitized data for shared test fixtures
2. Use real data from ~/files/taxes for private testing
3. Document what the test validates
4. Include expected results
5. Add to appropriate category
6. Run test to verify it passes

## Test Maintenance

**Quarterly:**

- Review all test cases
- Update for new tax year (Jan-Feb)
- Add tests for new features
- Remove obsolete tests

**After each tax law change:**

- Update expected results
- Add tests for new rules
- Verify all tests still pass

## Questions & Support

For issues with test suite:

1. Check this README first
2. Review test-sessions/ logs
3. Examine .claude/hooks/ logs
4. Create detailed bug report

---

**Test Suite Version:** 1.0
**Last Updated:** 2024-11-27
**Compatible with:** UsTaxes 2024, Claude Code latest
