# Quick Start Guide
## Claude Code Tax Automation - Get Started in 5 Minutes

---

## Installation (2 minutes)

```bash
# 1. Clone UsTaxes
git clone https://github.com/ustaxes/ustaxes.git
cd ustaxes

# 2. Install dependencies
npm install

# 3. Install OCR (one-time)
# macOS:
brew install tesseract

# Ubuntu:
sudo apt-get install tesseract-ocr

# Windows:
# Download from https://github.com/UB-Mannheim/tesseract/wiki

# 4. Start Claude Code
claude
```

---

## Your First Return (3 minutes)

### Simple W-2 Only

```
You: I want to prepare my 2024 taxes

Claude: What is your filing status?

You: Single

Claude: [Asks for name, SSN, address]

You: I have a W-2 at ~/Documents/w2-2024.pdf

Claude: [Parses W-2, shows extracted data]
        Is this correct?

You: Yes

Claude: Do you have other income?

You: No

Claude: I'll use the standard deduction ($14,600).

        Your tax: $X,XXX
        Withholding: $X,XXX
        Refund: $X,XXX

        Generate forms?

You: Yes

Claude: ✓ Form 1040 saved to ./ustaxes-output/
```

**Done!** You now have a completed tax return.

---

## Slash Commands Cheat Sheet

| Command | Usage | Example |
|---------|-------|---------|
| `/prepare-return` | Start tax return | `/prepare-return 2024` |
| `/extract-documents` | Parse tax docs | `/extract-documents ~/taxes/*.pdf auto` |
| `/validate-return` | Check for errors | `/validate-return 2024` |
| `/estimate-taxes` | Quick estimate | `/estimate-taxes 75000 single` |
| `/optimize-deductions` | Find savings | `/optimize-deductions` |
| `/generate-forms` | Create PDFs | `/generate-forms 2024 all` |
| `/compare-years` | Multi-year view | `/compare-years 2023 2024` |
| `/export-data` | Export to file | `/export-data json` |

---

## Common Workflows

### W-2 + Interest

```
You: /prepare-return 2024 --filing-status=single
     I have a W-2 at ~/w2.pdf
     I earned $500 in interest from Chase Bank
     Use standard deduction
     Generate forms
```

### Self-Employed

```
You: I'm self-employed with $80K income
     Business expenses: $15K
     Home office: 200 sq ft of 1500 sq ft home
     Health insurance: $6K/year
     Calculate my tax
```

### Multiple Income Sources

```
You: I have:
     - W-2: ~/w2-employer.pdf
     - 1099-INT: ~/1099-bank.pdf
     - 1099-DIV: ~/1099-brokerage.pdf
     - Capital gains from stock sale: $10K
     Itemize deductions:
     - Mortgage interest: $12K
     - Property tax: $8K
     - Charitable: $3K
     Generate complete return
```

---

## Document Upload Tips

### Best Results

✅ **DO:**
- Scan at 300+ DPI
- Save as PDF
- Keep document flat
- Use good lighting
- Name files descriptively

❌ **DON'T:**
- Use photos (scan instead)
- Compress PDFs heavily
- Rotate documents
- Crop too closely
- Use all-lowercase names

### Supported Documents

| Type | Extensions | Auto-Detect |
|------|------------|-------------|
| W-2 | `.pdf` | ✅ Yes |
| 1099-INT | `.pdf` | ✅ Yes |
| 1099-DIV | `.pdf` | ✅ Yes |
| 1099-NEC | `.pdf` | ✅ Yes |
| 1099-B | `.pdf` | ✅ Yes |
| 1098 | `.pdf` | ✅ Yes |
| Images | `.jpg`, `.png` | ⚠️ Manual |

---

## Validation Checklist

Before filing, verify:

```
You: /validate-return 2024

Expected output:
✓ All required fields complete
✓ Math verified
✓ SSN/EIN format valid
✓ Income matches W-2s
✓ Schedules attached
✓ No errors found
```

If warnings appear:
- Review carefully
- Ask Claude for explanation
- Fix issues before filing

---

## Troubleshooting

### OCR Not Working

```bash
# Test Tesseract
tesseract --version

# If not installed:
brew install tesseract  # macOS
sudo apt install tesseract-ocr  # Linux
```

