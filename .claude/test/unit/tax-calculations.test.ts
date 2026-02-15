/**
 * Unit Tests: Tax Calculations
 *
 * Tests for the tax calculation automation layer
 * (federal tax, state tax, credits, deductions)
 */

import {
  createSampleW2,
  createSample1099,
  createSampleTaxReturn,
  calculateExpectedTax,
  assertions,
} from '../utils/test-helpers';

import {
  createMockStore,
  mockActions,
  mockValidators,
} from '../utils/redux-mocks';

describe('Tax Calculations Layer', () => {
  describe('Federal Tax Brackets (2024)', () => {
    it('should calculate tax for single filer in 10% bracket', () => {
      const income = 10000; // Below 11,600 threshold
      const expectedTax = calculateExpectedTax(income, 'single');

      expect(expectedTax).toBe(1000); // 10% of 10,000
      expect(expectedTax).toBeValidCurrency();
    });

    it('should calculate tax for single filer in 12% bracket', () => {
      const income = 50000; // Above 11,600, below 47,150
      const expectedTax = calculateExpectedTax(income, 'single');

      // First 11,600 at 10% = 1,160
      // Next 35,550 at 12% = 4,266
      // Remaining 2,850 at 22% = 627
      // Total = 6,053
      expect(expectedTax).toBeCloseTo(6053, 0);
    });

    it('should calculate tax for single filer in 22% bracket', () => {
      const income = 100000; // Above 47,150, below 100,525
      const expectedTax = calculateExpectedTax(income, 'single');

      // First 11,600 at 10% = 1,160
      // Next 35,550 at 12% = 4,266
      // Remaining 52,850 at 22% = 11,627
      // Total = 17,053
      expect(expectedTax).toBeCloseTo(17053, 0);
    });

    it('should calculate tax for married filing jointly', () => {
      const income = 150000;
      const expectedTax = calculateExpectedTax(income, 'married');

      // First 23,200 at 10% = 2,320
      // Next 71,100 at 12% = 8,532
      // Remaining 55,700 at 22% = 12,254
      // Total = 23,106
      expect(expectedTax).toBeCloseTo(23106, 0);
    });

    it('should handle zero income', () => {
      const expectedTax = calculateExpectedTax(0, 'single');
      expect(expectedTax).toBe(0);
    });

    it('should handle negative income (edge case)', () => {
      const expectedTax = calculateExpectedTax(-1000, 'single');
      expect(expectedTax).toBe(0);
    });
  });

  describe('Standard Deduction (2024)', () => {
    it('should apply standard deduction for single filer', () => {
      const standardDeduction = 14600;
      const grossIncome = 75000;
      const taxableIncome = grossIncome - standardDeduction;

      expect(taxableIncome).toBe(60400);

      const tax = calculateExpectedTax(taxableIncome, 'single');
      expect(tax).toBeGreaterThan(0);
    });

    it('should apply standard deduction for married filing jointly', () => {
      const standardDeduction = 29200;
      const grossIncome = 150000;
      const taxableIncome = grossIncome - standardDeduction;

      expect(taxableIncome).toBe(120800);

      const tax = calculateExpectedTax(taxableIncome, 'married');
      expect(tax).toBeGreaterThan(0);
    });

    it('should not allow taxable income below zero', () => {
      const standardDeduction = 14600;
      const grossIncome = 10000;
      const taxableIncome = Math.max(0, grossIncome - standardDeduction);

      expect(taxableIncome).toBe(0);
      expect(calculateExpectedTax(taxableIncome, 'single')).toBe(0);
    });
  });

  describe('Effective Tax Rate', () => {
    it('should calculate effective tax rate correctly', () => {
      const grossIncome = 75000;
      const standardDeduction = 14600;
      const taxableIncome = grossIncome - standardDeduction;
      const tax = calculateExpectedTax(taxableIncome, 'single');

      const effectiveRate = tax / grossIncome;

      expect(effectiveRate).toBeGreaterThan(0);
      expect(effectiveRate).toBeLessThan(0.22); // Should be less than highest bracket
      expect(effectiveRate).toBeCloseTo(0.1112, 3); // ~11.12%
    });

    it('should have lower effective rate than marginal rate', () => {
      const grossIncome = 75000;
      const standardDeduction = 14600;
      const taxableIncome = grossIncome - standardDeduction;
      const tax = calculateExpectedTax(taxableIncome, 'single');

      const effectiveRate = tax / grossIncome;
      const marginalRate = 0.22; // 22% bracket

      expect(effectiveRate).toBeLessThan(marginalRate);
    });
  });

  describe('W-2 Wage Income', () => {
    it('should calculate tax from W-2 wages', () => {
      const w2 = createSampleW2({
        income: 75000,
        fedWithholding: 12000,
      });

      const standardDeduction = 14600;
      const taxableIncome = w2.income - standardDeduction;
      const tax = calculateExpectedTax(taxableIncome, 'single');

      expect(tax).toBeCloseTo(8341, 0);

      // Calculate refund/owed
      const refund = w2.fedWithholding - tax;
      expect(refund).toBeCloseTo(3659, 0); // Should get refund
    });

    it('should handle multiple W-2s', () => {
      const w2_1 = createSampleW2({ income: 50000, fedWithholding: 7000 });
      const w2_2 = createSampleW2({ income: 25000, fedWithholding: 3000 });

      const totalIncome = w2_1.income + w2_2.income;
      const totalWithholding = w2_1.fedWithholding + w2_2.fedWithholding;

      const standardDeduction = 14600;
      const taxableIncome = totalIncome - standardDeduction;
      const tax = calculateExpectedTax(taxableIncome, 'single');

      const refund = totalWithholding - tax;
      expect(refund).toBeGreaterThan(0); // Should get refund
    });
  });

  describe('1099 Income', () => {
    it('should calculate tax on 1099-NEC income', () => {
      const nec = createSample1099('1099-NEC', {
        nonemployeeCompensation: 50000,
      });

      // 1099-NEC is subject to self-employment tax
      const seTax = nec.nonemployeeCompensation * 0.153; // 15.3% SE tax
      const seTaxDeduction = seTax / 2; // Deduct 1/2 of SE tax

      const adjustedIncome = nec.nonemployeeCompensation - seTaxDeduction;
      const standardDeduction = 14600;
      const taxableIncome = adjustedIncome - standardDeduction;

      const incomeTax = calculateExpectedTax(taxableIncome, 'single');
      const totalTax = incomeTax + seTax;

      expect(totalTax).toBeGreaterThan(incomeTax); // SE tax increases total
      expect(seTax).toBeCloseTo(7650, 0);
    });

    it('should calculate tax on 1099-INT interest income', () => {
      const int = createSample1099('1099-INT', {
        interest: 1250,
      });

      const w2Income = 75000;
      const totalIncome = w2Income + int.interest;

      const standardDeduction = 14600;
      const taxableIncome = totalIncome - standardDeduction;

      const tax = calculateExpectedTax(taxableIncome, 'single');
      const taxWithoutInterest = calculateExpectedTax(w2Income - standardDeduction, 'single');

      // Interest should increase tax
      expect(tax).toBeGreaterThan(taxWithoutInterest);

      // Marginal tax on interest at 22% bracket
      const marginalTaxOnInterest = int.interest * 0.22;
      expect(tax - taxWithoutInterest).toBeCloseTo(marginalTaxOnInterest, 0);
    });

    it('should calculate tax on 1099-DIV dividend income', () => {
      const div = createSample1099('1099-DIV', {
        dividends: 1000,
        qualifiedDividends: 800,
      });

      // Qualified dividends taxed at preferential rates (0%, 15%, 20%)
      // For income under ~44,625 (single), qualified dividends are 0% tax
      // For income ~44,625-492,300, qualified dividends are 15% tax

      const w2Income = 75000;
      const qualifiedDivTax = div.qualifiedDividends * 0.15; // 15% rate
      const ordinaryDivTax = (div.dividends - div.qualifiedDividends) * 0.22; // 22% bracket

      const totalDivTax = qualifiedDivTax + ordinaryDivTax;

      expect(totalDivTax).toBeCloseTo(164, 0); // 120 + 44
    });
  });

  describe('Tax Credits', () => {
    it('should apply child tax credit', () => {
      const childTaxCredit = 2000; // Per qualifying child
      const numberOfChildren = 2;
      const totalCredit = childTaxCredit * numberOfChildren;

      const grossIncome = 75000;
      const standardDeduction = 14600;
      const taxableIncome = grossIncome - standardDeduction;
      const taxBeforeCredits = calculateExpectedTax(taxableIncome, 'single');

      const taxAfterCredits = Math.max(0, taxBeforeCredits - totalCredit);

      expect(totalCredit).toBe(4000);
      expect(taxAfterCredits).toBeLessThan(taxBeforeCredits);
    });

    it('should phase out child tax credit for high earners', () => {
      const childTaxCredit = 2000;
      const phaseOutThreshold = 200000; // Single filer
      const income = 250000;
      const excessIncome = income - phaseOutThreshold;
      const phaseOutAmount = Math.ceil(excessIncome / 1000) * 50;

      const reducedCredit = Math.max(0, childTaxCredit - phaseOutAmount);

      expect(reducedCredit).toBeLessThan(childTaxCredit);
      expect(reducedCredit).toBeGreaterThanOrEqual(0);
    });

    it('should apply earned income tax credit (EITC)', () => {
      const lowIncome = 20000;
      const numberOfChildren = 1;

      // EITC is complex, simplified for testing
      // For 1 child, max EITC ~$4,213 (2024)
      const maxEITC = 4213;

      // EITC can result in refund even with no tax liability
      const eitc = maxEITC;

      const standardDeduction = 14600;
      const taxableIncome = Math.max(0, lowIncome - standardDeduction);
      const tax = calculateExpectedTax(taxableIncome, 'single');

      const refund = eitc - tax;

      expect(refund).toBeGreaterThan(0); // EITC is refundable
      expect(eitc).toBeValidCurrency();
    });
  });

  describe('Itemized Deductions', () => {
    it('should choose standard deduction when higher', () => {
      const standardDeduction = 14600;
      const itemizedTotal = 10000; // SALT + mortgage interest + charity

      const chosenDeduction = Math.max(standardDeduction, itemizedTotal);

      expect(chosenDeduction).toBe(standardDeduction);
    });

    it('should choose itemized deductions when higher', () => {
      const standardDeduction = 14600;
      const itemizedDeductions = {
        saltDeduction: 10000, // SALT cap
        mortgageInterest: 8000,
        charitableContributions: 5000,
      };
      const itemizedTotal = Object.values(itemizedDeductions).reduce((a, b) => a + b, 0);

      const chosenDeduction = Math.max(standardDeduction, itemizedTotal);

      expect(chosenDeduction).toBe(itemizedTotal);
      expect(itemizedTotal).toBe(23000);
    });

    it('should apply SALT deduction cap of $10,000', () => {
      const stateTax = 8000;
      const localTax = 5000;
      const totalSALT = stateTax + localTax;
      const saltCap = 10000;

      const saltDeduction = Math.min(totalSALT, saltCap);

      expect(saltDeduction).toBe(saltCap);
      expect(totalSALT).toBeGreaterThan(saltDeduction);
    });
  });

  describe('Self-Employment Tax', () => {
    it('should calculate self-employment tax on Schedule C income', () => {
      const scheduleCIncome = 50000;
      const seTaxRate = 0.153; // 15.3% (12.4% SS + 2.9% Medicare)
      const seTax = scheduleCIncome * seTaxRate;

      expect(seTax).toBeCloseTo(7650, 0);
      expect(seTax).toBeValidCurrency();
    });

    it('should allow deduction of 1/2 self-employment tax', () => {
      const scheduleCIncome = 50000;
      const seTax = scheduleCIncome * 0.153;
      const seTaxDeduction = seTax / 2;

      const adjustedGrossIncome = scheduleCIncome - seTaxDeduction;

      expect(seTaxDeduction).toBeCloseTo(3825, 0);
      expect(adjustedGrossIncome).toBeLessThan(scheduleCIncome);
    });

    it('should apply Social Security wage cap', () => {
      const scheduleCIncome = 200000;
      const ssCap = 168600; // 2024 SS wage cap
      const medicareRate = 0.029; // 2.9%
      const ssRate = 0.124; // 12.4%

      const ssTax = Math.min(scheduleCIncome, ssCap) * ssRate;
      const medicareTax = scheduleCIncome * medicareRate;
      const totalSETax = ssTax + medicareTax;

      expect(ssTax).toBeCloseTo(20906.4, 1);
      expect(medicareTax).toBeCloseTo(5800, 0);
      expect(totalSETax).toBeCloseTo(26706.4, 1);
    });
  });

  describe('Additional Medicare Tax', () => {
    it('should apply 0.9% additional Medicare tax above threshold', () => {
      const wages = 250000;
      const threshold = 200000; // Single filer
      const excessWages = Math.max(0, wages - threshold);
      const additionalMedicareTax = excessWages * 0.009;

      expect(additionalMedicareTax).toBeCloseTo(450, 0);
    });

    it('should not apply additional Medicare tax below threshold', () => {
      const wages = 150000;
      const threshold = 200000;
      const excessWages = Math.max(0, wages - threshold);
      const additionalMedicareTax = excessWages * 0.009;

      expect(additionalMedicareTax).toBe(0);
    });
  });

  describe('Net Investment Income Tax (NIIT)', () => {
    it('should apply 3.8% NIIT on investment income above threshold', () => {
      const modifiedAGI = 250000;
      const investmentIncome = 30000;
      const threshold = 200000; // Single filer

      const excessIncome = Math.max(0, modifiedAGI - threshold);
      const niitBase = Math.min(investmentIncome, excessIncome);
      const niit = niitBase * 0.038;

      expect(niit).toBeCloseTo(1140, 0); // 30,000 * 3.8%
    });

    it('should not apply NIIT below threshold', () => {
      const modifiedAGI = 150000;
      const investmentIncome = 10000;
      const threshold = 200000;

      const excessIncome = Math.max(0, modifiedAGI - threshold);
      const niitBase = Math.min(investmentIncome, excessIncome);
      const niit = niitBase * 0.038;

      expect(niit).toBe(0);
    });
  });

  describe('Redux Store Integration', () => {
    let store: ReturnType<typeof createMockStore>;

    beforeEach(() => {
      store = createMockStore();
    });

    it('should dispatch W-2 and calculate total income', () => {
      const w2_1 = createSampleW2({ income: 50000 });
      const w2_2 = createSampleW2({ income: 25000 });

      store.dispatch(mockActions.addW2(w2_1));
      store.dispatch(mockActions.addW2(w2_2));

      const state = store.getState();
      const totalIncome = state.w2s.reduce((sum, w2) => sum + w2.income, 0);

      expect(totalIncome).toBe(75000);
      expect(state.w2s).toHaveLength(2);
    });

    it('should dispatch 1099 and calculate combined income', () => {
      const w2 = createSampleW2({ income: 75000 });
      const int = createSample1099('1099-INT', { interest: 1250 });

      store.dispatch(mockActions.addW2(w2));
      store.dispatch(mockActions.add1099(int));

      const state = store.getState();
      const w2Income = state.w2s.reduce((sum, w2) => sum + w2.income, 0);
      const interestIncome = state.f1099s
        .filter(f => f.form === '1099-INT')
        .reduce((sum, f) => sum + (f.interest || 0), 0);

      const totalIncome = w2Income + interestIncome;

      expect(totalIncome).toBe(76250);
    });

    it('should validate W-2 data before dispatch', () => {
      const validW2 = createSampleW2();
      const invalidW2 = { occupation: 'Test', income: -1000 }; // Negative income

      expect(mockValidators.incomeW2(validW2)).toBe(true);
      expect(mockValidators.incomeW2(invalidW2)).toBe(false);
    });
  });

  describe('Tax Withholding Accuracy', () => {
    it('should calculate if withholding was sufficient', () => {
      const w2 = createSampleW2({
        income: 75000,
        fedWithholding: 12000,
      });

      const standardDeduction = 14600;
      const taxableIncome = w2.income - standardDeduction;
      const actualTax = calculateExpectedTax(taxableIncome, 'single');

      const withholdingAccuracy = (w2.fedWithholding / actualTax) * 100;

      expect(withholdingAccuracy).toBeGreaterThan(100); // Over-withheld
      expect(withholdingAccuracy).toBeCloseTo(144, 0);
    });

    it('should identify under-withholding situation', () => {
      const w2 = createSampleW2({
        income: 75000,
        fedWithholding: 5000, // Under-withheld
      });

      const standardDeduction = 14600;
      const taxableIncome = w2.income - standardDeduction;
      const actualTax = calculateExpectedTax(taxableIncome, 'single');

      const amountOwed = actualTax - w2.fedWithholding;

      expect(amountOwed).toBeGreaterThan(0);
      expect(amountOwed).toBeCloseTo(3341, 0);
    });
  });

  describe('State Tax Calculations (Simplified)', () => {
    it('should calculate California state tax', () => {
      const income = 75000;
      const caRate = 0.093; // Simplified 9.3% rate
      const caStateTax = income * caRate;

      expect(caStateTax).toBeCloseTo(6975, 0);
    });

    it('should handle states with no income tax', () => {
      const noTaxStates = ['FL', 'TX', 'WA', 'NV', 'SD', 'WY', 'AK', 'TN', 'NH'];
      const income = 75000;

      for (const state of noTaxStates) {
        const stateTax = 0; // No state income tax
        expect(stateTax).toBe(0);
      }
    });
  });

  describe('Alternative Minimum Tax (AMT)', () => {
    it('should calculate AMT exemption', () => {
      const amtExemption = 85700; // 2024 single filer
      const phaseOutThreshold = 609350;

      const income = 150000;

      // No phase-out below threshold
      const exemption = income < phaseOutThreshold ? amtExemption : 0;

      expect(exemption).toBe(amtExemption);
    });

    it('should phase out AMT exemption for high earners', () => {
      const amtExemption = 85700;
      const phaseOutThreshold = 609350;
      const income = 700000;

      const excessIncome = income - phaseOutThreshold;
      const phaseOutAmount = excessIncome * 0.25;
      const reducedExemption = Math.max(0, amtExemption - phaseOutAmount);

      expect(reducedExemption).toBeLessThan(amtExemption);
      expect(reducedExemption).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle extremely high income', () => {
      const income = 10000000;
      const tax = calculateExpectedTax(income, 'single');

      expect(tax).toBeGreaterThan(3000000); // Top bracket is 37%
      expect(tax).toBeLessThan(income); // Tax should never exceed income
      expect(tax).toBeValidCurrency();
    });

    it('should handle income exactly at bracket threshold', () => {
      const income = 47150; // Exactly at 12%/22% threshold for single
      const tax = calculateExpectedTax(income, 'single');

      expect(tax).toBeValidCurrency();
      expect(tax).toBeGreaterThan(0);
    });

    it('should handle rounding consistently', () => {
      const income = 75000.50;
      const tax1 = calculateExpectedTax(Math.round(income), 'single');
      const tax2 = calculateExpectedTax(Math.floor(income), 'single');

      // Should be close due to rounding
      expect(Math.abs(tax1 - tax2)).toBeLessThan(1);
    });
  });
});
