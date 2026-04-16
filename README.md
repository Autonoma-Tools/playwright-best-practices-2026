# Playwright Best Practices: 8 Patterns That Cut E2E Flakiness to Under 2%

Companion code for the Autonoma blog post [Playwright Best Practices: 8 Patterns That Cut E2E Flakiness to Under 2%](https://getautonoma.com/blog/playwright-best-practices-2026).

> Companion code for the Autonoma blog post: **[Playwright Best Practices: 8 Patterns That Cut E2E Flakiness to Under 2%](https://getautonoma.com/blog/playwright-best-practices-2026)**

## Requirements

Node 20+, npm

## Quickstart

```bash
git clone https://github.com/Autonoma-Tools/playwright-best-practices-2026.git
cd playwright-best-practices-2026
npm install && npx playwright install && npx playwright test
```

## Project structure

```
.
├── playwright.config.js          # Low-flakiness config (8 s timeout, trace on retry)
├── global-setup.js               # Auth once, persist storageState
├── package.json
├── src/
│   ├── 01-selector-strategy.spec.js   # Pattern 1: data-testid vs role vs CSS vs XPath
│   ├── 02-retry-logic.spec.js         # Pattern 2: timeouts, expect.poll, scoped retries
│   ├── 03-parallelism.spec.js         # Pattern 3: worker isolation and sharding
│   ├── 04-fixtures.spec.js            # Pattern 4: worker/test/composable fixtures
│   ├── 07-auth-storage-state.spec.js  # Pattern 7: storageState auth
│   └── 08-pom-or-not.spec.js          # Pattern 8: POM vs composable fixtures
├── scripts/
│   └── 05-trace-investigate.sh        # Pattern 5: trace viewer workflow
├── .github/workflows/
│   └── e2e.yml                        # Pattern 6: CI flakiness fixes
└── examples/
    ├── run-all.sh                     # Run full suite + open HTML report
    ├── run-single-spec.sh             # Run one spec by pattern number
    └── shard-demo.sh                  # Demonstrate sharding
```

- `src/` — primary source files for the snippets referenced in the blog post.
- `examples/` — runnable examples you can execute as-is.
- `docs/` — extended notes, diagrams, or supporting material (when present).

## About

This repository is maintained by [Autonoma](https://getautonoma.com) as reference material for the linked blog post. Autonoma builds autonomous AI agents that plan, execute, and maintain end-to-end tests directly from your codebase.

If something here is wrong, out of date, or unclear, please [open an issue](https://github.com/Autonoma-Tools/playwright-best-practices-2026/issues/new).

## License

Released under the [MIT License](./LICENSE) © 2026 Autonoma Labs.
