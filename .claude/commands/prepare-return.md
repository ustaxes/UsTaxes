---
name: prepare-return
description: "Complete tax return using MCP server: gather info, populate return, generate PDF"
args:
  - name: year
    description: "Tax year to prepare (default: 2024)"
    required: false
---

# Prepare Tax Return (MCP-Powered)

Complete autonomous tax return preparation using the UsTaxes MCP server.

## Overview

This command uses the **ustaxes-server MCP** to programmatically complete a tax return through intelligent questioning and form population.

**What it does:**
1. Gathers personal information through questions
2. Collects income and deduction data
3. Populates return using MCP tools
4. Validates completeness
5. Generates PDF

**What it doesn't do:**
- OCR/document scanning (manual data entry only)
- Provide tax advice
- Guarantee audit protection

## Workflow

### Phase 1: Setup

```typescript
const taxYear = args.year ?? 2024

// Verify MCP server is available
// Tools should include: ustaxes_set_filing_status, ustaxes_add_w2, etc.
```

**Ask user:**
```markdown
I'll help you prepare your ${taxYear} tax return using step-by-step questions.

This will take approximately 15-30 minutes depending on complexity.

**What I'll need from you:**
- Personal information (name, SSN, address)
- Filing status and dependent information
- Income information (W-2s, 1099s, etc.)
- Deduction information (mortgage, student loans, etc.)
- Payment information (withholding, estimated payments)

**Ready to begin?** (yes/no)
```

### Phase 2: Personal Information

**Filing Status:**
```markdown
## Filing Status

What is your filing status for ${taxYear}?

1. **Single** - Unmarried, legally separated, or divorced
2. **Married Filing Jointly** - Married and filing together (usually saves money)
3. **Married Filing Separately** - Married but filing separate returns
4. **Head of Household** - Unmarried and paid >50% household costs for qualifying person
5. **Qualifying Surviving Spouse** - Spouse died in previous 2 years, have dependent child

Choose 1-5:
```

**Collect response and set via MCP:**
```typescript
const filingStatusMap = {
  '1': 'S',
  '2': 'MFJ',
  '3': 'MFS',
  '4': 'HOH',
  '5': 'W'
}

await mcp.ustaxes_set_filing_status({
  year: taxYear,
  status: filingStatusMap[response]
})
```

**Primary Taxpayer:**
```markdown
## Your Information

**Legal First Name:** ___________
**Middle Initial (optional):** ___
**Last Name:** ___________
**Social Security Number:** ___-__-____
**Date of Birth:** MM/DD/YYYY

**Mailing Address:**
Street Address: ___________
Apartment/Unit (optional): ___
City: ___________
State: ___
ZIP Code: _____

**Occupation:** ___________
```

**Collect and add via MCP:**
```typescript
await mcp.ustaxes_add_primary_person({
  year: taxYear,
  person: {
    firstName: responses.firstName,
    lastName: responses.lastName,
    ssid: responses.ssn,
    role: 'PRIMARY',
    address: {
      address: responses.street,
      city: responses.city,
      state: responses.state,
      zip: responses.zip
    }
  }
})
```

**Spouse (if MFJ/MFS):**
```markdown
## Spouse Information

**First Name:** ___________
**Last Name:** ___________
**SSN:** ___-__-____
**Occupation:** ___________
```

```typescript
if (filingStatus === 'MFJ' || filingStatus === 'MFS') {
  await mcp.ustaxes_add_spouse({
    year: taxYear,
    spouse: {
      firstName: responses.spouseFirst,
      lastName: responses.spouseLast,
      ssid: responses.spouseSSN,
      role: 'SPOUSE'
    }
  })
}
```

**Dependents:**
```markdown
## Dependents

Do you have any dependents (children or qualifying relatives)? (yes/no)

If yes, for each dependent:

**Dependent 1:**
- First Name: ___________
- Last Name: ___________
- SSN: ___-__-____
- Relationship: (son/daughter/parent/grandchild/other)
- Date of Birth: MM/DD/YYYY
- Lived with you all year? (yes/no)

Add another dependent? (yes/no)
```

```typescript
for (const dep of dependents) {
  await mcp.ustaxes_add_dependent({
    year: taxYear,
    dependent: {
      firstName: dep.firstName,
      lastName: dep.lastName,
      ssid: dep.ssn,
      role: 'DEPENDENT',
      birthYear: new Date(dep.dob).getFullYear(),
      relationship: dep.relationship.toUpperCase()
    }
  })
}
```

