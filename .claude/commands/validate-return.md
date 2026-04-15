---
name: validate-return
description: "Audit and validate tax return for accuracy, compliance, and completeness before filing"
args:
  - name: year
    description: "Tax year to validate (default: 2024)"
    required: false
  - name: outputPath
    description: "Path to save validation report (default: /tmp/validation-report-{year}.md)"
    required: false
---

# Validate Tax Return

Perform comprehensive validation of completed tax return before filing using the **UsTaxes MCP Server**.

## What This Command Does

This command:
- ✅ Exports and analyzes your tax return state
- ✅ Validates data completeness and consistency
- ✅ Checks mathematical accuracy via PDF generation
- ✅ Identifies missing required information
- ✅ Generates detailed validation report

## What This Command Does NOT Do

This command does NOT:
- ❌ Check IRS rule compliance (no irs-rules-engine implemented)
- ❌ Assess audit risk (requires statistical analysis not available)
- ❌ Suggest optimizations (use `/optimize-deductions` instead)
- ❌ Verify against IRS publications (manual review recommended)

## MCP Tools Used

1. **`ustaxes_export_state`** - Export tax return data for analysis
2. **`ustaxes_generate_federal_pdf`** - Validate federal return via PDF generation
3. **`ustaxes_generate_state_pdf`** - Validate state return (if applicable)

## Validation Workflow

### Phase 1: Setup and Export State

```typescript
const taxYear = args.year ?? 2024
const outputPath = args.outputPath ?? `/tmp/validation-report-${taxYear}.md`

console.log(`Validating ${taxYear} tax return...`)
console.log(`This will export your return data and test PDF generation.\n`)

// Export current state for analysis
const exportPath = `/tmp/tax-state-${taxYear}.json`
const exportResult = await mcp.ustaxes_export_state({
  year: taxYear,
  outputPath: exportPath
})

if (!exportResult.success) {
  throw new Error(`Failed to export tax state: ${exportResult.error}`)
}

console.log(`✓ Exported tax state to ${exportPath}`)

// Load the exported state for analysis
const stateData = JSON.parse(await fs.readFile(exportPath, 'utf-8'))
```

### Phase 2: Validate Personal Information

```typescript
const validation = {
  critical: [],
  warnings: [],
  passed: []
}

// Check filing status
if (!stateData.taxPayer?.filingStatus) {
  validation.critical.push({
    category: 'Personal Information',
    issue: 'Missing Filing Status',
    location: 'Form 1040, Header',
    impact: 'Return cannot be filed without filing status',
    resolution: 'Run /prepare-return and select filing status'
  })
} else {
  validation.passed.push('Filing status: ' + stateData.taxPayer.filingStatus)
}

// Check primary taxpayer
if (!stateData.taxPayer?.primaryPerson?.ssid) {
  validation.critical.push({
    category: 'Personal Information',
    issue: 'Missing Primary Taxpayer SSN',
    location: 'Form 1040, Header',
    impact: 'Return will be rejected by IRS',
    resolution: 'Add primary taxpayer SSN'
  })
} else if (!/^\d{3}-\d{2}-\d{4}$/.test(stateData.taxPayer.primaryPerson.ssid)) {
  validation.warnings.push({
    category: 'Personal Information',
    issue: 'SSN format may be invalid',
    location: 'Form 1040, Header',
    recommendation: 'Verify SSN format: XXX-XX-XXXX'
  })
} else {
  validation.passed.push('Primary taxpayer SSN present and formatted correctly')
}

// Check name
if (!stateData.taxPayer?.primaryPerson?.firstName || !stateData.taxPayer?.primaryPerson?.lastName) {
  validation.critical.push({
    category: 'Personal Information',
    issue: 'Missing Taxpayer Name',
    location: 'Form 1040, Header',
    impact: 'Return cannot be processed',
    resolution: 'Add taxpayer first and last name'
  })
} else {
  validation.passed.push(`Taxpayer name: ${stateData.taxPayer.primaryPerson.firstName} ${stateData.taxPayer.primaryPerson.lastName}`)
}

// Check address
const address = stateData.taxPayer?.primaryPerson?.address
if (!address?.address || !address?.city || !address?.state || !address?.zip) {
  validation.critical.push({
    category: 'Personal Information',
    issue: 'Incomplete Mailing Address',
    location: 'Form 1040, Header',
    impact: 'IRS cannot mail refund or notices',
    resolution: 'Complete full mailing address'
  })
} else {
  validation.passed.push(`Address: ${address.address}, ${address.city}, ${address.state} ${address.zip}`)
}

// Check spouse (if MFJ or MFS)
if (['MFJ', 'MFS'].includes(stateData.taxPayer?.filingStatus)) {
  if (!stateData.taxPayer?.spouse?.ssid) {
    validation.critical.push({
      category: 'Personal Information',
      issue: 'Missing Spouse SSN',
      location: 'Form 1040, Header',
      impact: 'Required for Married Filing Jointly/Separately',
      resolution: 'Add spouse information'
    })
  } else {
    validation.passed.push('Spouse information present')
  }
}

console.log(`✓ Personal information validated`)
```

