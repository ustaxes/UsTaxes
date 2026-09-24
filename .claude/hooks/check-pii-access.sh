#!/bin/bash
# .claude/hooks/check-pii-access.sh
# Logs access to sensitive tax documents and PII

FILE_PATH="$1"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
ACCESS_LOG="/tmp/tax-file-access.jsonl"

# Log all file access
cat <<EOF >> "$ACCESS_LOG"
{"timestamp":"$TIMESTAMP","action":"file_read","path":"$FILE_PATH","session":"$CLAUDE_SESSION_ID"}
EOF

# Check for sensitive patterns in file path
if [[ "$FILE_PATH" =~ ssn|tax_id|ein|w-2|w2|1099|tax.*return ]]; then
  echo "INFO: Accessing tax document: $FILE_PATH"
fi

# Always allow read access (just logging)
exit 0