### Phase 3: Income

**W-2 Wage Income:**
```markdown
## W-2 Wage Income

How many W-2 forms did you receive in ${taxYear}? ___

For each W-2, I'll need the following information from the form:

**W-2 #1:**

**Employer Information:**
- Employer Name (Box c): ___________
- Employer ID Number/EIN (Box b): __-_______

**Income (from boxes):**
- Box 1 - Wages, tips, other compensation: $_________
- Box 2 - Federal income tax withheld: $_________
- Box 3 - Social security wages: $_________
- Box 4 - Social security tax withheld: $_________
- Box 5 - Medicare wages: $_________
- Box 6 - Medicare tax withheld: $_________

**State Information (if applicable):**
- Box 15 - State: ___
- Box 16 - State wages: $_________
- Box 17 - State income tax withheld: $_________

**Who earned this?** (you/spouse)
**Occupation:** ___________

Add another W-2? (yes/no)
```

```typescript
for (const w2 of w2Forms) {
  await mcp.ustaxes_add_w2({
    year: taxYear,
    w2: {
      occupation: w2.occupation,
      income: w2.box1,
      medicareIncome: w2.box5,
      fedWithholding: w2.box2,
      ssWages: w2.box3,
      ssWithholding: w2.box4,
      medicareWithholding: w2.box6,
      ein: w2.ein,
      employerName: w2.employer,
      personRole: w2.earner, // 'PRIMARY' or 'SPOUSE'
      state: w2.state || undefined,
      stateWages: w2.stateWages || undefined,
      stateWithholding: w2.stateWithholding || undefined
    }
  })
}
```

**Other Income:**
```markdown
## Other Income

Did you have any of the following income in ${taxYear}?

- [ ] Interest income (1099-INT from banks, savings accounts)
- [ ] Dividend income (1099-DIV from investments)
- [ ] Self-employment income (1099-NEC, 1099-MISC)
- [ ] Capital gains (1099-B from stock sales)
- [ ] Rental property income
- [ ] Unemployment compensation
- [ ] None of the above
```

**If 1099-INT:**
```markdown
**1099-INT Interest Income:**

For each 1099-INT form:
- Payer Name: ___________
- Payer Tax ID: __-_______
- Box 1 - Interest income: $_________
- Box 3 - Tax-exempt interest (optional): $_________

Add another 1099-INT? (yes/no)
```

```typescript
await mcp.ustaxes_add_1099({
  year: taxYear,
  form1099: {
    form: '1099-INT',
    payer: responses.payer,
    payerTin: responses.payerTin,
    personRole: 'PRIMARY',
    income: responses.box1,
    interest: responses.box1
  }
})
```

**If 1099-DIV:**
```markdown
**1099-DIV Dividend Income:**

- Payer Name: ___________
- Payer Tax ID: __-_______
- Box 1a - Total ordinary dividends: $_________
- Box 1b - Qualified dividends: $_________
```

```typescript
await mcp.ustaxes_add_1099({
  year: taxYear,
  form1099: {
    form: '1099-DIV',
    payer: responses.payer,
    payerTin: responses.payerTin,
    personRole: 'PRIMARY',
    income: responses.box1a,
    dividends: responses.box1a,
    qualifiedDividends: responses.box1b
  }
})
```

**If rental property:**
```markdown
**Rental Property:**

**Property Address:**
- Street: ___________
- City: ___________
- State: ___
- ZIP: _____

**Rental Activity:**
- Days rented: ___
- Days used personally: ___
- Total rent received: $_________

**Expenses:**
- Mortgage interest: $_________
- Property taxes: $_________
- Insurance: $_________
- Repairs & maintenance: $_________
- Utilities (if paid by you): $_________
- Management fees: $_________
```

```typescript
await mcp.ustaxes_add_property({
  year: taxYear,
  property: {
    address: {
      address: responses.street,
      city: responses.city,
      state: responses.state,
      zip: responses.zip
    },
    rentalDays: responses.rentalDays,
    personalUseDays: responses.personalDays,
    rentReceived: responses.rent,
    expenses: {
      mortgageInterest: responses.mortgageInt,
      taxes: responses.propTax,
      insurance: responses.insurance,
      repairs: responses.repairs,
      utilities: responses.utilities,
      managementFees: responses.mgmtFees
    }
  }
})
```

