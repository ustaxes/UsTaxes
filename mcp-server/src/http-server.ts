#!/usr/bin/env node
/**
 * UsTaxes MCP HTTP Server
 * HTTP/SSE-based Model Context Protocol server for programmatic tax return preparation
 * Works with any LLM that supports MCP over HTTP
 */

import express, { Request, Response } from 'express'
import cors from 'cors'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  JSONRPCMessage,
  JSONRPCRequest
} from '@modelcontextprotocol/sdk/types.js'
import { personalTools } from './tools/personal.js'
import { incomeTools } from './tools/income.js'
import { deductionTools } from './tools/deductions.js'
import { pdfTools } from './tools/pdf.js'
import { stateManager } from './state.js'

const PORT = process.env.PORT || 3000
const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Combine all tools
const allTools = {
  ...personalTools,
  ...incomeTools,
  ...deductionTools,
  ...pdfTools
}

/**
 * Create MCP server instance
 */
function createMCPServer() {
  const server = new Server(
    {
      name: 'ustaxes-http-server',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  )

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: Object.entries(allTools).map(([name, tool]) => ({
        name,
        description: tool.description,
        inputSchema: tool.inputSchema
      }))
    }
  })

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params

    const tool = allTools[name as keyof typeof allTools]

    if (!tool) {
      return {
        content: [
          {
            type: 'text' as const,
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
            type: 'text' as const,
            text: JSON.stringify(result, null, 2)
          }
        ],
        isError: !result.success
      }
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
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

  // List available resources
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

  // Read resource content
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
              yearState.w2s.reduce(
                (sum: number, w2: any) => sum + w2.income,
                0
              ) +
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

  return server
}

// Store server instances per session
const sessions = new Map<string, Server>()

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'ustaxes-mcp-http-server',
    version: '1.0.0',
    availableTools: Object.keys(allTools).length,
    activeSessions: sessions.size
  })
})

/**
 * Get server information
 */
app.get('/info', (_req: Request, res: Response) => {
  res.json({
    name: 'ustaxes-http-server',
    version: '1.0.0',
    description: 'MCP server for programmatic UsTaxes tax return preparation',
    protocol: 'mcp',
    transport: 'http',
    capabilities: {
      tools: Object.keys(allTools),
      resources: true
    },
    endpoints: {
      health: '/health',
      info: '/info',
      message: '/message',
      sse: '/sse (coming soon)'
    }
  })
})

/**
 * JSON-RPC message endpoint
 * Handles MCP protocol messages via HTTP POST
 */
app.post('/message', async (req: Request, res: Response) => {
  try {
    const sessionId = (req.headers['x-session-id'] as string) || 'default'

    // Get or create server for this session
    let server = sessions.get(sessionId)
    if (!server) {
      server = createMCPServer()
      sessions.set(sessionId, server)
    }

    const message = req.body as JSONRPCRequest

    // Route to appropriate handler based on method
    let result: any

    switch (message.method) {
      case 'tools/list':
        result = await server['_requestHandlers'].get(ListToolsRequestSchema)!(
          message as any
        )
        break

      case 'tools/call':
        result = await server['_requestHandlers'].get(CallToolRequestSchema)!(
          message as any
        )
        break

      case 'resources/list':
        result = await server['_requestHandlers'].get(
          ListResourcesRequestSchema
        )!(message as any)
        break

      case 'resources/read':
        result = await server['_requestHandlers'].get(
          ReadResourceRequestSchema
        )!(message as any)
        break

      default:
        res.status(400).json({
          jsonrpc: '2.0',
          id: message.id,
          error: {
            code: -32601,
            message: `Method not found: ${message.method}`
          }
        })
        return
    }

    res.json({
      jsonrpc: '2.0',
      id: message.id,
      result
    })
  } catch (error) {
    res.status(500).json({
      jsonrpc: '2.0',
      id: (req.body as JSONRPCRequest).id,
      error: {
        code: -32603,
        message: 'Internal error',
        data: error instanceof Error ? error.message : String(error)
      }
    })
  }
})

/**
 * Start the HTTP server
 */
app.listen(PORT, () => {
  console.log(`🚀 UsTaxes MCP HTTP Server running on port ${PORT}`)
  console.log(`📊 Available tools: ${Object.keys(allTools).length}`)
  console.log(`🔧 Endpoints:`)
  console.log(`   - GET  http://localhost:${PORT}/health`)
  console.log(`   - GET  http://localhost:${PORT}/info`)
  console.log(`   - POST http://localhost:${PORT}/message`)
  console.log(`\n✅ Ready to assist with tax return preparation`)
  console.log(`\n💡 Use any LLM that supports MCP over HTTP`)
  console.log(`   Session ID can be specified via X-Session-ID header`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...')
  sessions.clear()
  process.exit(0)
})
