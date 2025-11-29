/**
 * Deductions and adjustments tools for UsTaxes MCP Server
 */

import {
  F1098e,
  ItemizedDeductions,
  HealthSavingsAccount,
  Ira
} from 'ustaxes/core/data'
import { stateManager } from '../state.js'
import { TaxYear, ToolResult } from '../types.js'

export const deductionTools = {
  /**
   * Add student loan interest (1098-E)
   */
  ustaxes_add_1098e: {
    description: 'Add Form 1098-E student loan interest paid',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        lender: { type: 'string', description: 'Lender name' },
        interest: { type: 'number', description: 'Student loan interest paid' },
        personRole: { type: 'string', enum: ['PRIMARY', 'SPOUSE'] }
      },
      required: ['year', 'lender', 'interest', 'personRole']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const f1098e: F1098e = {
          lender: args.lender,
          interest: args.interest,
          personRole: args.personRole
        }

        stateManager.add1098e(args.year, f1098e)

        return {
          success: true,
          data: {
            year: args.year,
            lender: args.lender,
            interest: args.interest
          },
          message: `Student loan interest added: ${args.lender} - $${args.interest}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add 1098-E',
          details: error
        }
      }
    }
  },

  /**
   * Set itemized deductions
   */
  ustaxes_set_itemized_deductions: {
    description: 'Set itemized deductions (Schedule A)',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        medicalExpenses: {
          type: 'number',
          description: 'Medical and dental expenses'
        },
        stateAndLocalTaxes: {
          type: 'number',
          description: 'State and local taxes (max $10,000)'
        },
        mortgageInterest: {
          type: 'number',
          description: 'Home mortgage interest'
        },
        charitableDonations: {
          type: 'number',
          description: 'Charitable contributions'
        },
        otherDeductions: {
          type: 'number',
          description: 'Other itemized deductions'
        }
      },
      required: ['year']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const deductions: ItemizedDeductions = {
          medicalAndDental: args.medicalExpenses || 0,
          stateAndLocalTaxes: Math.min(args.stateAndLocalTaxes || 0, 10000), // SALT cap
          mortgageInterest: args.mortgageInterest || 0,
          charitableContributions: args.charitableDonations || 0,
          otherDeductions: args.otherDeductions || 0
        }

        stateManager.setItemizedDeductions(args.year, deductions)

        const total = (Object.values(deductions) as number[]).reduce(
          (sum: number, val: number) => sum + val,
          0
        )

        return {
          success: true,
          data: { year: args.year, totalItemized: total, deductions },
          message: `Itemized deductions set: $${total.toLocaleString()}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to set itemized deductions',
          details: error
        }
      }
    }
  },

  /**
   * Add HSA contribution
   */
  ustaxes_add_hsa: {
    description: 'Add Health Savings Account contribution',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        label: { type: 'string', description: 'HSA account label' },
        contributions: { type: 'number', description: 'Total contributions' },
        distributions: {
          type: 'number',
          description: 'Total distributions (optional)'
        },
        personRole: { type: 'string', enum: ['PRIMARY', 'SPOUSE'] }
      },
      required: ['year', 'label', 'contributions', 'personRole']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const hsa: HealthSavingsAccount = {
          label: args.label,
          contributions: args.contributions,
          distributions: args.distributions || 0,
          personRole: args.personRole
        }

        stateManager.addHSA(args.year, hsa)

        return {
          success: true,
          data: {
            year: args.year,
            label: args.label,
            contributions: args.contributions
          },
          message: `HSA added: ${args.label} - $${args.contributions}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add HSA',
          details: error
        }
      }
    }
  },

  /**
   * Add IRA contribution
   */
  ustaxes_add_ira: {
    description: 'Add Traditional IRA contribution (deductible)',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        label: { type: 'string', description: 'IRA account label' },
        contributions: { type: 'number', description: 'Total contributions' },
        distributions: {
          type: 'number',
          description: 'Total distributions (optional)'
        },
        personRole: { type: 'string', enum: ['PRIMARY', 'SPOUSE'] }
      },
      required: ['year', 'label', 'contributions', 'personRole']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const ira: Ira = {
          label: args.label,
          contributions: args.contributions,
          distributions: args.distributions || 0,
          personRole: args.personRole
        }

        stateManager.addIRA(args.year, ira)

        return {
          success: true,
          data: {
            year: args.year,
            label: args.label,
            contributions: args.contributions
          },
          message: `IRA added: ${args.label} - $${args.contributions}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add IRA',
          details: error
        }
      }
    }
  }
}