### Phase 3: Validate Income

```typescript
// Check for income sources
const hasW2s = (stateData.w2s?.length ?? 0) > 0
const has1099s = (stateData.f1099s?.length ?? 0) > 0
const hasProperty = (stateData.realEstate?.length ?? 0) > 0

if (!hasW2s && !has1099s && !hasProperty) {
  validation.critical.push({
    category: 'Income',
    issue: 'No Income Reported',
    location: 'Form 1040, Lines 1-8',
    impact: 'Return may be rejected or flagged',
    resolution: 'Add at least one income source (W-2, 1099, or property)'
  })
} else {
  validation.passed.push('Income sources present:')

  if (hasW2s) {
    const totalW2Income = stateData.w2s.reduce((sum, w2) => sum + (w2.income ?? 0), 0)
    validation.passed.push(`  - ${stateData.w2s.length} W-2(s): $${totalW2Income.toLocaleString()}`)

    // Validate W-2 data
    stateData.w2s.forEach((w2, idx) => {
      if (!w2.ein) {
        validation.warnings.push({
          category: 'Income',
          issue: `W-2 #${idx + 1} missing EIN`,
          location: `W-2 #${idx + 1}`,
          recommendation: 'Add employer EIN for complete records'
        })
      }
      if (!w2.employerName) {
        validation.warnings.push({
          category: 'Income',
          issue: `W-2 #${idx + 1} missing employer name`,
          location: `W-2 #${idx + 1}`,
          recommendation: 'Add employer name for reference'
        })
      }
    })
  }

  if (has1099s) {
    const total1099 = stateData.f1099s.reduce((sum, f1099) => sum + (f1099.income ?? 0), 0)
    validation.passed.push(`  - ${stateData.f1099s.length} 1099(s): $${total1099.toLocaleString()}`)
  }

  if (hasProperty) {
    const totalRent = stateData.realEstate.reduce((sum, prop) => sum + (prop.rentReceived ?? 0), 0)
    validation.passed.push(`  - ${stateData.realEstate.length} rental propert(ies): $${totalRent.toLocaleString()} income`)
  }
}

console.log(`✓ Income validated`)
```

### Phase 4: Validate Deductions

```typescript
// Check deductions
if (stateData.itemizedDeductions) {
  const itemized = stateData.itemizedDeductions
  let totalItemized = 0

  if (itemized.mortgageInterest) totalItemized += itemized.mortgageInterest
  if (itemized.stateAndLocalTaxes) totalItemized += itemized.stateAndLocalTaxes
  if (itemized.charitableCash) totalItemized += itemized.charitableCash
  if (itemized.charitableNonCash) totalItemized += itemized.charitableNonCash
  if (itemized.medicalAndDental) totalItemized += itemized.medicalAndDental

  validation.passed.push(`Itemized deductions: $${totalItemized.toLocaleString()}`)

  // SALT cap warning
  if (itemized.stateAndLocalTaxes > 10000) {
    validation.warnings.push({
      category: 'Deductions',
      issue: 'SALT deduction exceeds $10,000 cap',
      location: 'Schedule A, Line 5e',
      recommendation: 'SALT deduction will be limited to $10,000'
    })
  }

  // Large charitable contribution warning
  const totalCharity = (itemized.charitableCash ?? 0) + (itemized.charitableNonCash ?? 0)
  if (totalCharity > 5000) {
    validation.warnings.push({
      category: 'Deductions',
      issue: `Large charitable contribution: $${totalCharity.toLocaleString()}`,
      location: 'Schedule A, Lines 11-12',
      recommendation: 'Ensure you have receipts for all donations ≥$250'
    })
  }
}

