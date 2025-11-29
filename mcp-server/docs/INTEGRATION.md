# UsTaxes MCP Server - Integration Guide

How to integrate the UsTaxes MCP Server with Claude Code, Claude Desktop, and other MCP clients.

## Table of Contents

- [Claude Code Integration](#claude-code-integration)
- [Claude Desktop Integration](#claude-desktop-integration)
- [Custom MCP Client Integration](#custom-mcp-client-integration)
- [Troubleshooting](#troubleshooting)
- [Configuration Options](#configuration-options)

---

## Claude Code Integration

### Prerequisites

- Node.js 18+ installed
- Claude Code CLI installed
- UsTaxes repository cloned

### Step 1: Install Dependencies

```bash
cd /path/to/UsTaxes/.claude/mcp-servers/ustaxes-server
npm install
```

### Step 2: Configure Claude Code

Edit `.claude/settings.json` in your UsTaxes project root:

```json
{
  "mcp": {
    "ustaxes": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/absolute/path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts"
      ]
    }
  }
}
```

**Important:** Use absolute paths, not relative paths.

### Step 3: Restart Claude Code

```bash
# Exit current Claude Code session
exit

# Start new session
claude
```

### Step 4: Verify Integration

In Claude Code, the ustaxes MCP server should now be available. You can check available MCP servers:

```typescript
// In conversation with Claude Code
'List available MCP servers'

// Response should include "ustaxes"
```

### Step 5: Test Basic Tool

```typescript
// Ask Claude Code to test the MCP server
'Use the ustaxes MCP server to set filing status to Single for 2024'

// Claude will call:
await callTool('ustaxes_set_filing_status', {
  year: 2024,
  status: 'S'
})
```

### Example Project Structure

```
UsTaxes/
├── .claude/
│   ├── settings.json           ← Configure MCP here
│   ├── commands/
│   │   ├── prepare-return.md
│   │   └── validate-return.md
│   ├── agents/
│   │   ├── form-filler.md
│   │   └── question-asker.md
│   └── mcp-servers/
│       └── ustaxes-server/
│           ├── src/
│           │   └── index.ts    ← MCP server entry point
│           ├── package.json
│           └── README.md
└── src/                        ← UsTaxes application code
```

### Using with Slash Commands

Create `.claude/commands/prepare-return.md`:

```markdown
---
name: prepare-return
description: 'Interactive tax return preparation workflow'
args:
  - name: year
    description: 'Tax year (default: 2024)'
    required: false
---

# Prepare Tax Return

Use the UsTaxes MCP server to prepare a complete tax return.

1. Set filing status using `ustaxes_set_filing_status`
2. Add taxpayer information using `ustaxes_add_primary_person`
3. Add income via `ustaxes_add_w2`, `ustaxes_add_1099_*`, etc.
4. Add deductions via `ustaxes_add_ira`, `ustaxes_add_hsa`, etc.
5. Generate PDFs using `ustaxes_generate_all_pdfs`

Ask me questions to gather the information needed.
```

Then use it:

```bash
/prepare-return 2024
```

---

## Claude Desktop Integration

### Prerequisites

- Claude Desktop app installed
- Node.js 18+ installed

### Step 1: Locate Claude Desktop Config

**macOS:**

```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**

```
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**

```bash
~/.config/Claude/claude_desktop_config.json
```

### Step 2: Add MCP Server Configuration

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "npx",
      "args": [
        "-y",
        "tsx",
        "/absolute/path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts"
      ],
      "env": {}
    }
  }
}
```

### Step 3: Restart Claude Desktop

Completely quit and restart the Claude Desktop app.

### Step 4: Verify Integration

In a new conversation:

```
You: "List the available MCP servers"

Claude: "I have access to the following MCP server:
- ustaxes: UsTaxes MCP Server for tax return preparation"
```

### Step 5: Use the Server

```
You: "Help me prepare my 2024 tax return using the ustaxes MCP server"

Claude will:
1. Set filing status
2. Ask for taxpayer information
3. Add income sources
4. Add deductions
5. Generate PDFs
```

---

## Custom MCP Client Integration

### Using the MCP SDK Directly

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { spawn } from 'child_process'

// Create MCP client
const client = new Client(
  {
    name: 'my-tax-app',
    version: '1.0.0'
  },
  {
    capabilities: {}
  }
)

// Start the UsTaxes MCP server process
const serverProcess = spawn('npx', [
  '-y',
  'tsx',
  '/path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts'
])

// Connect via stdio
const transport = new StdioClientTransport({
  command: serverProcess.stdout,
  stdin: serverProcess.stdin
})

await client.connect(transport)

// List available tools
const toolsResponse = await client.request(
  {
    method: 'tools/list'
  },
  ListToolsRequestSchema
)

console.log('Available tools:', toolsResponse.tools)

// Call a tool
const result = await client.request(
  {
    method: 'tools/call',
    params: {
      name: 'ustaxes_set_filing_status',
      arguments: {
        year: 2024,
        status: 'MFJ'
      }
    }
  },
  CallToolRequestSchema
)

console.log('Result:', result)

// Read a resource
const resource = await client.request(
  {
    method: 'resources/read',
    params: {
      uri: 'return://2024/federal'
    }
  },
  ReadResourceRequestSchema
)

console.log('Federal return:', resource)

// Cleanup
client.close()
serverProcess.kill()
```

### Using with Other MCP Clients

The UsTaxes MCP server follows the standard MCP protocol and can be used with any MCP-compatible client:

- **Cline** (VS Code extension)
- **Zed** (with MCP support)
- **Custom automation tools**

Configuration is similar - provide the command and args to start the server.

---

## Troubleshooting

### Server Not Showing Up

**Check 1: Verify Node.js version**

```bash
node --version
# Should be 18.0.0 or higher
```

**Check 2: Verify tsx is available**

```bash
npx tsx --version
```

**Check 3: Check absolute paths**

```bash
# Path must be absolute, not relative
# ❌ Wrong:
"args": ["tsx", "./src/index.ts"]

# ✅ Correct:
"args": ["tsx", "/home/user/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts"]
```

**Check 4: Verify file exists**

```bash
ls -la /path/to/UsTaxes/.claude/mcp-servers/ustaxes-server/src/index.ts
```

### Server Crashes on Startup

**Check 1: View logs (Claude Code)**

```bash
# Check stderr output
tail -f ~/.claude/logs/mcp-*.log
```

**Check 2: Test server manually**

```bash
cd /path/to/UsTaxes/.claude/mcp-servers/ustaxes-server
npx tsx src/index.ts

# Should output:
# UsTaxes MCP Server running on stdio
# Available tools: 25
# Ready to assist with tax return preparation
```

**Check 3: Check dependencies**

```bash
cd /path/to/UsTaxes/.claude/mcp-servers/ustaxes-server
npm install
```

### Tool Calls Failing

**Check 1: Verify tool exists**

```typescript
// List available tools first
const tools = await listTools()
console.log(tools.map((t) => t.name))
```

**Check 2: Check parameter types**

```typescript
// ❌ Wrong: year as string
{
  year: "2024",
  status: "MFJ"
}

// ✅ Correct: year as number
{
  year: 2024,
  status: "MFJ"
}
```

**Check 3: Check SSN format**

```typescript
// ❌ Wrong
ssn: '123456789'

// ✅ Correct
ssn: '123-45-6789'
```

### PDF Generation Fails

**Check 1: Verify output directory exists**

```bash
mkdir -p /tmp/tax-returns
```

**Check 2: Check file permissions**

```bash
touch /tmp/test-return.pdf
# Should succeed without errors
```

**Check 3: Check return completeness**

```typescript
// Export state to verify data
await callTool('ustaxes_export_state', {
  year: 2024,
  outputPath: '/tmp/state-check.json'
})

// Check for required fields:
// - Filing status
// - Primary person
// - At least one income source
```

---

## Configuration Options

### Environment Variables

The MCP server supports optional environment variables:

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "npx",
      "args": [...],
      "env": {
        "LOG_LEVEL": "debug",        // debug, info, warn, error
        "MAX_PDF_SIZE_MB": "50",     // Maximum PDF file size
        "TEMP_DIR": "/custom/temp"   // Custom temp directory
      }
    }
  }
}
```

### Server Timeouts

For large returns that take time to generate PDFs:

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "npx",
      "args": [...],
      "timeout": 300000  // 5 minutes (in milliseconds)
    }
  }
}
```

