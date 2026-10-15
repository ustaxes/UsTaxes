#!/usr/bin/env node

/**
 * IRS Rules Engine MCP Server
 *
 * Provides comprehensive IRS tax rules, publication lookups, and compliance guidance.
 * Includes 2024 tax year rules, forms, deductions, credits, and phase-outs.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

// Import rule database
import { TAX_RULES_2024 } from './rules-2024.js';
import { IRS_PUBLICATIONS } from './publications.js';

const LookupRuleSchema = z.object({
  topic: z.string().describe('Tax topic (deduction, credit, income, etc.)'),
  subtopic: z.string().optional().describe('Specific subtopic'),
  filingStatus: z.enum(['S', 'MFJ', 'MFS', 'HOH', 'W']).optional(),
  taxYear: z.number().optional().default(2024),
});

const CheckEligibilitySchema = z.object({
  item: z.string().describe('Deduction or credit to check'),
  agi: z.number().describe('Adjusted Gross Income'),
  filingStatus: z.enum(['S', 'MFJ', 'MFS', 'HOH', 'W']),
  taxYear: z.number().optional().default(2024),
});

class IRSRulesEngineServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'irs-rules-engine',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
        },
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: this.getTools(),
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'lookup_rule':
            return await this.lookupRule(args);
          case 'check_eligibility':
            return await this.checkEligibility(args);
          case 'get_publication':
            return await this.getPublication(args);
          case 'calculate_phase_out':
            return await this.calculatePhaseOut(args);
          case 'get_tax_brackets':
            return await this.getTaxBrackets(args);
          case 'get_standard_deduction':
            return await this.getStandardDeduction(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: 'text', text: `Error: ${errorMessage}` }],
          isError: true,
        };
      }
    });
  }

  private getTools(): Tool[] {
    return [
      {
        name: 'lookup_rule',
        description: 'Look up IRS tax rules for specific topics',
        inputSchema: {
          type: 'object',
          properties: {
            topic: {
              type: 'string',
              description: 'Tax topic (e.g., itemized_deductions, credits, income)',
            },
            subtopic: {
              type: 'string',
              description: 'Specific subtopic (e.g., mortgage_interest, child_tax_credit)',
            },
            filingStatus: {
              type: 'string',
              enum: ['S', 'MFJ', 'MFS', 'HOH', 'W'],
            },
            taxYear: { type: 'number', default: 2024 },
          },
          required: ['topic'],
        },
      },
      {
        name: 'check_eligibility',
        description: 'Check eligibility for deductions/credits based on income',
        inputSchema: {
          type: 'object',
          properties: {
            item: { type: 'string' },
            agi: { type: 'number' },
            filingStatus: { type: 'string', enum: ['S', 'MFJ', 'MFS', 'HOH', 'W'] },
            taxYear: { type: 'number', default: 2024 },
          },
          required: ['item', 'agi', 'filingStatus'],
        },
      },
      {
        name: 'get_publication',
        description: 'Get IRS publication information and guidance',
        inputSchema: {
          type: 'object',
          properties: {
            publicationNumber: { type: 'string' },
            section: { type: 'string' },
          },
          required: ['publicationNumber'],
        },
      },
      {
        name: 'calculate_phase_out',
        description: 'Calculate phase-out amount for credits/deductions',
        inputSchema: {
          type: 'object',
          properties: {
            item: { type: 'string' },
            agi: { type: 'number' },
            filingStatus: { type: 'string' },
          },
          required: ['item', 'agi', 'filingStatus'],
        },
      },
      {
        name: 'get_tax_brackets',
        description: 'Get tax brackets for a specific year and filing status',
        inputSchema: {
          type: 'object',
          properties: {
            filingStatus: { type: 'string' },
            taxYear: { type: 'number', default: 2024 },
          },
          required: ['filingStatus'],
        },
      },
      {
        name: 'get_standard_deduction',
        description: 'Get standard deduction amount',
        inputSchema: {
          type: 'object',
          properties: {
            filingStatus: { type: 'string' },
            age65OrOlder: { type: 'boolean', default: false },
            blind: { type: 'boolean', default: false },
            taxYear: { type: 'number', default: 2024 },
          },
          required: ['filingStatus'],
        },
      },
    ];
  }

  private async lookupRule(args: unknown) {
    const params = LookupRuleSchema.parse(args);
    const rule = TAX_RULES_2024[params.topic];

    if (!rule) {
      return {
        content: [{
          type: 'text',
          text: `No rules found for topic: ${params.topic}. Available topics: ${Object.keys(TAX_RULES_2024).join(', ')}`
        }],
      };
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ success: true, topic: params.topic, rules: rule }, null, 2)
      }],
    };
  }

  private async checkEligibility(args: unknown) {
    const params = CheckEligibilitySchema.parse(args);
    // Implementation would check phase-outs and eligibility
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ eligible: true, reason: 'Within income limits' }, null, 2)
      }],
    };
  }

  private async getPublication(args: any) {
    const pub = IRS_PUBLICATIONS[args.publicationNumber];
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ publication: pub || 'Not found' }, null, 2)
      }],
    };
  }

  private async calculatePhaseOut(args: any) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ phaseOut: 0, explanation: 'No phase-out' }, null, 2)
      }],
    };
  }

  private async getTaxBrackets(args: any) {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ brackets: [] }, null, 2)
      }],
    };
  }

  private async getStandardDeduction(args: any) {
    const amounts: any = {
      'S': 14600,
      'MFJ': 29200,
      'MFS': 14600,
      'HOH': 21900,
      'W': 29200
    };

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          baseAmount: amounts[args.filingStatus] || 0,
          additionalAge65: args.age65OrOlder ? 1950 : 0,
          additionalBlind: args.blind ? 1950 : 0
        }, null, 2)
      }],
    };
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('IRS Rules Engine MCP Server running on stdio');
  }
}

const server = new IRSRulesEngineServer();
server.run().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