// Check HSA
if (stateData.healthSavingsAccounts?.length > 0) {
  const totalHSA = stateData.healthSavingsAccounts.reduce((sum, hsa) => {
    return sum + (hsa.totalContributions ?? 0) - (hsa.employerContributions ?? 0)
  }, 0)
  validation.passed.push(`HSA contributions: $${totalHSA.toLocaleString()}`)
}

// Check IRA
if (stateData.individualRetirementArrangements?.length > 0) {
  const totalIRA = stateData.individualRetirementArrangements.reduce((sum, ira) => {
    return sum + (ira.contribution ?? 0)
  }, 0)
  validation.passed.push(`IRA contributions: $${totalIRA.toLocaleString()}`)
}

// Check student loan interest
if (stateData.f1098es?.length > 0) {
  const totalStudentLoan = stateData.f1098es.reduce((sum, f1098e) => {
    return sum + (f1098e.interest ?? 0)
  }, 0)
  validation.passed.push(`Student loan interest: $${totalStudentLoan.toLocaleString()}`)

  if (totalStudentLoan > 2500) {
    validation.warnings.push({
      category: 'Deductions',
      issue: 'Student loan interest exceeds $2,500 limit',
      location: 'Schedule 1, Line 21',
      recommendation: 'Deduction will be capped at $2,500'
    })
  }
}

console.log(`✓ Deductions validated`)
```

### Phase 5: Validate Credits

```typescript
// Check dependents for child tax credit
if (stateData.taxPayer?.dependents?.length > 0) {
  const currentYear = taxYear
  const qualifyingChildren = stateData.taxPayer.dependents.filter(dep => {
    const age = currentYear - (dep.birthYear ?? currentYear)
    return age < 17 // Qualifying child under 17
  })

  if (qualifyingChildren.length > 0) {
    validation.passed.push(`${qualifyingChildren.length} qualifying child(ren) for Child Tax Credit`)
  }

  // Check for missing dependent info
  stateData.taxPayer.dependents.forEach((dep, idx) => {
    if (!dep.ssid) {
      validation.critical.push({
        category: 'Credits',
        issue: `Dependent #${idx + 1} missing SSN`,
        location: 'Form 1040, Dependents section',
        impact: 'Cannot claim Child Tax Credit without dependent SSN',
        resolution: 'Add dependent SSN'
      })
    }
    if (!dep.birthYear) {
      validation.warnings.push({
        category: 'Credits',
        issue: `Dependent #${idx + 1} missing birth year`,
        location: 'Form 1040, Dependents section',
        recommendation: 'Add birth year to verify age eligibility'
      })
    }
  })
}

console.log(`✓ Credits validated`)
```

### Phase 6: Test PDF Generation (Final Validation)

```typescript
console.log(`\nTesting PDF generation to validate calculations...\n`)

// Generate federal PDF as final validation test
const federalPdfPath = `/tmp/validation-federal-${taxYear}.pdf`

try {
  const federalResult = await mcp.ustaxes_generate_federal_pdf({
    year: taxYear,
    outputPath: federalPdfPath
  })

  if (federalResult.success) {
    validation.passed.push('Federal PDF generated successfully')
    console.log(`✓ Federal PDF generated: ${federalPdfPath}`)
    console.log(`  File size: ${(federalResult.data.fileSize / 1024).toFixed(2)} KB`)
  } else {
    validation.critical.push({
      category: 'PDF Generation',
      issue: 'Federal PDF generation failed',
      location: 'Form 1040',
      impact: 'Return has errors that prevent filing',
      resolution: federalResult.error || 'Check return data for errors'
    })
  }
} catch (error) {
  validation.critical.push({
    category: 'PDF Generation',
    issue: 'Federal PDF generation error',
    location: 'Form 1040',
    impact: 'Return cannot be generated due to data errors',
    resolution: error.message || 'Review and fix return data'
  })
}

// Test state PDF if state residency is set
if (stateData.taxPayer?.primaryPerson?.address?.state) {
  const state = stateData.taxPayer.primaryPerson.address.state
  const statePdfPath = `/tmp/validation-state-${state}-${taxYear}.pdf`

  try {
    const stateResult = await mcp.ustaxes_generate_state_pdf({
      year: taxYear,
      state: state,
      outputPath: statePdfPath
    })

    if (stateResult.success) {
      validation.passed.push(`State PDF generated successfully (${state})`)
      console.log(`✓ State PDF generated: ${statePdfPath}`)
      console.log(`  File size: ${(stateResult.data.fileSize / 1024).toFixed(2)} KB`)
    } else {
      validation.warnings.push({
        category: 'PDF Generation',
        issue: `State PDF generation failed (${state})`,
        location: `${state} State Return`,
        recommendation: stateResult.error || 'State return may not be supported or has errors'
      })
    }
  } catch (error) {
    validation.warnings.push({
      category: 'PDF Generation',
      issue: `State PDF generation error (${state})`,
      location: `${state} State Return`,
      recommendation: error.message || 'State return may need manual preparation'
    })
  }
}

