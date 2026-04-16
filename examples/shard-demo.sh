#!/usr/bin/env bash
# Demonstrate sharding by running shard 1/2 and 2/2 sequentially.
# In CI, these would run as separate parallel jobs.
#
# Usage:
#   bash examples/shard-demo.sh
#
# Prerequisites:
#   npm install && npx playwright install

set -euo pipefail

echo "==> Shard 1 of 2..."
npx playwright test --shard=1/2 --reporter=list || true

echo ""
echo "==> Shard 2 of 2..."
npx playwright test --shard=2/2 --reporter=list || true

echo ""
echo "==> Both shards complete."
