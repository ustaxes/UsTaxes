/**
 * Personal information tools for UsTaxes MCP Server
 */

import {
  FilingStatus,
  PrimaryPerson,
  Spouse,
  Dependent,
  PersonRole
} from 'ustaxes/core/data'
import { stateManager } from '../state.js'
import { TaxYear, ToolResult } from '../types.js'

export const personalTools = {
  /**
   * Set filing status
   */
  ustaxes_set_filing_status: {
    description:
      'Set tax filing status (Single, Married Filing Jointly, Married Filing Separately, Head of Household, or Qualifying Widow(er))',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Tax year (2019-2024)',
          enum: [2019, 2020, 2021, 2022, 2023, 2024]
        },
        status: {
          type: 'string',
          description: 'Filing status',
          enum: ['S', 'MFJ', 'MFS', 'HOH', 'W']
        }
      },
      required: ['year', 'status']
    },
    handler: async (args: {
      year: TaxYear
      status: FilingStatus
    }): Promise<ToolResult> => {
      try {
        stateManager.setFilingStatus(args.year, args.status)
        return {
          success: true,
          data: { year: args.year, status: args.status },
          message: `Filing status set to ${args.status} for ${args.year}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to set filing status',
          details: error
        }
      }
    }
  },

  /**
   * Add or update primary taxpayer
   */
  ustaxes_add_primary_person: {
    description: 'Add or update primary taxpayer information',
    inputSchema: {
      type: 'object',
      properties: {
        year: {
          type: 'number',
          description: 'Tax year',
          enum: [2019, 2020, 2021, 2022, 2023, 2024]
        },
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        ssn: {
          type: 'string',
          description: 'Social Security Number (XXX-XX-XXXX)',
          pattern: '^\\d{3}-\\d{2}-\\d{4}$'
        },
        dateOfBirth: {
          type: 'string',
          description: 'Date of birth (YYYY-MM-DD)',
          format: 'date'
        },
        address: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            aptNo: { type: 'string' },
            city: { type: 'string' },
            state: { type: 'string' },
            zip: { type: 'string' },
            province: { type: 'string' },
            country: { type: 'string' },
            foreignPostalCode: { type: 'string' }
          },
          required: ['address', 'city', 'zip']
        }
      },
      required: [
        'year',
        'firstName',
        'lastName',
        'ssn',
        'dateOfBirth',
        'address'
      ]
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const person: PrimaryPerson = {
          firstName: args.firstName,
          lastName: args.lastName,
          ssid: args.ssn,
          dateOfBirth: new Date(args.dateOfBirth),
          address: {
            address: args.address.address,
            aptNo: args.address.aptNo,
            city: args.address.city,
            state: args.address.state,
            zip: args.address.zip,
            province: args.address.province,
            foreignCountry: args.address.country || 'USA',
            postalCode: args.address.foreignPostalCode
          },
          role: PersonRole.PRIMARY,
          isTaxpayerDependent: false,
          isBlind: false
        }

        stateManager.setPrimaryPerson(args.year, person)

        return {
          success: true,
          data: { year: args.year, name: `${args.firstName} ${args.lastName}` },
          message: `Primary taxpayer added: ${args.firstName} ${args.lastName}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add primary taxpayer',
          details: error
        }
      }
    }
  },

  /**
   * Add or update spouse
   */
  ustaxes_add_spouse: {
    description:
      'Add or update spouse information (for Married Filing Jointly)',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        ssn: { type: 'string', pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
        dateOfBirth: { type: 'string', format: 'date' }
      },
      required: ['year', 'firstName', 'lastName', 'ssn', 'dateOfBirth']
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const spouse: Spouse = {
          firstName: args.firstName,
          lastName: args.lastName,
          ssid: args.ssn,
          dateOfBirth: new Date(args.dateOfBirth),
          role: PersonRole.SPOUSE,
          isTaxpayerDependent: false,
          isBlind: false
        }

        stateManager.setSpouse(args.year, spouse)

        return {
          success: true,
          data: { year: args.year, name: `${args.firstName} ${args.lastName}` },
          message: `Spouse added: ${args.firstName} ${args.lastName}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add spouse',
          details: error
        }
      }
    }
  },

  /**
   * Add dependent
   */
  ustaxes_add_dependent: {
    description: 'Add a dependent (child or qualifying relative)',
    inputSchema: {
      type: 'object',
      properties: {
        year: { type: 'number', enum: [2019, 2020, 2021, 2022, 2023, 2024] },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        ssn: { type: 'string', pattern: '^\\d{3}-\\d{2}-\\d{4}$' },
        dateOfBirth: { type: 'string', format: 'date' },
        relationship: {
          type: 'string',
          enum: [
            'SON',
            'DAUGHTER',
            'STEPCHILD',
            'FOSTER_CHILD',
            'SIBLING',
            'PARENT',
            'OTHER'
          ],
          description: 'Relationship to taxpayer'
        },
        months: {
          type: 'number',
          description: 'Number of months lived with you in the tax year',
          minimum: 0,
          maximum: 12
        }
      },
      required: [
        'year',
        'firstName',
        'lastName',
        'ssn',
        'dateOfBirth',
        'relationship',
        'months'
      ]
    },
    handler: async (args: any): Promise<ToolResult> => {
      try {
        const dependent: Dependent = {
          firstName: args.firstName,
          lastName: args.lastName,
          ssid: args.ssn,
          dateOfBirth: new Date(args.dateOfBirth),
          role: PersonRole.DEPENDENT,
          isBlind: false,
          relationship: args.relationship,
          qualifyingInfo: {
            numberOfMonths: args.months,
            isStudent: false // Can be enhanced with additional parameter
          }
        }

        stateManager.addDependent(args.year, dependent)

        return {
          success: true,
          data: { year: args.year, name: `${args.firstName} ${args.lastName}` },
          message: `Dependent added: ${args.firstName} ${args.lastName}`
        }
      } catch (error) {
        return {
          success: false,
          error: 'Failed to add dependent',
          details: error
        }
      }
    }
  }
}