console.log(`✓ PDF generation validation complete`)
```

### Phase 7: Generate Validation Report

```typescript
// Generate markdown validation report
const report = generateValidationReport(validation, stateData, taxYear)

// Save report
await fs.writeFile(outputPath, report, 'utf-8')
console.log(`\n✓ Validation report saved to ${outputPath}\n`)

// Display summary
console.log('='.repeat(60))
console.log('VALIDATION SUMMARY')
console.log('='.repeat(60))

if (validation.critical.length === 0) {
  console.log('✅ VALIDATION PASSED')
  console.log('\nNo critical issues found. Your return is ready to file.')
} else {
  console.log('❌ VALIDATION FAILED')
  console.log(`\n${validation.critical.length} critical issue(s) must be fixed before filing.`)
}

if (validation.warnings.length > 0) {
  console.log(`\n⚠️  ${validation.warnings.length} warning(s) - review recommended`)
}

console.log(`\n✓ ${validation.passed.length} checks passed`)

console.log('\n' + '='.repeat(60))
console.log(`\nFull report: ${outputPath}`)

// Helper function to generate report
function generateValidationReport(validation, stateData, taxYear) {
  let report = `# Tax Return Validation Report\n\n`
  report += `**Tax Year:** ${taxYear}\n`
  report += `**Validation Date:** ${new Date().toISOString().split('T')[0]}\n`
  report += `**Taxpayer:** ${stateData.taxPayer?.primaryPerson?.firstName} ${stateData.taxPayer?.primaryPerson?.lastName}\n`
  report += `**Filing Status:** ${stateData.taxPayer?.filingStatus}\n\n`
  report += `---\n\n`

  // Overall status
  if (validation.critical.length === 0) {
    report += `## Overall Status: ✅ PASS\n\n`
    report += `Your return is ready to file.\n\n`
  } else {
    report += `## Overall Status: ❌ FAIL\n\n`
    report += `Critical issues must be resolved before filing.\n\n`
  }

  report += `**Summary:**\n`
  report += `- Critical Issues: ${validation.critical.length}\n`
  report += `- Warnings: ${validation.warnings.length}\n`
  report += `- Checks Passed: ${validation.passed.length}\n\n`
  report += `---\n\n`

  // Critical issues
  if (validation.critical.length > 0) {
    report += `## Critical Issues ❌\n\n`
    report += `These issues will prevent your return from being filed or accepted by the IRS.\n\n`

    validation.critical.forEach((issue, idx) => {
      report += `### ${idx + 1}. ${issue.issue}\n\n`
      report += `- **Category:** ${issue.category}\n`
      report += `- **Location:** ${issue.location}\n`
      report += `- **Impact:** ${issue.impact}\n`
      report += `- **Resolution:** ${issue.resolution}\n\n`
    })

    report += `**Action Required:** Fix these issues by running \`/prepare-return ${taxYear}\`\n\n`
    report += `---\n\n`
  }

  // Warnings
  if (validation.warnings.length > 0) {
    report += `## Warnings ⚠️\n\n`
    report += `These items don't prevent filing but should be reviewed.\n\n`

    validation.warnings.forEach((warning, idx) => {
      report += `### ${idx + 1}. ${warning.issue}\n\n`
      report += `- **Category:** ${warning.category}\n`
      report += `- **Location:** ${warning.location}\n`
      report += `- **Recommendation:** ${warning.recommendation}\n\n`
    })

    report += `---\n\n`
  }

  // Passed checks
  if (validation.passed.length > 0) {
    report += `## Validation Checks Passed ✓\n\n`

    validation.passed.forEach(check => {
      report += `- ${check}\n`
    })

    report += `\n---\n\n`
  }

  // Next steps
  report += `## Next Steps\n\n`

  if (validation.critical.length === 0) {
    report += `1. Review the validation report and warnings\n`
    report += `2. Check generated PDF files in \`/tmp/\`\n`
    report += `3. If everything looks correct, proceed to filing\n`
    report += `4. Keep this validation report with your tax records\n\n`

    report += `**Ready to File:**\n`
    report += `- Generated federal PDF: \`/tmp/validation-federal-${taxYear}.pdf\`\n`
    if (stateData.taxPayer?.primaryPerson?.address?.state) {
      report += `- Generated state PDF: \`/tmp/validation-state-${stateData.taxPayer.primaryPerson.address.state}-${taxYear}.pdf\`\n`
    }
  } else {
    report += `1. Fix critical issues listed above\n`
    report += `2. Run \`/prepare-return ${taxYear}\` to update your return\n`
    report += `3. Run \`/validate-return ${taxYear}\` again to verify fixes\n`
    report += `4. Do not file until validation passes\n`
  }

  report += `\n---\n\n`

  // Disclaimer
  report += `## Disclaimer\n\n`
  report += `This validation was performed by the UsTaxes MCP Server. While we check for common errors and completeness, you are ultimately responsible for the accuracy of your tax return. This validation:\n\n`
  report += `- ✅ Checks data completeness\n`
  report += `- ✅ Validates mathematical calculations via PDF generation\n`
  report += `- ✅ Identifies missing required information\n`
  report += `- ❌ Does NOT verify IRS rule compliance\n`
  report += `- ❌ Does NOT assess audit risk\n`
  report += `- ❌ Does NOT replace professional tax advice\n\n`
  report += `**Recommendation:** Consider professional review for complex tax situations.\n\n`

  report += `---\n\n`
  report += `*Report generated: ${new Date().toISOString()}*\n`

  return report
}
```

## Error Handling

**Return Not Found:**
```
❌ Failed to export tax state: No data found for year 2024

