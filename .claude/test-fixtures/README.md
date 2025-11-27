# Test Fixtures

Sample tax document data for testing the Claude Code automation layer.

## Files

### Tax Forms
- `sample-w2.json` - Sample W-2 Wage and Tax Statement
- `sample-1099-int.json` - Sample 1099-INT Interest Income
- `sample-1099-nec.json` - Sample 1099-NEC Nonemployee Compensation
- `sample-tax-return.json` - Complete sample tax return for 2024

## Usage

These fixtures are used by the test suite in `.claude/test/`. They provide realistic sample data for testing document parsing, validation, and tax calculations.

Load fixtures using the `loadFixture()` helper:

```typescript
import { loadFixture } from '../utils/test-helpers';

const w2 = loadFixture('sample-w2.json');
```

## Data Source

All sample data uses realistic values but is entirely fictional. No real taxpayer data is included.

## Tax Year

All fixtures are for tax year 2024 unless otherwise noted.
