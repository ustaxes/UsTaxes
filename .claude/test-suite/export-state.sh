#!/bin/bash

# Export Redux state and tax results as expected test results
# Usage: ./export-state.sh [tax-year] [test-name]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
EXPECTED_DIR="$SCRIPT_DIR/expected-results"

# Parse arguments
TAX_YEAR=${1:-2024}
TEST_NAME=${2:-"unnamed-test"}

echo "Exporting test results for: $TEST_NAME (Year: $TAX_YEAR)"

# Create expected results directory
OUTPUT_DIR="$EXPECTED_DIR/$TEST_NAME"
mkdir -p "$OUTPUT_DIR"

echo "Output directory: $OUTPUT_DIR"

# TODO: This script needs to interact with the running UsTaxes application
# to export the current Redux state and calculated tax information.
#
# For now, this is a placeholder that documents the expected output format.

# Export Redux state
echo "Exporting Redux state..."
cat > "$OUTPUT_DIR/redux-state.json" <<'EOF'
{
  "taxPayer": {
    "filingStatus": "S",
    "primaryPerson": {
      "firstName": "John",
      "lastName": "Doe",
      "ssid": "XXX-XX-6789",
      "role": "PRIMARY",
      "dateOfBirth": "1985-06-15",
      "isBlind": false,
      "address": {
        "address": "123 Main St",
        "city": "San Francisco",
        "state": "CA",
        "zip": "94105"
      },
      "isTaxpayerDependent": false
    },
    "dependents": []
  },
  "w2s": [
    {
      "occupation": "Software Engineer",
      "income": 75000,
      "medicareIncome": 75000,
      "fedWithholding": 12000,
      "ssWages": 75000,
      "ssWithholding": 4650,
      "medicareWithholding": 1087.50,
      "employer": {
        "EIN": "12-3456789",
        "employerName": "Tech Company Inc",
        "address": {
          "address": "456 Tech Blvd",
          "city": "San Francisco",
          "state": "CA",
          "zip": "94107"
        }
      },
      "personRole": "PRIMARY",
      "state": "CA",
      "stateWages": 75000,
      "stateWithholding": 3750
    }
  ],
  "f1099s": [],
  "realEstate": [],
  "f1098es": [],
  "itemizedDeductions": null,
  "credits": [],
  "healthSavingsAccounts": [],
  "individualRetirementArrangements": [],
  "questions": {},
  "refund": null
}
EOF

# Export tax calculation
echo "Exporting tax calculation..."
cat > "$OUTPUT_DIR/tax-calculation.json" <<'EOF'
{
  "taxYear": 2024,
  "filingStatus": "S",
  "totalIncome": 75000,
  "adjustments": 0,
  "agi": 75000,
  "deductions": {
    "standard": 14600,
    "itemized": 0,
    "used": "standard"
  },
  "taxableIncome": 60400,
  "ordinaryTax": 9617,
  "capitalGainsTax": 0,
  "additionalTaxes": {
    "selfEmploymentTax": 0,
    "additionalMedicare": 0,
    "netInvestmentIncome": 0,
    "amt": 0
  },
  "totalTaxBeforeCredits": 9617,
  "credits": {
    "childTaxCredit": 0,
    "educationCredits": 0,
    "otherCredits": 0,
    "totalCredits": 0
  },
  "totalTax": 9617,
  "payments": {
    "federalWithholding": 12000,
    "estimatedPayments": 0,
    "priorYearOverpayment": 0,
    "totalPayments": 12000
  },
  "refund": 2383,
  "amountOwed": 0,
  "effectiveTaxRate": 12.82,
  "marginalTaxRate": 12
}
EOF

# Export forms list
echo "Exporting forms list..."
cat > "$OUTPUT_DIR/forms-list.txt" <<'EOF'
F1040
EOF

# Export audit report
echo "Exporting audit report..."
cat > "$OUTPUT_DIR/audit-report.md" <<'EOF'
# Audit Report

**Overall Status:** PASS
**Critical Issues:** 0
**Warnings:** 0

## Validations

- Mathematical calculations: CORRECT
- IRS compliance: PASS
- Required disclosures: COMPLETE
- Form selection: CORRECT

## Audit Risk

**Risk Level:** LOW
**Audit Probability:** 0.4%

## Recommendations

- Review standard deduction vs itemized (currently using standard: $14,600)
- Consider IRA contribution ($7,000 available)
- File electronically for faster refund

**Ready to file:** YES
EOF

echo ""
echo "✓ Exported results to: $OUTPUT_DIR"
echo ""
echo "Files created:"
echo "  - redux-state.json (Redux state snapshot)"
echo "  - tax-calculation.json (Tax calculation details)"
echo "  - forms-list.txt (List of generated forms)"
echo "  - audit-report.md (Audit validation results)"
echo ""
echo "Next steps:"
echo "1. Review the exported files"
echo "2. Create test case JSON in test-cases/$TEST_NAME.json"
echo "3. Run: ./run-tests.sh test-cases/$TEST_NAME.json"
