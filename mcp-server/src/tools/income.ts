/**
 * Income tools for UsTaxes MCP Server
 * Handles W-2s, 1099s, and other income sources
 */

import {
  IncomeW2,
  Income1099Int,
  Income1099Div,
  State,
  Income1099Type
} from 'ustaxes/core/data'
import { stateManager } from '../state.js'
import { TaxYear, ToolResult } from '../types.js'

export const incomeTools = {
  /**
   * Add W-2 wage income
   */
  ustaxes_add_w2: {
    description: 'Add W-2 wage and tax statement from an employer',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        employer: {
          type: 'object',
          properties: {
            name: { type: 'string', description: 'Employer name' },
            EIN: {
              type: 'string',
              description: 'Employer Identification Number',
              pattern: '^\\d{2}-\\d{7}$'
            },
            address: {
              type: 'object',
              properties: {
                address: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                zip: { type: 'string' }
              },
              required: ['address', 'city', 'state', 'zip']
            }
          },
          required: ['name', 'EIN', 'address']
        },
        occupation: { type: 'string', description: 'Job title/occupation' },
        wages: {
          type: 'number',
          description: 'Box 1: Wages, tips, other compensation'
        },
        federalWithholding: {
          type: 'number',
          description: 'Box 2: Federal income tax withheld'
        },
        socialSecurityWages: {
          type: 'number',
          description: 'Box 3: Social Security wages'
        },
        socialSecurityWithholding: {
          type: 'number',
          description: 'Box 4: Social Security tax withheld'
        },
        medicareWages: {
          type: 'number',
          description: 'Box 5: Medicare wages and tips'
        },
        medicareWithholding: {
          type: 'number',
          description: 'Box 6: Medicare tax withheld'
        },
        stateWages: { type: 'number', description: 'Box 16: State wages' },
        stateWithholding: {
          type: 'number',
          description: 'Box 17: State income tax'
        },
        state: { type: 'string', description: 'Box 15: State (2-letter code)' },
        personRole: {
          type: 'string',
          enum: ['PRIMARY', 'SPOUSE'],
          description: 'Who earned this income'
        }
      },
      required: [
        'year',
        'employer',
        'wages',
        'federalWithholding',
        'socialSecurityWages',
        'socialSecurityWithholding',
        'medicareWages',
        'medicareWithholding',
        'personRole'
      ]
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const w2: IncomeW2 = {
          employer: {
            EIN: args.employer.EIN,
            employerName: args.employer.name,
            address: args.employer.address
          },
          occupation: args.occupation || '',
          state: (args.state || 'MA') as State,
          income: args.wages,
          fedWithholding: args.federalWithholding,
          medicareIncome: args.medicareWages,
          medicareWithholding: args.medicareWithholding,
          ssWages: args.socialSecurityWages,
          ssWithholding: args.socialSecurityWithholding,
          stateWages: args.stateWages || args.wages,
          stateWithholding: args.stateWithholding || 0,
          personRole: args.personRole
        }

        stateManager.addW2(args.year, w2)

        return {
          success: true,
          data: {
            year: args.year,
            employer: args.employer.name,
            wages: args.wages,
            federalWithholding: args.federalWithholding
          },
          message: `W-2 added: ${
            args.employer.name
          } - $${args.wages.toLocaleString()}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add W-2',
          details: error
        }
      }
    }
  },

  /**
   * Add 1099-INT interest income
   */
  ustaxes_add_1099_int: {
    description: 'Add 1099-INT interest income',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        payer: {
          type: 'string',
          description: 'Bank or financial institution name'
        },
        interest: { type: 'number', description: 'Box 1: Interest income' },
        earlyWithdrawalPenalty: {
          type: 'number',
          description: 'Box 2: Early withdrawal penalty (optional)'
        },
        usSavingsBonds: {
          type: 'number',
          description: 'Box 3: Interest on U.S. Savings Bonds (optional)'
        },
        federalWithholding: {
          type: 'number',
          description: 'Box 4: Federal income tax withheld (optional)'
        },
        personRole: { type: 'string', enum: ['PRIMARY', 'SPOUSE'] }
      },
      required: ['year', 'payer', 'interest', 'personRole']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const f1099Int: Income1099Int = {
          payer: args.payer,
          type: Income1099Type.INT,
          form: {
            income: args.interest
          },
          personRole: args.personRole
        }

        stateManager.add1099(args.year, f1099Int)

        return {
          success: true,
          data: {
            year: args.year,
            payer: args.payer,
            interest: args.interest
          },
          message: `1099-INT added: ${
            args.payer
          } - $${args.interest.toLocaleString()}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add 1099-INT',
          details: error
        }
      }
    }
  },

  /**
   * Add 1099-DIV dividend income
   */
  ustaxes_add_1099_div: {
    description: 'Add 1099-DIV dividend income',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        payer: { type: 'string', description: 'Brokerage or company name' },
        ordinaryDividends: {
          type: 'number',
          description: 'Box 1a: Total ordinary dividends'
        },
        qualifiedDividends: {
          type: 'number',
          description: 'Box 1b: Qualified dividends'
        },
        capitalGainDistributions: {
          type: 'number',
          description: 'Box 2a: Total capital gain distributions (optional)'
        },
        federalWithholding: {
          type: 'number',
          description: 'Box 4: Federal income tax withheld (optional)'
        },
        personRole: { type: 'string', enum: ['PRIMARY', 'SPOUSE'] }
      },
      required: ['year', 'payer', 'ordinaryDividends', 'personRole']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const f1099Div: Income1099Div = {
          payer: args.payer,
          type: Income1099Type.DIV,
          form: {
            dividends: args.ordinaryDividends,
            qualifiedDividends: args.qualifiedDividends || 0,
            totalCapitalGainsDistributions: args.capitalGainDistributions || 0
          },
          personRole: args.personRole
        }

        stateManager.add1099(args.year, f1099Div)

        return {
          success: true,
          data: {
            year: args.year,
            payer: args.payer,
            dividends: args.ordinaryDividends
          },
          message: `1099-DIV added: ${
            args.payer
          } - $${args.ordinaryDividends.toLocaleString()}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add 1099-DIV',
          details: error
        }
      }
    }
  },

  /**
   * Remove W-2 by index
   */
  ustaxes_remove_w2: {
    description: 'Remove a W-2 by its index (0-based)',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        index: {
          type: 'number',
          description:
            'Index of W-2 to remove (0 for first, 1 for second, etc.)'
        }
      },
      required: ['year', 'index']
    },
    handler: async (args: {
      year: TaxYear
      index: number
    }): Promise<ToolResult> => {
      try {
        stateManager.removeW2(args.year, args.index)
        return {
          success: true,
          data: { year: args.year, removedIndex: args.index },
          message: `W-2 at index ${args.index} removed`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to remove W-2',
          details: error
        }
      }
    }
  },

  /**
   * Remove 1099 by index
   */
  ustaxes_remove_1099: {
    description: 'Remove a 1099 form by its index',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        index: { type: 'number', description: 'Index of 1099 to remove' }
      },
      required: ['year', 'index']
    },
    handler: async (args: {
      year: TaxYear
      index: number
    }): Promise<ToolResult> => {
      try {
        stateManager.remove1099(args.year, args.index)
        return {
          success: true,
          data: { year: args.year, removedIndex: args.index },
          message: `1099 at index ${args.index} removed`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to remove 1099',
          details: error
        }
      }
    }
  }
}
