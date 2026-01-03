import { FilingStatus, PersonRole } from 'ustaxes/core/data'
import { computeFederalReturn } from './computeFederalReturn'
import { TaxReturnPacket } from 'ustaxes/core/returnPacket/types'

const basePacket = (overrides: Partial<TaxReturnPacket>): TaxReturnPacket => ({
  returnInfo: {
    id: 'test-return',
    taxYear: 'Y2025',
    state: 'OH',
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    totals: {}
  },
  filingStatus: FilingStatus.S,
  taxpayer: {
    firstName: 'Test',
    lastName: 'User',
    ssid: '123456789',
    dateOfBirth: new Date('1990-01-01')
  },
  spouse: undefined,
  dependents: [],
  incomes: [],
  scheduleC: [],
  estimatedPayments: 0,
  deductionsCredits: {},
  documents: [],
  auditLog: [],
  ...overrides
})

describe('computeFederalReturn 2025', () => {
  it('computes a W-2 only single return', () => {
    const packet = basePacket({
      filingStatus: FilingStatus.S,
      incomes: [
        {
          type: 'W2',
          payerName: 'Northwind',
          amount: 80000,
          federalWithholding: 10000,
          personRole: PersonRole.PRIMARY
        }
      ]
    })

    const result = computeFederalReturn(packet)

    expect(result.adjustedGrossIncome).toBe(80000)
    expect(result.taxableIncome).toBe(64250)
    expect(result.federalTax).toBe(9049)
    expect(result.credits).toBe(0)
    expect(result.payments).toBe(10000)
    expect(result.refundAmount).toBe(951)
    expect(result.amountOwed).toBe(0)
  })

  it('computes MFJ return with two child tax credits', () => {
    const packet = basePacket({
      filingStatus: FilingStatus.MFJ,
      dependents: [
        {
          firstName: 'Avery',
          lastName: 'User',
          ssid: '123456780',
          relationship: 'Child',
          dateOfBirth: new Date('2016-04-12')
        },
        {
          firstName: 'Logan',
          lastName: 'User',
          ssid: '123456781',
          relationship: 'Child',
          dateOfBirth: new Date('2019-09-20')
        }
      ],
      incomes: [
        {
          type: 'W2',
          payerName: 'Keystone',
          amount: 140000,
          federalWithholding: 12000,
          personRole: PersonRole.PRIMARY
        }
      ]
    })

    const result = computeFederalReturn(packet)

    expect(result.adjustedGrossIncome).toBe(140000)
    expect(result.taxableIncome).toBe(108500)
    expect(result.federalTax).toBe(9698)
    expect(result.credits).toBe(4000)
    expect(result.payments).toBe(12000)
    expect(result.refundAmount).toBe(2302)
    expect(result.amountOwed).toBe(0)
  })

  it('computes Schedule C + 1099-NEC with self-employment tax', () => {
    const packet = basePacket({
      filingStatus: FilingStatus.S,
      incomes: [
        {
          type: '1099-NEC',
          payerName: 'Summit Design',
          amount: 40000,
          federalWithholding: 1000,
          personRole: PersonRole.PRIMARY
        }
      ],
      scheduleC: [
        {
          businessName: 'Design Studio',
          grossReceipts: 60000,
          expenses: 20000
        }
      ],
      estimatedPayments: 2000
    })

    const result = computeFederalReturn(packet)

    expect(result.adjustedGrossIncome).toBe(74348)
    expect(result.taxableIncome).toBe(58598)
    expect(result.selfEmploymentTax).toBe(11304)
    expect(result.federalTax).toBe(19110)
    expect(result.payments).toBe(3000)
    expect(result.refundAmount).toBe(0)
    expect(result.amountOwed).toBe(16110)
  })

  it('caps social security portion of self-employment tax at the wage base', () => {
    const packet = basePacket({
      filingStatus: FilingStatus.S,
      incomes: [
        {
          type: 'W2',
          payerName: 'Enterprise',
          amount: 180000,
          federalWithholding: 25000,
          personRole: PersonRole.PRIMARY
        }
      ],
      scheduleC: [
        {
          businessName: 'Consulting',
          grossReceipts: 25000,
          expenses: 5000
        }
      ]
    })

    const result = computeFederalReturn(packet)

    expect(result.selfEmploymentTax).toBe(536)
  })
})
