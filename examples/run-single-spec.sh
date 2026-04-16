#!/usr/bin/env bash
# Run a single spec file by pattern number.
#
# Usage:
#   bash examples/run-single-spec.sh 01   # selector strategy
#   bash examples/run-single-spec.sh 04   # fixtures
#
# Prerequisites:
#   npm install && npx playwright install

set -euo pipefail

PATTERN="${1:?Usage: run-single-spec.sh <pattern-number> (e.g. 01, 02, ..., 08)}"

SPEC_FILE=$(find src -name "${PATTERN}-*.spec.js" -type f 2>/dev/null | head -n 1)

if [[ -z "$SPEC_FILE" ]]; then
  echo "No spec file found matching pattern '${PATTERN}'."
  echo "Available specs:"
  ls -1 src/*.spec.js 2>/dev/null || echo "  (none)"
  exit 1
fi

echo "==> Running ${SPEC_FILE}..."
npx playwright test "$SPEC_FILE" --reporter=list
