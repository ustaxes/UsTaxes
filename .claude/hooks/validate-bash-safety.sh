#!/bin/bash
# .claude/hooks/validate-bash-safety.sh
# Validates bash commands for safety before execution

COMMAND="$1"

# Block dangerous commands
if [[ "$COMMAND" =~ rm[[:space:]]+-rf|sudo[[:space:]]+rm|shutdown|reboot|halt|poweroff ]]; then
  echo "BLOCK: Dangerous command detected - destructive operations not allowed"
  exit 2
fi

# Block path traversal attempts
if [[ "$COMMAND" =~ \.\./\.\./|~root|/etc/passwd|/etc/shadow ]]; then
  echo "BLOCK: Path traversal or sensitive file access detected"
  exit 2
fi

# Block network attacks
if [[ "$COMMAND" =~ nc[[:space:]]+-l|nmap|wget.*eval|curl.*bash ]]; then
  echo "BLOCK: Potentially dangerous network command detected"
  exit 2
fi

# Block code injection attempts
if [[ "$COMMAND" =~ eval|exec[[:space:]]|python.*-c|perl.*-e ]]; then
  echo "BLOCK: Code injection pattern detected"
  exit 2
fi

# Warn about potentially risky operations (but allow)
if [[ "$COMMAND" =~ rm[[:space:]]|chmod[[:space:]]+777|chown ]]; then
  echo "WARNING: Potentially risky command detected, but allowing: $COMMAND"
fi

# Allow command
exit 0
