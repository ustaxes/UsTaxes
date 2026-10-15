/**
 * 2024 Tax Year Rules Database
 * Comprehensive IRS rules, limits, and thresholds
 */

export const TAX_RULES_2024: Record<string, any> = {
  standard_deduction: {
    single: 14600,
    married_filing_jointly: 29200,
    married_filing_separately: 14600,
    head_of_household: 21900,
    additional_age_65: 1950,
    additional_blind: 1950,
  },

  child_tax_credit: {
    amount_per_child: 2000,
    refundable_portion: 1700,
    phase_out_threshold: {
      married_filing_jointly: 400000,
      all_others: 200000,
    },
    phase_out_rate: 50, // per $1000 over threshold
  },

  ira_contributions: {
    traditional: {
      limit: 7000,
      catch_up_age_50: 1000,
      deduction_phase_out: {
        single_with_plan: { start: 77000, end: 87000 },
        married_filing_jointly_with_plan: { start: 123000, end: 143000 },
        married_filing_jointly_spouse_has_plan: { start: 230000, end: 240000 },
      },
    },
    roth: {
      limit: 7000,
      catch_up_age_50: 1000,
      phase_out: {
        single: { start: 146000, end: 161000 },
        married_filing_jointly: { start: 230000, end: 240000 },
      },
    },
  },

  hsa_contributions: {
    self_only: 4150,
    family: 8300,
    catch_up_age_55: 1000,
  },

  student_loan_interest: {
    max_deduction: 2500,
    phase_out: {
      single: { start: 80000, end: 95000 },
      married_filing_jointly: { start: 165000, end: 195000 },
    },
  },

  itemized_deductions: {
    salt_cap: 10000,
    medical_expenses_threshold: 0.075, // 7.5% of AGI
    charitable_cash_limit: 0.60, // 60% of AGI
    charitable_property_limit: 0.30, // 30% of AGI
  },

  education_credits: {
    american_opportunity: {
      max_credit: 2500,
      refundable_portion: 0.40,
      phase_out: {
        single: { start: 80000, end: 90000 },
        married_filing_jointly: { start: 160000, end: 180000 },
      },
    },
    lifetime_learning: {
      max_credit: 2000,
      phase_out: {
        single: { start: 80000, end: 90000 },
        married_filing_jointly: { start: 160000, end: 180000 },
      },
    },
  },

  earned_income_credit: {
    max_income: {
      no_children_single: 18591,
      no_children_married: 25511,
      one_child_single: 49084,
      one_child_married: 56004,
      two_children_single: 55768,
      two_children_married: 62688,
      three_or_more_single: 59899,
      three_or_more_married: 66819,
    },
  },

  additional_taxes: {
    net_investment_income_tax: {
      rate: 0.038,
      threshold: {
        single: 200000,
        married_filing_jointly: 250000,
        married_filing_separately: 125000,
        head_of_household: 200000,
      },
    },
    additional_medicare: {
      rate: 0.009,
      threshold: {
        single: 200000,
        married_filing_jointly: 250000,
        married_filing_separately: 125000,
      },
    },
  },

  capital_gains_rates: {
    zero_percent: {
      single: 47025,
      married_filing_jointly: 94050,
      head_of_household: 63000,
    },
    fifteen_percent: {
      single: 518900,
      married_filing_jointly: 583750,
      head_of_household: 551350,
    },
    // Above these thresholds = 20%
  },

  estate_and_gift: {
    annual_exclusion: 18000,
    lifetime_exemption: 13610000,
  },

  business: {
    section_179_limit: 1220000,
    standard_mileage_rate: 0.67,
    business_meals_deduction: 0.50,
    home_office_simplified_rate: 5, // per square foot
    home_office_simplified_max: 300, // square feet
  },
};
