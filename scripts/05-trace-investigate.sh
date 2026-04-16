#!/usr/bin/env bash
# Pattern 5 — Trace Viewer workflow
#
# Runs the full test suite with trace-on-first-retry, finds the first
# .zip trace artifact, and opens it in the Playwright Trace Viewer.
#
# Usage:
#   bash scripts/05-trace-investigate.sh
#
# Requirements:
#   - Node 20+
#   - Playwright installed (`npx playwright install`)

set -euo pipefail

TRACE_DIR="test-results"

echo "==> Running test suite with tracing enabled (on-first-retry)..."
npx playwright test --retries=1 --reporter=list || true

echo ""
echo "==> Searching for trace artifacts in ${TRACE_DIR}/..."

TRACE_FILE=$(find "$TRACE_DIR" -name "trace.zip" -type f 2>/dev/null | head -n 1)

if [[ -z "$TRACE_FILE" ]]; then
  echo "    No trace artifacts found."
  echo "    This means every test passed on the first attempt — no retries triggered."
  echo ""
  echo "    To force a trace, run:"
  echo "      npx playwright test --trace on"
  echo "    and then:"
  echo "      npx playwright show-trace test-results/<test-folder>/trace.zip"
  exit 0
fi

echo "    Found trace: ${TRACE_FILE}"
echo ""
echo "==> Opening Trace Viewer..."
npx playwright show-trace "$TRACE_FILE"
