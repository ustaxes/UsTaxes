#!/usr/bin/env node
/**
 * UsTaxes MCP Server
 * Model Context Protocol server for programmatic tax return preparation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js'
import { personalTools } from './tools/personal.js'
import { incomeTools } from './tools/income.js'
import { deductionTools } from './tools/deductions.js'
import { pdfTools } from './tools/pdf.js'
import { stateManager } from './state.js'

/**
 * Create and configure the MCP server
 */
const server = new Server(
  {
    name: 'ustaxes-server',
    version: '1.0.0'
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    }
  }
)

// Combine all tools
const allTools = {
  ...personalTools,
  ...incomeTools,
  ...deductionTools,
  ...pdfTools
}

/**
 * List available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: Object.entries(allTools).map(([name, tool]) => ({
      name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }))
  }
})

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params

  const tool = allTools[name as keyof typeof allTools]

  if (!tool) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: `Unknown tool: ${name}`
          })
        }
      ],
      isError: true
    }
  }

  try {
    const result = await tool.handler(args as any)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ],
      isError: !result.success
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              success: false,
              error: 'Tool execution failed',
              details: error instanceof Error ? error.message : String(error)
            },
            null,
            2
          )
        }
      ],
      isError: true
    }
  }
})

/**
 * List available resources
 */
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const currentState = stateManager.getState()
  const years = Object.keys(currentState)
    .filter((k) => k !== 'activeYear')
    .map(Number)

  const resources = years.flatMap((year) => [
    {
      uri: `return://${year}/federal`,
      name: `${year} Federal Return`,
      description: `Federal tax return summary for ${year}`,
      mimeType: 'application/json'
    },
    {
      uri: `return://${year}/state`,
      name: `${year} State Return`,
      description: `State tax return summary for ${year}`,
      mimeType: 'application/json'
    },
    {
      uri: `return://${year}/summary`,
      name: `${year} Complete Summary`,
      description: `Complete tax summary for ${year}`,
      mimeType: 'application/json'
    }
  ])

  return { resources }
})

/**
 * Read resource content
 */
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params

  // Parse URI: return://YEAR/TYPE
  const match = uri.match(/^return:\/\/(\d{4})\/(federal|state|summary)$/)

  if (!match) {
    throw new Error(`Invalid resource URI: ${uri}`)
  }

  const [, yearStr, type] = match
  const year = parseInt(yearStr) as any
  const yearState = stateManager.getYearState(year)

  let content: any

  switch (type) {
    case 'federal':
      content = {
        year,
        taxpayer: {
          name: yearState.taxPayer.primaryPerson
            ? `${yearState.taxPayer.primaryPerson.firstName} ${yearState.taxPayer.primaryPerson.lastName}`
            : 'Not set',
          filingStatus: yearState.taxPayer.filingStatus || 'Not set'
        },
        income: {
          w2Count: yearState.w2s.length,
          totalW2Wages: yearState.w2s.reduce(
            (sum: number, w2: any) => sum + w2.income,
            0
          ),
          f1099Count: yearState.f1099s.length
        },
        deductions: {
          hasItemized: !!yearState.itemizedDeductions,
          studentLoanInterest: yearState.f1098es.length,
          hsaContributions: yearState.healthSavingsAccounts.length,
          iraContributions: yearState.individualRetirementArrangements.length
        },
        dependents: yearState.taxPayer.dependents.length
      }
      break

    case 'state':
      const stateCode = yearState.taxPayer.primaryPerson?.address?.state
      content = {
        year,
        state: stateCode || 'Not set',
        stateWithholding: yearState.w2s.reduce(
          (sum: number, w2: any) => sum + w2.stateWithholding,
          0
        )
      }
      break

    case 'summary':
      content = {
        year,
        complete: yearState,
        statistics: {
          totalW2s: yearState.w2s.length,
          total1099s: yearState.f1099s.length,
          totalDependents: yearState.taxPayer.dependents.length,
          hasSpouse: !!yearState.taxPayer.spouse,
          totalIncome:
            yearState.w2s.reduce((sum: number, w2: any) => sum + w2.income, 0) +
            yearState.f1099s.reduce(
              (sum: number, f: any) => sum + (f.income || 0),
              0
            )
        }
      }
      break
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(content, null, 2)
      }
    ]
  }
})

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport()
  await server.connect(transport)

  // Log to stderr (stdout is used for MCP protocol)
  console.error('UsTaxes MCP Server running on stdio')
  console.error('Available tools:', Object.keys(allTools).length)
  console.error('Ready to assist with tax return preparation')
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