### Wrong Data Extracted

```
You: The W-2 wage amount is wrong. It should be $75,000 not $73,000

Claude: [Updates the amount]
```

### Math Doesn't Match

```
You: Show me the detailed tax calculation

Claude: [Shows line-by-line breakdown with explanations]
```

### Can't Find Forms

```
# Check output directory
ls -lh ./ustaxes-output/

# Or ask:
You: Where did you save my forms?
```

---

## Next Steps

### After Generating Forms

1. **Review PDF carefully**
   - Check all numbers
   - Verify personal information
   - Confirm signatures needed

2. **Consider professional review**
   - If income > $100K
   - If complex investments
   - If self-employed
   - If first time filing

3. **File your return**
   - E-file through IRS Free File
   - Use commercial software
   - Mail paper return
   - Hire tax preparer

4. **Keep records**
   - Save all documents (7 years)
   - Keep copy of filed return
   - Store securely

### 2025 Planning

```
You: Generate 2025 estimated tax vouchers

Claude: Based on 2024 income, quarterly payments:
        Q1 (4/15): $X,XXX
        Q2 (6/15): $X,XXX
        Q3 (9/15): $X,XXX
        Q4 (1/15): $X,XXX
```

---

## Getting Help

### In-App Help

```
You: How do I claim the child tax credit?
You: What's the difference between standard and itemized?
You: Am I eligible for EITC?
```

### Documentation

- **Full Guide:** `.claude/docs/AI_AUTOMATION_GUIDE.md`
- **API Docs:** `.claude/docs/API_REFERENCE.md`
- **Architecture:** `.claude/docs/ARCHITECTURE.md`

### Support Channels

- **GitHub Issues:** https://github.com/ustaxes/ustaxes/issues
- **Discussions:** https://github.com/ustaxes/ustaxes/discussions
- **UsTaxes Docs:** https://ustaxes.org/docs

---

## Pro Tips

### Faster Data Entry

```
# Upload entire folder
You: Process all documents in ~/taxes/2024/

# Batch upload specific types
You: Extract all 1099s from ~/taxes/2024/1099-*.pdf
```

### Save Time Next Year

```
# Export this year's data
You: /export-data json

# Next year, import as template
You: /import-data json ~/taxes/2024-data.json
```

### Optimize Withholding

```
You: My refund is very large ($5,000). How should I adjust my W-4?

Claude: [Calculates recommended allowances]
        File new W-4 with employer claiming X allowances.
        This will increase take-home by ~$192/paycheck.
```

### Multi-State Returns

```
# Federal first
You: Complete my federal return for 2024

# Then state
You: Now help me with my California state return
```

---

## Safety Reminders

⚠️ **This software:**
- Prepares returns (does NOT file them)
- Provides calculations (NOT tax advice)
- Helps with forms (NOT a tax professional)

✅ **You should:**
- Review all generated forms
- Verify all calculations
- Consider professional review for complex situations
- Keep all records for 7 years
- File by the deadline

❌ **Never:**
- Blindly file without review
- Share SSN in file names
- Commit tax docs to public repos
- Leave sensitive files unencrypted

---

## One-Minute Examples

### Example 1: Add Income

```
You: Add W-2 with $60K wages, $9K withheld, employer Acme Corp EIN 12-3456789
```

### Example 2: Calculate Tax

```
You: Income $60K, single, standard deduction, what's my tax?
```

### Example 3: Deduction Check

```
You: Mortgage interest $10K, property tax $7K, charity $2K. Should I itemize?
```

### Example 4: Quarterly Estimates

```
You: Self-employed income $80K, expenses $15K. What are my quarterly payments?
```

### Example 5: Credit Eligibility

```
You: 2 kids age 6 and 10, income $75K married. Do I get child tax credit?
```

---

## Ready to Start?

```bash
cd /path/to/ustaxes
claude
```

Then say:

```
I want to prepare my 2024 tax return
```

**That's it!** Claude will guide you through the rest.

---

**Questions?** Ask Claude directly:
```
You: How do I...?
You: What does ... mean?
You: Am I eligible for ...?
```

Claude has access to all IRS publications and can explain anything.

---

**Document Version:** 1.0
**Last Updated:** 2025-11-27
