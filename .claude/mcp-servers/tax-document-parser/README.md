# Tax Document Parser MCP Server

Model Context Protocol server for parsing tax documents using OCR and structured data extraction.

## Features

- **PDF Text Extraction** - Extract text from PDF tax documents
- **OCR Support** - Optical Character Recognition for scanned documents and images
- **Structured Data Extraction** - Parse W-2, 1099, 1098 forms using regex patterns
- **Auto-Detection** - Automatically identify document type
- **High Accuracy** - Confidence scoring for extracted data

## Supported Documents

### Income Forms
- **W-2** - Wage and Tax Statement
- **1099-INT** - Interest Income
- **1099-DIV** - Dividends and Distributions
- **1099-B** - Broker Transactions
- **1099-R** - Retirement Distributions
- **1099-MISC** - Miscellaneous Income
- **1099-NEC** - Nonemployee Compensation
- **1099-SSA** - Social Security Benefits

### Deduction Forms
- **1098** - Mortgage Interest Statement
- **1098-E** - Student Loan Interest
- **1098-T** - Tuition Statement

### Other
- **Receipts** - Charitable, medical, business expense receipts

## Installation

```bash
cd .claude/mcp-servers/tax-document-parser
npm install
npm run build
```

## Usage

### Add to Claude Code Settings

In `.claude/settings.json`:

```json
{
  "mcp": {
    "tax-document-parser": {
      "command": "node",
      "args": ["/path/to/.claude/mcp-servers/tax-document-parser/dist/index.js"]
    }
  }
}
```

### Available Tools

#### 1. parse_tax_document

Parse a tax document and extract all fields.

**Parameters:**
- `filePath` (string, required): Path to PDF or image file
- `documentType` (string, optional): Type of document (W2, 1099-INT, etc.) or 'auto'
- `ocrLanguage` (string, optional): OCR language code (default: 'eng')

**Example:**
```typescript
{
  "filePath": "~/files/taxes/2024/w2-acme.pdf",
  "documentType": "auto"
}
```

**Returns:**
```json
{
  "success": true,
  "documentType": "W2",
  "filePath": "~/files/taxes/2024/w2-acme.pdf",
  "extractedData": {
    "wages": 75000,
    "federalWithholding": 12000,
    "socialSecurityWages": 75000,
    "socialSecurityWithholding": 4650,
    "medicareWages": 75000,
    "medicareWithholding": 1087.50,
    "employerName": "Acme Corporation",
    "ein": "12-3456789"
  },
  "confidence": 95.5,
  "metadata": {
    "fileSize": 245678,
    "extractedAt": "2024-11-27T14:35:42Z"
  }
}
```

#### 2. extract_fields

Extract specific fields from raw text.

**Parameters:**
- `text` (string, required): Raw text content
- `documentType` (string, required): Document type
- `fieldMap` (object, optional): Custom regex patterns

**Example:**
```typescript
{
  "text": "Box 1 Wages: $75,000.00\\nBox 2 Federal tax withheld: $12,000.00",
  "documentType": "W2"
}
```

#### 3. detect_document_type

Automatically detect document type from text.

**Parameters:**
- `text` (string, required): Document text content

**Returns:**
```json
{
  "success": true,
  "documentType": "W2",
  "confidence": 100,
  "signatures": ["Wage and Tax Statement", "Form W-2", "Box 1"]
}
```

#### 4. ocr_image

Perform OCR on an image file.

**Parameters:**
- `filePath` (string, required): Path to image file
- `language` (string, optional): OCR language (default: 'eng')

**Returns:**
```json
{
  "success": true,
  "filePath": "~/taxes/w2-scan.jpg",
  "extractedText": "Form W-2 Wage and Tax Statement...",
  "textLength": 1234,
  "language": "eng"
}
```

## Field Extraction Patterns

### W-2 Fields
- `ein` - Employer Identification Number
- `employerName` - Employer name
- `wages` - Box 1: Wages, tips, other compensation
- `federalWithholding` - Box 2: Federal income tax withheld
- `socialSecurityWages` - Box 3: Social security wages
- `socialSecurityWithholding` - Box 4: Social security tax withheld
- `medicareWages` - Box 5: Medicare wages and tips
- `medicareWithholding` - Box 6: Medicare tax withheld
- `stateWages` - Box 16: State wages, tips, etc.
- `stateWithholding` - Box 17: State income tax

### 1099-INT Fields
- `payer` - Payer name
- `interest` - Box 1: Interest income
- `earlyWithdrawal` - Box 2: Early withdrawal penalty
- `federalWithholding` - Box 4: Federal income tax withheld
- `taxExemptInterest` - Box 8: Tax-exempt interest

### 1099-DIV Fields
- `payer` - Payer name
- `ordinaryDividends` - Box 1a: Total ordinary dividends
- `qualifiedDividends` - Box 1b: Qualified dividends
- `capitalGain` - Box 2a: Total capital gain distributions
- `federalWithholding` - Box 4: Federal income tax withheld

### 1099-B Fields
- `payer` - Broker name
- `shortTermProceeds` - Short-term proceeds
- `shortTermCostBasis` - Short-term cost basis
- `longTermProceeds` - Long-term proceeds
- `longTermCostBasis` - Long-term cost basis

### 1098 Fields
- `lender` - Lender name
- `mortgageInterest` - Box 1: Mortgage interest received
- `points` - Box 2: Points paid on purchase
- `propertyTax` - Box 10: Other (property tax)

### 1098-E Fields
- `lender` - Lender/servicer name
- `studentLoanInterest` - Box 1: Student loan interest received

## Confidence Scoring

Confidence scores indicate extraction quality:
- **90-100%** - Excellent (all required fields + most optional)
- **75-89%** - Good (all required fields + some optional)
- **60-74%** - Fair (all required fields, missing optional)
- **<60%** - Poor (missing required fields or low-quality OCR)

**Factors:**
- Field completeness (% of expected fields extracted)
- Required fields present (wages, withholding, etc.)
- Format validation (numbers, EINs, etc.)
- OCR quality (for scanned documents)

## Error Handling

**Common Errors:**
- `File not found` - Check file path
- `Unsupported file type` - Use PDF or image format
- `OCR failed` - Image quality too low
- `No fields extracted` - Document not recognized or wrong type

## Performance

- **PDF text extraction:** ~100ms per document
- **OCR (image):** ~2-5 seconds per page
- **Field extraction:** ~10ms per document

## Testing

```bash
# Run test with sample W-2
node dist/index.js <<EOF
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "parse_tax_document",
    "arguments": {
      "filePath": "~/files/taxes/2024/w2-test.pdf",
      "documentType": "auto"
    }
  }
}
EOF
```

## Custom Field Patterns

Add custom regex patterns for specialized documents:

```typescript
{
  "text": "Custom field: $1,234.56",
  "documentType": "custom",
  "fieldMap": {
    "customField": "/Custom field[:\s]*\$?([0-9,]+\.?\d{0,2})/i"
  }
}
```

## Integration with Claude Code

Used automatically by:
- `/extract-documents` command
- `tax-document-analyzer` skill
- `/prepare-return` workflow

## Limitations

- Scanned documents require clear, high-quality images
- Handwritten documents not supported
- Non-standard forms may have lower accuracy
- Multi-page documents processed separately

## Future Enhancements

- [ ] Machine learning-based extraction
- [ ] Support for state tax forms
- [ ] Batch processing
- [ ] Form validation against IRS schemas
- [ ] Auto-correction of common OCR errors

## License

MIT

## Support

For issues or questions:
1. Check extraction confidence score
2. Try with higher quality scan
3. Manually specify document type
4. Report issue with sample document
