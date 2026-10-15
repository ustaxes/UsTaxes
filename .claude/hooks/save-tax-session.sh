#!/bin/bash
# .claude/hooks/save-tax-session.sh
# Saves current tax preparation session state

SESSION_FILE="/tmp/tax-session.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Save session metadata
cat <<EOF > "$SESSION_FILE"
{
  "timestamp": "$TIMESTAMP",
  "session_id": "$CLAUDE_SESSION_ID",
  "working_directory": "$(pwd)",
  "status": "session_ended"
}
EOF

echo "Tax session saved"

exit 0
