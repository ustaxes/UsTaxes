#!/bin/bash
# .claude/hooks/inject-tax-context.sh
# Injects tax year context into user prompts

# Try to detect current tax year from Redux state or default to 2024
TAX_YEAR="2024"

if [ -f "tax-state.json" ]; then
  # Extract activeYear from state if available
  TAX_YEAR=$(grep -oP '"activeYear":\s*"Y\K\d{4}' tax-state.json 2>/dev/null || echo "2024")
fi

# Output context message (visible to Claude)
echo "Context: Working on $TAX_YEAR tax return"

exit 0