### Multiple Tax Years

You can run separate MCP server instances for different years:

```json
{
  "mcpServers": {
    "ustaxes-2024": {
      "command": "npx",
      "args": ["tsx", "/path/to/ustaxes-server/src/index.ts"],
      "env": {
        "DEFAULT_YEAR": "2024"
      }
    },
    "ustaxes-2023": {
      "command": "npx",
      "args": ["tsx", "/path/to/ustaxes-server/src/index.ts"],
      "env": {
        "DEFAULT_YEAR": "2023"
      }
    }
  }
}
```

---

## Security Considerations

### Data Privacy

- **In-Memory Only**: Tax return data is stored in memory and cleared when server restarts
- **No Network Access**: MCP server runs locally, no data sent to external services
- **No Logging**: SSNs and EINs are never logged, even in debug mode
- **File Permissions**: Exported JSON and PDFs inherit user's file permissions

### Production Use

For production environments:

1. **Restrict File Paths**: Only allow PDF/export to approved directories
2. **Audit Logs**: Log all MCP tool calls (without PII) for compliance
3. **Access Control**: Ensure only authorized users can access the MCP server
4. **Data Encryption**: Encrypt exported JSON files at rest

Example secure configuration:

```json
{
  "mcpServers": {
    "ustaxes": {
      "command": "npx",
      "args": ["tsx", "/path/to/ustaxes-server/src/index.ts"],
      "env": {
        "ALLOWED_OUTPUT_DIR": "/secure/tax-returns",
        "AUDIT_LOG": "/var/log/ustaxes-mcp/audit.log",
        "DISABLE_EXPORT": "false"
      }
    }
  }
}
```

---

## Next Steps

- **API Reference**: See `API_REFERENCE.md` for complete tool documentation
- **Examples**: See `EXAMPLES.md` for real-world usage patterns
- **Contributing**: See main UsTaxes `CONTRIBUTING.md` for development guidelines

---

**Last Updated:** 2024-11-28
**Version:** 1.0.0