This means no tax return exists for the specified year.

Solution:
1. Run /prepare-return 2024 to create a new return
2. Verify you're checking the correct tax year
```

**PDF Generation Fails:**
```
❌ Critical Issue: Federal PDF generation failed

This indicates errors in your tax return data that prevent form generation.

Solution:
1. Check the validation report for specific issues
2. Fix identified problems using /prepare-return
3. Re-run /validate-return to verify fixes
```

**Invalid State Data:**
```
⚠️  Tax return state file is corrupted or invalid

Solution:
1. Try exporting state again
2. If problem persists, rebuild return using /prepare-return
```

## Best Practices

1. **Validate before filing** - Always run this before submitting to IRS
2. **Fix all critical issues** - Don't ignore red flags
3. **Review warnings** - Even non-blocking issues can cause problems
4. **Keep validation reports** - Part of your permanent tax records
5. **Validate after changes** - Re-run after any updates to your return
6. **Check generated PDFs** - Manually review the PDF files in `/tmp/`

## Limitations

This validation command:
- ✅ **Can** check data completeness
- ✅ **Can** validate mathematical accuracy (via PDF generation)
- ✅ **Can** identify formatting issues
- ❌ **Cannot** verify IRS rule compliance (no rules engine)
- ❌ **Cannot** assess audit risk (no statistical model)
- ❌ **Cannot** suggest optimizations (use `/optimize-deductions`)

**For comprehensive review:** Consider professional tax preparation services for complex returns.

## Example Usage

```bash
# Validate current year return
/validate-return

# Validate specific year
/validate-return 2023

# Save report to custom location
/validate-return 2024 /home/user/taxes/validation-2024.md
```

## Output Files

- **Validation Report:** `/tmp/validation-report-{year}.md` (or custom path)
- **Federal PDF:** `/tmp/validation-federal-{year}.pdf`
- **State PDF:** `/tmp/validation-state-{STATE}-{year}.pdf`
- **Exported State:** `/tmp/tax-state-{year}.json`

## Success Criteria

Validation passes when:
- ✅ No critical errors found
- ✅ Federal PDF generates successfully
- ✅ All required personal information present
- ✅ At least one income source reported
- ✅ All dependents have SSNs (if claiming credits)

---

**Next Steps After Validation:**

- If **PASSED**: Review PDFs and proceed to filing
- If **FAILED**: Run `/prepare-return` to fix issues
- For **optimizations**: Run `/optimize-deductions`
- For **questions**: Review IRS publications or consult tax professional

---

*This command uses only the real UsTaxes MCP Server tools. It does not rely on conceptual MCP servers that are not implemented.*
