# UsTaxes MCP Server

**Model Context Protocol (MCP) server for programmatic tax return preparation using UsTaxes.**

Works with any LLM or AI agent that supports MCP over HTTP or stdio.

## Overview

This MCP server provides programmatic access to the UsTaxes tax preparation engine, allowing AI agents and automation tools to:

- Build complete federal and state tax returns
- Validate tax data against IRS rules
- Generate PDF tax forms
- Calculate tax liability
- Query return state and calculations

## Architecture

```
UsTaxes MCP Server
├── State Management (Redux-compatible)
├── Tools (40+ tax preparation actions)
│   ├── Personal Information
│   ├── Income (W-2, 1099, etc.)
│   ├── Deductions & Adjustments
│   ├── Tax Credits
│   ├── PDF Generation
│   └── Validation & Calculation
└── Resources (return state queries)
```

## Quick Start

### Option 1: HTTP Server (Recommended for LLM Integration)

Run the HTTP-based MCP server that any LLM can connect to:

```bash
# Install dependencies
npm install

# Start HTTP server
npm run start:http

# Server runs on http://localhost:3000
```

The HTTP server provides:

- `GET /health` - Health check endpoint
- `GET /info` - Server information and capabilities
- `POST /message` - MCP JSON-RPC message endpoint

### Option 2: Docker

```bash
# Build and run with Docker
docker compose up -d

# Or build manually
docker build -t ustaxes-mcp .
docker run -p 3000:3000 ustaxes-mcp
```

### Option 3: Stdio (for local MCP clients)

```bash
# Start stdio server
npm start
```

## HTTP API Usage

### Health Check

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "service": "ustaxes-mcp-http-server",
  "version": "1.0.0",
  "availableTools": 25,
  "activeSessions": 1
}
```

### Server Information

```bash
curl http://localhost:3000/info
```

Response:

```json
{
  "name": "ustaxes-http-server",
  "version": "1.0.0",
  "description": "MCP server for programmatic UsTaxes tax return preparation",
  "protocol": "mcp",
  "transport": "http",
  "capabilities": {
    "tools": ["ustaxes_set_filing_status", "ustaxes_add_w2", ...],
    "resources": true
  }
}
```

### Call MCP Tools

Send JSON-RPC 2.0 messages to `/message`:

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: my-session-123" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/list",
    "params": {}
  }'
```

```bash
curl -X POST http://localhost:3000/message \
  -H "Content-Type: application/json" \
  -H "X-Session-ID: my-session-123" \
  -d '{
    "jsonrpc": "2.0",
    "id": 2,
    "method": "tools/call",
    "params": {
      "name": "ustaxes_set_filing_status",
      "arguments": {
        "year": 2024,
        "status": "S"
      }
    }
  }'
```

### Session Management

Use the `X-Session-ID` header to maintain separate tax return states:

```bash
# Session 1 - Client A's tax return
curl -H "X-Session-ID: client-a" ...

# Session 2 - Client B's tax return
curl -H "X-Session-ID: client-b" ...
```

## Configuration for MCP Clients

### Claude Desktop / Claude Code

**stdio transport (local):**

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/path/to/UsTaxes/mcp-server/src/index.ts"
      ]
    }
  }
}
```

**HTTP transport:**

```json
{
  "mcpServers": {
    "ustaxes": {
      "url": "http://localhost:3000",
      "transport": "http"
    }
  }
}
```

### Custom LLM Integration

Any LLM can integrate by:

1. Sending JSON-RPC 2.0 messages to `POST /message`
2. Using `tools/list` to discover available tools
3. Using `tools/call` to execute tax preparation actions
4. Using `resources/list` and `resources/read` to query return state

See [Integration Guide](docs/INTEGRATION.md) for detailed examples.

## Tools Available

#### Personal Information

- `ustaxes_set_filing_status` - Set filing status (Single, MFJ, MFS, HOH, W)
- `ustaxes_add_primary_person` - Add primary taxpayer information
- `ustaxes_add_spouse` - Add spouse information
- `ustaxes_add_dependent` - Add dependent

#### Income

- `ustaxes_add_w2` - Add W-2 wage income
- `ustaxes_add_1099_int` - Add 1099-INT interest income
- `ustaxes_add_1099_div` - Add 1099-DIV dividend income
- `ustaxes_add_1099_b` - Add 1099-B brokerage transactions
- `ustaxes_add_1099_r` - Add 1099-R retirement distributions
- `ustaxes_add_property` - Add rental property income

#### Deductions & Adjustments

- `ustaxes_set_itemized_deductions` - Set itemized deductions
- `ustaxes_add_1098` - Add mortgage interest (1098)
- `ustaxes_add_1098e` - Add student loan interest (1098-E)
- `ustaxes_add_hsa` - Add HSA contributions
- `ustaxes_add_ira` - Add IRA contributions

#### Credits

- `ustaxes_add_dependent_care_expenses` - Add dependent care expenses
- `ustaxes_add_education_expenses` - Add education expenses

#### PDF Generation

- `ustaxes_generate_federal_pdf` - Generate federal Form 1040 PDF
- `ustaxes_generate_state_pdf` - Generate state return PDF
- `ustaxes_generate_all_pdfs` - Generate all PDFs (federal + state)

#### Validation & Calculation

- `ustaxes_validate_return` - Validate return for completeness and accuracy
- `ustaxes_calculate_tax` - Calculate total tax liability
- `ustaxes_get_refund_or_owe` - Get refund or amount owed

#### State Management

- `ustaxes_get_state` - Get complete return state
- `ustaxes_reset_state` - Reset to empty return
- `ustaxes_load_state` - Load saved return state

### Resources

- `return://[year]/federal` - Federal return summary
- `return://[year]/state` - State return summary
- `return://[year]/summary` - Complete tax summary

