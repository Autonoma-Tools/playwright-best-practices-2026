#!/usr/bin/env bash
# Run the full Playwright test suite and open the HTML report.
#
# Usage:
#   bash examples/run-all.sh
#
# Prerequisites:
#   npm install && npx playwright install

set -euo pipefail

echo "==> Running all Playwright specs..."
npx playwright test --reporter=html || true

echo ""
echo "==> Opening HTML report..."
npx playwright show-report
