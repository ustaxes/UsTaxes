#!/bin/bash
# .claude/hooks/log-operation.sh
# Logs all Claude Code tool operations to a JSONL file

TOOL_NAME="$1"
TOOL_INPUT="$2"
TOOL_OUTPUT="$3"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
LOG_FILE="/tmp/tax-operations.jsonl"

# Create log entry as JSON
LOG_ENTRY=$(cat <<EOF
{
  "timestamp": "$TIMESTAMP",
  "tool": "$TOOL_NAME",
  "input_preview": "${TOOL_INPUT:0:100}",
  "output_preview": "${TOOL_OUTPUT:0:100}",
  "session": "$CLAUDE_SESSION_ID"
}
EOF
)

# Append to log file
echo "$LOG_ENTRY" >> "$LOG_FILE"

# Always allow operation to proceed
exit 0
