# Getting Started with UsTaxes Claude Code Integration

Complete guide to using Claude Code for autonomous tax return preparation with UsTaxes.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Your First Tax Return](#your-first-tax-return)
- [Next Steps](#next-steps)

---

## Overview

The UsTaxes Claude Code integration enables AI-powered tax return preparation through:

- **🤖 Autonomous Workflows**: Complete tax returns through natural conversation
- **📋 Slash Commands**: Pre-built workflows for common tasks (`/prepare-return`, `/validate-return`, etc.)
- **🔍 Intelligent Agents**: Specialized AI agents for form filling, question asking, and auditing
- **🔌 MCP Integration**: Direct access to UsTaxes via Model Context Protocol
- **📄 PDF Generation**: Automatic generation of IRS-compliant tax forms

### What This System Can Do

✅ Prepare complete federal and state tax returns
✅ Extract data from tax documents (W-2s, 1099s, etc.)
✅ Ask intelligent questions to gather missing information
✅ Validate returns for accuracy and completeness
✅ Generate IRS-compliant PDF forms
✅ Optimize deductions and identify tax-saving opportunities
✅ Estimate tax liability for planning

### What This System Cannot Do

❌ Provide legal tax advice
❌ Guarantee IRS acceptance
❌ File returns electronically (generates PDFs only)
❌ Guarantee audit protection
❌ Replace professional tax review for complex situations

---

## Prerequisites

### Required

- **Claude Code**: Latest version installed ([installation guide](https://github.com/anthropics/claude-code))
- **Node.js**: Version 18.0.0 or higher
- **Git**: For cloning the repository

### Recommended

- **Basic Tax Knowledge**: Understanding of W-2s, 1099s, and deductions
- **Document Scanner**: For extracting data from paper tax documents
- **Tax Documents**: W-2s, 1099s, receipts, and other tax-related documents

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/UsTaxes.git
cd UsTaxes
```

### Step 2: Checkout the Claude Code Branch

```bash
git checkout claude-code-tax-automation
```

### Step 3: Install Dependencies

```bash
# Install main UsTaxes dependencies
npm install

# Install MCP server dependencies
cd .claude/mcp-servers/ustaxes-server
npm install
cd ../../..
```

### Step 4: Verify MCP Server

```bash
# Test the MCP server
cd .claude/mcp-servers/ustaxes-server
npx tsx src/index.ts

# Should output:
# UsTaxes MCP Server running on stdio
# Available tools: 25+
# Ready to assist with tax return preparation

# Press Ctrl+C to stop
```

### Step 5: Configure Claude Code

The MCP server should already be configured in `.claude/settings.json`. Verify the configuration:

```bash
cat .claude/settings.json
```

Should include:

```json
{
  "mcp": {
    "ustaxes": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/absolute/path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts"
      ]
    }
  }
}
```

**Important:** Update the path to be absolute, not relative.

### Step 6: Start Claude Code

```bash
# From the UsTaxes directory
claude

# Alternatively, start with specific context
claude --resume  # Resume previous session
```

---

## Quick Start

### Verify Installation

In your Claude Code session:

```
You: "List the available UsTaxes MCP tools"

Claude: "I can see the ustaxes MCP server with 25+ tools available including:
- ustaxes_set_filing_status
- ustaxes_add_primary_person
- ustaxes_add_w2
- ustaxes_generate_federal_pdf
... and many more"
```

### Available Slash Commands

```bash
/prepare-return [year]       # Interactive tax return preparation
/validate-return [year]      # Comprehensive return validation
/extract-documents [path]    # Extract data from tax documents
/estimate-taxes [income]     # Quick tax estimate calculator
/optimize-deductions         # Find tax-saving opportunities
```

### Test Basic Workflow

```
You: "/prepare-return 2024"

Claude: "I'll help you prepare your 2024 tax return using the UsTaxes MCP server.

Let's start with some basic questions:

1. What is your filing status?
   - Single
   - Married Filing Jointly
   - Married Filing Separately
   - Head of Household
   - Qualifying Widow(er)

Please select one or describe your situation."
```

---

## Your First Tax Return

Let's prepare a simple tax return for a single filer with one W-2.

### Step 1: Start the Workflow

```
You: "/prepare-return 2024"
```

### Step 2: Answer Questions

Claude will ask you questions to gather information. Example conversation:

```
Claude: "What is your filing status?"
You: "Single"

Claude: "Great! I've set your filing status to Single for 2024.

Now, please provide your personal information:
- First name
- Last name
- Social Security Number (XXX-XX-XXXX)
- Date of birth (YYYY-MM-DD)
- Address (street, city, state, ZIP)"

You: "John Smith, SSN 123-45-6789, DOB 1990-05-15,
      Address: 100 Main St, Boston, MA 02101"

Claude: "Added primary taxpayer: John Smith

Do you have any W-2 income from an employer? (yes/no)"

You: "Yes, I have one W-2"

Claude: "Please provide your W-2 information. You can either:
1. Upload a photo/scan of your W-2
2. Manually enter the information

Which would you prefer?"

You: "I'll enter it manually:
- Employer: Acme Corporation
- Wages (Box 1): $75,000
- Federal withholding (Box 2): $12,000
- Social Security wages (Box 3): $75,000
- Social Security withholding (Box 4): $4,650
- Medicare wages (Box 5): $75,000
- Medicare withholding (Box 6): $1,087.50"

Claude: "W-2 added for Acme Corporation.

Do you have any other income sources? (W-2, 1099-INT, 1099-DIV, etc.)"

You: "No, that's all"

Claude: "Do you have any deductions to claim?
- IRA contributions
- HSA contributions
- Student loan interest
- Itemized deductions"

You: "No deductions"

Claude: "Perfect! Your return is complete. Let me generate the PDF forms..."

*Generates PDF*

Claude: "Your 2024 federal tax return has been generated!

Summary:
- Filing Status: Single
- Gross Income: $75,000
- Standard Deduction: $14,600
- Taxable Income: $60,400
- Total Tax: ~$8,500
- Withholding: $12,000
- Refund: ~$3,500

PDF saved to: /tmp/federal-return-2024.pdf

Would you like me to:
1. Validate the return for accuracy
2. Generate the state return
3. Export the data for safe keeping
4. Make any changes"
```

### Step 3: Validate and Review

```
You: "/validate-return 2024"

Claude: "Running comprehensive validation on your 2024 return...

✅ Personal Information: Complete
✅ Filing Status: Valid (Single)
✅ Income Sources: 1 W-2 (validated)
✅ Deductions: Standard deduction applied
✅ Tax Calculation: Verified
✅ PDF Generation: Successful

No errors found. Your return is ready for filing.

Audit Risk Assessment: Low
- Simple return structure
- Standard deduction used
- Single income source
- Adequate withholding

Recommendations:
1. Consider IRA contribution for next year (up to $7,000 deduction)
2. Keep W-2 and return copy for 7 years
3. Review state return requirements for MA"
```

### Step 4: Save Your Work

```
You: "Export my return data to a safe location"

Claude: "I'll export your complete return state..."

*Exports to /home/user/Documents/Taxes/tax-state-2024.json*

Claude: "Return data exported successfully!

Your tax return state has been saved to:
/home/user/Documents/Taxes/tax-state-2024.json

This file contains all your tax data and can be:
- Reimported if you need to make changes
- Used as a backup
- Shared with a tax professional

Keep this file secure as it contains sensitive information."
```

---

## Next Steps

### Learn More About Available Tools

- **[Slash Commands Guide](SLASH_COMMANDS.md)** - Complete reference for all commands
- **[Workflows Guide](WORKFLOWS.md)** - Detailed workflow documentation
- **[Agents Guide](AGENTS.md)** - Understanding specialized AI agents
- **[MCP Server API](../mcp-servers/ustaxes-server/docs/API_REFERENCE.md)** - Complete API documentation

### Explore Advanced Features

- **Document Extraction**: Use `/extract-documents` to automatically extract data from W-2 and 1099 PDFs/images
- **Deduction Optimization**: Use `/optimize-deductions` to find tax-saving opportunities
- **Tax Estimation**: Use `/estimate-taxes` for planning scenarios
- **Multi-Year Returns**: Prepare returns for multiple years (2019-2024 supported)

### Common Workflows

**Simple W-2 Employee:**
```bash
/prepare-return 2024
# Answer questions about filing status, personal info, W-2
# Generate PDFs
/validate-return 2024
```

**Self-Employed with Rental Property:**
```bash
/prepare-return 2024
# Answer questions about filing status, personal info
# Provide 1099-NEC income
# Add rental property income/expenses
# Add business deductions
# Generate PDFs
/validate-return 2024
```

**Married Filing Jointly with Dependents:**
```bash
/prepare-return 2024
# Answer questions about both spouses
# Add children as dependents
# Provide all W-2s
# Add retirement contributions
# Generate PDFs
/validate-return 2024
```

### Troubleshooting

- **MCP Server Not Found**: See [Troubleshooting Guide](TROUBLESHOOTING.md)
- **PDF Generation Fails**: Check file permissions and output directory
- **Data Validation Errors**: Use `/validate-return` to identify issues
- **Questions Not Answered**: Use the question-asker agent directly

### Get Help

- **In-App Help**: Type `/help` in Claude Code
- **Documentation**: Browse `.claude/docs/` for detailed guides
- **Examples**: See `.claude/examples/` for code samples
- **Community**: Join UsTaxes discussions on GitHub

---

## Safety and Disclaimers

### Important Reminders

⚠️ **Not Tax Advice**: This tool assists with tax preparation but does NOT provide legal tax advice

⚠️ **Review Required**: All generated returns should be reviewed by a qualified tax professional before filing

⚠️ **User Responsibility**: You are responsible for the accuracy and completeness of your filed return

⚠️ **No Guarantees**: This system does not guarantee IRS acceptance or audit protection

### Data Security

- **In-Memory Storage**: Tax data stored in memory only (cleared on MCP server restart)
- **Local Processing**: All processing happens locally on your machine
- **No Cloud Storage**: No data sent to external servers
- **Export/Import**: Use export to save data, import to restore

### Best Practices

1. **Export Frequently**: Save your work using `ustaxes_export_state`
2. **Keep Backups**: Save generated PDFs and exported JSON files
3. **Verify Calculations**: Double-check all numbers before filing
4. **Professional Review**: Have complex returns reviewed by a tax professional
5. **Secure Storage**: Keep tax documents and PDFs in secure location

---

**Last Updated:** 2024-11-28
**Claude Code Version:** Latest
**UsTaxes Version:** 2024
**Branch:** claude-code-tax-automation