## Example: Complete Tax Return via HTTP

```javascript
const BASE_URL = 'http://localhost:3000/message'
const SESSION_ID = 'client-session-123'

async function mcpCall(method, params) {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': SESSION_ID
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Math.random(),
      method,
      params
    })
  })
  return response.json()
}

// 1. Set filing status
await mcpCall('tools/call', {
  name: 'ustaxes_set_filing_status',
  arguments: { year: 2024, status: 'S' }
})

// 2. Add primary taxpayer
await mcpCall('tools/call', {
  name: 'ustaxes_add_primary_person',
  arguments: {
    year: 2024,
    firstName: 'John',
    lastName: 'Doe',
    ssn: '123-45-6789',
    dateOfBirth: '1980-01-15',
    address: {
      address: '123 Main St',
      city: 'Boston',
      state: 'MA',
      zip: '02101'
    }
  }
})

// 3. Add W-2 income
await mcpCall('tools/call', {
  name: 'ustaxes_add_w2',
  arguments: {
    year: 2024,
    personRole: 'PRIMARY',
    employer: {
      name: 'Tech Corp',
      EIN: '12-3456789',
      address: {
        address: '456 Corporate Dr',
        city: 'Boston',
        state: 'MA',
        zip: '02102'
      }
    },
    occupation: 'Software Engineer',
    wages: 85000,
    federalWithholding: 12000,
    socialSecurityWages: 85000,
    socialSecurityWithholding: 5270,
    medicareWages: 85000,
    medicareWithholding: 1233,
    stateWages: 85000,
    stateWithholding: 4250
  }
})

// 4. Generate PDFs
await mcpCall('tools/call', {
  name: 'ustaxes_generate_all_pdfs',
  arguments: {
    year: 2024,
    outputDir: '/tmp/tax-returns-2024'
  }
})
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage

- Unit tests for all 40+ tools
- Integration tests with real tax scenarios
- Edge case testing
- IRS rule validation tests

## Development

```bash
# Watch mode during development (stdio)
npm run dev

# Watch mode during development (HTTP)
npm run dev:http

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## Security

- **No authentication by default** - Deploy behind a reverse proxy with auth for production
- SSNs and EINs are never logged
- All PII is handled securely
- State is stored in-memory only (not persisted by default)
- PDF generation uses sandboxed environment
- Use `X-Session-ID` header to isolate client sessions

### Production Deployment

For production use, deploy behind nginx or another reverse proxy with:

- TLS/HTTPS encryption
- Authentication (OAuth, API keys, etc.)
- Rate limiting
- IP whitelisting

## Environment Variables

- `PORT` - HTTP server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## Limitations

- Tax years supported: 2019-2024
- Federal forms: All major forms and schedules
- State forms: Currently MA (more states coming)
- Does NOT provide tax advice
- Does NOT guarantee audit protection
- User responsible for accuracy of filed returns

## Documentation

- [API Reference](docs/API_REFERENCE.md) - Complete tool documentation
- [Examples](docs/EXAMPLES.md) - Practical usage examples
- [Integration Guide](docs/INTEGRATION.md) - LLM integration patterns

## License

GPL-3.0 (same as UsTaxes)

## Contributing

See main UsTaxes repository for contribution guidelines.
