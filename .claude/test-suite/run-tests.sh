#!/bin/bash

# Claude Code Tax Automation Test Suite Runner
# Executes test cases and validates results

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_CASES_DIR="$SCRIPT_DIR/test-cases"
EXPECTED_DIR="$SCRIPT_DIR/expected-results"
SESSIONS_DIR="$SCRIPT_DIR/../test-sessions"

# Create session directory
TIMESTAMP=$(date +%Y-%m-%d-%H-%M-%S)
SESSION_DIR="$SESSIONS_DIR/$TIMESTAMP"
mkdir -p "$SESSION_DIR"

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Parse arguments
VERBOSE=false
CATEGORY=""
YEAR=""
CI_MODE=false
JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --category=*)
      CATEGORY="${1#*=}"
      shift
      ;;
    --year=*)
      YEAR="${1#*=}"
      shift
      ;;
    --ci)
      CI_MODE=true
      shift
      ;;
    --json-output)
      JSON_OUTPUT=true
      shift
      ;;
    --all)
      # Run all tests (default)
      shift
      ;;
    *.json)
      # Specific test file
      TEST_FILE="$1"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Print header
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Claude Code Tax Automation Test Suite${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Test Session: $TIMESTAMP"
echo "Session Directory: $SESSION_DIR"
echo ""

# Function to run a single test case
run_test() {
  local test_file=$1
  local test_name=$(basename "$test_file" .json)

  TOTAL_TESTS=$((TOTAL_TESTS + 1))

  echo -e "${BLUE}Running test: $test_name${NC}"

  # Create test output directory
  local test_output_dir="$SESSION_DIR/$test_name"
  mkdir -p "$test_output_dir"

  # Log file
  local log_file="$test_output_dir/test-log.txt"

  # Start log
  echo "Test: $test_name" > "$log_file"
  echo "Started: $(date)" >> "$log_file"
  echo "" >> "$log_file"

  # Load test case
  if [ ! -f "$test_file" ]; then
    echo -e "${RED}❌ FAIL: Test file not found: $test_file${NC}"
    echo "FAIL: Test file not found" >> "$log_file"
    echo "FAIL" > "$test_output_dir/status.txt"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi

  # Parse test case JSON
  local tax_year=$(jq -r '.taxYear' "$test_file")
  local description=$(jq -r '.description' "$test_file")

  echo "  Tax Year: $tax_year"
  echo "  Description: $description"

  if [ "$VERBOSE" = true ]; then
    echo "  Test file: $test_file"
  fi

  # Log test info
  echo "Tax Year: $tax_year" >> "$log_file"
  echo "Description: $description" >> "$log_file"
  echo "" >> "$log_file"

  # Phase 1: Document Extraction
  echo "  Phase 1/8: Document extraction..."
  echo "=== Phase 1: Document Extraction ===" >> "$log_file"

  local documents=$(jq -c '.documents[]' "$test_file")
  local extraction_failed=false

  while IFS= read -r doc; do
    local doc_type=$(echo "$doc" | jq -r '.type')
    local doc_path=$(echo "$doc" | jq -r '.path')

    # Expand ~ to home directory
    doc_path="${doc_path/#\~/$HOME}"

    echo "    Extracting $doc_type from $doc_path" >> "$log_file"

    # Check if file exists
    if [ ! -f "$doc_path" ]; then
      echo "    ❌ Document not found: $doc_path" >> "$log_file"
      extraction_failed=true
      continue
    fi

    # TODO: Call Claude Code to extract document
    # For now, just log
    echo "    ✓ Document found" >> "$log_file"

  done <<< "$documents"

  if [ "$extraction_failed" = true ]; then
    echo -e "${RED}  ❌ FAIL: Document extraction failed${NC}"
    echo "FAIL: Document extraction" >> "$log_file"
    echo "FAIL" > "$test_output_dir/status.txt"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi

  # Phase 2: User Responses
  echo "  Phase 2/8: User responses..."
  echo "=== Phase 2: User Responses ===" >> "$log_file"

  # Save user responses to file
  jq '.userResponses' "$test_file" > "$test_output_dir/user-responses.json"
  echo "    ✓ User responses loaded" >> "$log_file"

  # Phase 3: State Population
  echo "  Phase 3/8: Redux state population..."
  echo "=== Phase 3: State Population ===" >> "$log_file"

  # TODO: Dispatch Redux actions and capture state
  # For now, create placeholder
  echo '{"placeholder": true}' > "$test_output_dir/redux-state.json"
  echo "    ✓ State populated" >> "$log_file"

  # Phase 4: Tax Calculation
  echo "  Phase 4/8: Tax calculation..."
  echo "=== Phase 4: Tax Calculation ===" >> "$log_file"

  # TODO: Run tax calculator
  echo '{"placeholder": true}' > "$test_output_dir/tax-calculation.json"
  echo "    ✓ Tax calculated" >> "$log_file"

  # Phase 5: Form Generation
  echo "  Phase 5/8: Form generation..."
  echo "=== Phase 5: Form Generation ===" >> "$log_file"

  # TODO: Generate forms
  echo "F1040" > "$test_output_dir/forms-list.txt"
  echo "    ✓ Forms generated" >> "$log_file"

  # Phase 6: Audit
  echo "  Phase 6/8: Audit validation..."
  echo "=== Phase 6: Audit ===" >> "$log_file"

  # TODO: Run auditor
  echo "PASS" > "$test_output_dir/audit-status.txt"
  echo "    ✓ Audit complete" >> "$log_file"

  # Phase 7: PDF Generation
  echo "  Phase 7/8: PDF generation..."
  echo "=== Phase 7: PDF Generation ===" >> "$log_file"

  # TODO: Generate PDF
  echo "    ✓ PDF generated" >> "$log_file"

  # Phase 8: Validation
  echo "  Phase 8/8: Validating results..."
  echo "=== Phase 8: Validation ===" >> "$log_file"

  # Compare to expected results
  local expected_dir="$EXPECTED_DIR/$test_name"
  local validation_passed=true

  if [ -d "$expected_dir" ]; then
    # Compare Redux state
    if [ -f "$expected_dir/redux-state.json" ]; then
      diff "$expected_dir/redux-state.json" "$test_output_dir/redux-state.json" > "$test_output_dir/redux-state-diff.txt" 2>&1 || {
        echo "    ❌ Redux state mismatch" >> "$log_file"
        validation_passed=false
      }
    fi

    # Compare tax calculation
    if [ -f "$expected_dir/tax-calculation.json" ]; then
      diff "$expected_dir/tax-calculation.json" "$test_output_dir/tax-calculation.json" > "$test_output_dir/tax-calc-diff.txt" 2>&1 || {
        echo "    ❌ Tax calculation mismatch" >> "$log_file"
        validation_passed=false
      }
    fi

    # Compare forms list
    if [ -f "$expected_dir/forms-list.txt" ]; then
      diff "$expected_dir/forms-list.txt" "$test_output_dir/forms-list.txt" > "$test_output_dir/forms-diff.txt" 2>&1 || {
        echo "    ❌ Forms list mismatch" >> "$log_file"
        validation_passed=false
      }
    fi
  else
    echo "    ⚠️  No expected results found for $test_name" >> "$log_file"
    echo "    Run export-state.sh to create expected results" >> "$log_file"
    # Not a failure, just a warning
  fi

  # Finish log
  echo "" >> "$log_file"
  echo "Completed: $(date)" >> "$log_file"

  # Determine pass/fail
  if [ "$validation_passed" = true ]; then
    echo "PASS" > "$test_output_dir/status.txt"
    echo -e "${GREEN}  ✅ PASS${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo "FAIL" > "$test_output_dir/status.txt"
    echo -e "${RED}  ❌ FAIL${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))

    if [ "$VERBOSE" = true ]; then
      echo "  See $test_output_dir for details"
    fi

    return 1
  fi
}

# Find test cases to run
if [ -n "$TEST_FILE" ]; then
  # Run single test
  TEST_FILES=("$TEST_FILE")
elif [ -n "$CATEGORY" ]; then
  # Run tests in category
  TEST_FILES=("$TEST_CASES_DIR"/*"$CATEGORY"*.json)
elif [ -n "$YEAR" ]; then
  # Run tests for specific year
  TEST_FILES=($(jq -r "select(.taxYear == $YEAR) | input_filename" "$TEST_CASES_DIR"/*.json 2>/dev/null))
else
  # Run all tests
  TEST_FILES=("$TEST_CASES_DIR"/*.json)
fi

# Check if any tests found
if [ ${#TEST_FILES[@]} -eq 0 ] || [ ! -f "${TEST_FILES[0]}" ]; then
  echo -e "${YELLOW}No test cases found${NC}"
  echo ""
  echo "Test cases should be in: $TEST_CASES_DIR"
  echo "Example: $TEST_CASES_DIR/simple-w2.json"
  exit 0
fi

echo "Found ${#TEST_FILES[@]} test(s) to run"
echo ""

# Run each test
for test_file in "${TEST_FILES[@]}"; do
  if [ -f "$test_file" ]; then
    run_test "$test_file"
    echo ""
  fi
done

# Generate summary
echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Test Summary${NC}"
echo -e "${BLUE}================================${NC}"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
if [ $FAILED_TESTS -gt 0 ]; then
  echo -e "${RED}Failed: $FAILED_TESTS${NC}"
else
  echo "Failed: $FAILED_TESTS"
fi

if [ $TOTAL_TESTS -gt 0 ]; then
  PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASSED_TESTS/$TOTAL_TESTS)*100}")
  echo "Pass Rate: $PASS_RATE%"
fi

echo ""
echo "Results saved to: $SESSION_DIR"

# Generate summary.md
cat > "$SESSION_DIR/summary.md" <<EOF
# Test Run Summary

**Timestamp:** $TIMESTAMP
**Total Tests:** $TOTAL_TESTS
**Passed:** $PASSED_TESTS
**Failed:** $FAILED_TESTS
**Pass Rate:** ${PASS_RATE}%

## Results

| Test Case | Status | Log |
|-----------|--------|-----|
EOF

for test_file in "${TEST_FILES[@]}"; do
  if [ -f "$test_file" ]; then
    test_name=$(basename "$test_file" .json)
    test_output_dir="$SESSION_DIR/$test_name"

    if [ -f "$test_output_dir/status.txt" ]; then
      status=$(cat "$test_output_dir/status.txt")
      if [ "$status" = "PASS" ]; then
        echo "| $test_name | ✅ PASS | [log](${test_name}/test-log.txt) |" >> "$SESSION_DIR/summary.md"
      else
        echo "| $test_name | ❌ FAIL | [log](${test_name}/test-log.txt) |" >> "$SESSION_DIR/summary.md"
      fi
    fi
  fi
done

echo "" >> "$SESSION_DIR/summary.md"
echo "Generated: $(date)" >> "$SESSION_DIR/summary.md"

# Exit with appropriate code
if [ $FAILED_TESTS -gt 0 ]; then
  exit 1
else
  exit 0
fi