### Phase 4: Deductions & Adjustments

**Student Loan Interest:**
```markdown
## Student Loan Interest

Did you pay student loan interest in ${taxYear}? (yes/no)

If yes:
- Lender Name: ___________
- Box 1 - Student loan interest paid: $_________

(Form 1098-E)
```

```typescript
if (hasStudentLoanInt) {
  await mcp.ustaxes_add_student_loan({
    year: taxYear,
    f1098e: {
      lender: responses.lender,
      interest: responses.interest
    }
  })
}
```

**HSA Contributions:**
```markdown
## Health Savings Account (HSA)

Did you contribute to an HSA in ${taxYear}? (yes/no)

If yes:
- Total contributions: $_________
- Employer contributions (from W-2 Box 12, code W): $_________
- Who's account? (yours/spouse's)
```

```typescript
if (hasHSA) {
  await mcp.ustaxes_add_hsa({
    year: taxYear,
    hsa: {
      personRole: responses.whose === 'yours' ? 'PRIMARY' : 'SPOUSE',
      totalContributions: responses.total,
      employerContributions: responses.employer
    }
  })
}
```

**IRA Contributions:**
```markdown
## IRA Contributions

Did you contribute to a Traditional IRA in ${taxYear}? (yes/no)

If yes:
- Contribution amount: $_________
- Who contributed? (you/spouse)
```

```typescript
if (hasIRA) {
  await mcp.ustaxes_add_ira({
    year: taxYear,
    ira: {
      personRole: responses.who === 'you' ? 'PRIMARY' : 'SPOUSE',
      contributionType: 'traditional',
      contribution: responses.amount
    }
  })
}
```

**Itemized Deductions:**
```markdown
## Itemized Deductions

The standard deduction for your filing status is $${standardDeduction}.

You may save money by itemizing if you have:
- Mortgage interest
- Charitable donations
- Medical expenses (if high)
- State/local taxes

Do you want to explore itemized deductions? (yes/no)

If yes:

**Mortgage Interest (Form 1098):**
- Total mortgage interest paid: $_________

**State and Local Taxes:**
- State income tax paid (from W-2 Box 17): $_________
- Property tax paid: $_________
- Note: Total SALT deduction capped at $10,000

**Charitable Donations:**
- Cash donations: $_________
- Non-cash donations (goods, property): $_________

**Medical Expenses:**
- Total out-of-pocket medical/dental: $_________
- Note: Only amount over ${medicalThreshold} is deductible
```

```typescript
if (wantsItemized) {
  await mcp.ustaxes_set_itemized_deductions({
    year: taxYear,
    deductions: {
      mortgageInterest: responses.mortgageInt,
      stateAndLocalTaxes: Math.min(responses.stateTax + responses.propTax, 10000),
      charitableCash: responses.charityC ash,
      charitableNonCash: responses.charityNonCash,
      medicalAndDental: responses.medical
    }
  })
}
```

### Phase 5: Review & Summary

```markdown
## Tax Return Summary

Let me calculate your ${taxYear} taxes...

**Income:**
- W-2 wages: $${w2Total.toLocaleString()}
- Interest: $${interestTotal.toLocaleString()}
- Dividends: $${divTotal.toLocaleString()}
- Rental income: $${rentalNet.toLocaleString()}
**Total Income:** $${totalIncome.toLocaleString()}

**Adjustments:**
- Student loan interest: -$${studentLoanInt.toLocaleString()}
- IRA deduction: -$${iraDeduction.toLocaleString()}
- HSA deduction: -$${hsaDeduction.toLocaleString()}

**Adjusted Gross Income:** $${agi.toLocaleString()}

**Deductions:**
- Standard deduction: $${standardDed.toLocaleString()}
- OR Itemized deductions: $${itemizedDed.toLocaleString()}
**Using:** ${usingItemized ? 'Itemized' : 'Standard'} ($${deduction.toLocaleString()})

**Taxable Income:** $${taxableIncome.toLocaleString()}

**Tax Calculation:**
- Regular income tax: $${regularTax.toLocaleString()}
- Additional taxes: $${additionalTax.toLocaleString()}
**Total Tax:** $${totalTax.toLocaleString()}

**Credits:**
- Child tax credit: -$${childCredit.toLocaleString()}
- Other credits: -$${otherCredits.toLocaleString()}

**Tax After Credits:** $${taxAfterCredits.toLocaleString()}

**Payments:**
- Federal withholding: $${fedWithholding.toLocaleString()}
- Estimated payments: $${estimatedPayments.toLocaleString()}

**${isRefund ? 'REFUND' : 'AMOUNT OWED'}:** $${Math.abs(refundOrOwed).toLocaleString()}

**Effective Tax Rate:** ${effectiveRate}%

Does this look correct? (yes/no)
```

