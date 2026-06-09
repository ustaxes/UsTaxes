#!/bin/bash
# .claude/hooks/load-tax-session.sh
# Loads previous tax preparation session state

SESSION_FILE="/tmp/tax-session.json"

if [ -f "$SESSION_FILE" ]; then
  echo "Restored previous tax preparation session from $(stat -c %y "$SESSION_FILE" | cut -d' ' -f1)"
  # Could output session summary here
else
  echo "Starting new tax preparation session"
fi

exit 0