### Phase 6: PDF Generation

```markdown
## Generate Tax Return PDF

Your return is complete. Ready to generate the PDF? (yes/no)

Generating PDF...
```

```typescript
// Generate federal PDF
const federalResult = await mcp.ustaxes_generate_federal_pdf({
  year: taxYear,
  outputPath: `/tmp/federal-${taxYear}.pdf`
})

if (federalResult.success) {
  console.log(`✓ Federal return: ${federalResult.data.outputPath} (${(federalResult.data.fileSize / 1024).toFixed(1)} KB)`)
  console.log(`  Forms included: ${federalResult.data.formsIncluded.join(', ')}`)
}
```

**If state residency:**
```markdown
Do you need a state return? (yes/no)

If yes, which state? ___

Generating state return...
```

```typescript
if (needsState) {
  await mcp.ustaxes_add_state_residency({
    year: taxYear,
    state: stateCode
  })

  const stateResult = await mcp.ustaxes_generate_state_pdf({
    year: taxYear,
    state: stateCode,
    outputPath: `/tmp/state-${stateCode}-${taxYear}.pdf`
  })

  if (stateResult.success) {
    console.log(`✓ State return: ${stateResult.data.outputPath} (${(stateResult.data.fileSize / 1024).toFixed(1)} KB)`)
  }
}
```

### Phase 7: Next Steps

```markdown
## 🎉 Your ${taxYear} Tax Return is Complete!

**Files generated:**
- Federal: `/tmp/federal-${taxYear}.pdf`
${stateGenerated ? `- State (${stateCode}): /tmp/state-${stateCode}-${taxYear}.pdf` : ''}

**${isRefund ? 'Expected refund' : 'Amount owed'}:** $${Math.abs(refundOrOwed).toLocaleString()}

**Next Steps:**
1. ✅ Review both PDFs carefully
2. ✅ Verify all numbers match your documents
3. ✅ Check SSNs and bank account numbers
4. ✅ Sign and date the return
5. ✅ File before April 15, ${taxYear + 1}

**Filing Options:**
- **E-file (recommended):** Fastest, most secure, 2-3 weeks for refund
- **Mail:** Send to IRS service center for your state

**Important:**
- Keep copies of all documents for 7 years
- Keep W-2s, 1099s, receipts for deductions
- Save a copy of the filed return

**Disclaimer:** This return was prepared using automated software. You are responsible for reviewing accuracy before filing. Consider professional review for complex situations.

Would you like me to:
- [ ] Explain any specific line items
- [ ] Calculate estimated taxes for next year
- [ ] Export return data for safekeeping
```

## Error Handling

**Missing required data:**
```markdown
⚠️ Cannot complete return - missing required information:
- [List missing items]

Please provide this information to continue.
```

**Validation errors:**
```markdown
❌ Data validation failed:
- [List validation errors]

Please correct and retry.
```

## MCP Tools Used

This command uses the following MCP tools:
- `ustaxes_set_filing_status`
- `ustaxes_add_primary_person`
- `ustaxes_add_spouse`
- `ustaxes_add_dependent`
- `ustaxes_add_w2`
- `ustaxes_add_1099`
- `ustaxes_add_property`
- `ustaxes_add_student_loan`
- `ustaxes_add_hsa`
- `ustaxes_add_ira`
- `ustaxes_set_itemized_deductions`
- `ustaxes_add_state_residency`
- `ustaxes_generate_federal_pdf`
- `ustaxes_generate_state_pdf`

## Example Usage

```bash
# Prepare 2024 return
/prepare-return

# Prepare 2023 return
/prepare-return 2023
```

## Success Criteria

Return is complete when:
- ✅ All personal information collected
- ✅ All income sources documented
- ✅ Deductions and credits applied
- ✅ PDF generated successfully
- ✅ User reviewed and approved

**Estimated Time:** 15-30 minutes

---

**Note:** This is an interactive command that guides you through tax preparation with step-by-step questions. Have your tax documents ready before starting.
