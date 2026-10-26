# llm-price-lens

A lightweight static website for comparing LLM API token prices.

Status: Phase 4 release candidate (`v0.4.0`). The static frontend provides model price display, Fuse.js fuzzy search, provider filters, sorting, a token cost calculator, responsive layout, and accessible controls. Deployment revision checks and a public `release.json` identify the published source. Online acceptance is tracked in [PHASE_4_RECORD.md](PHASE_4_RECORD.md).

**Sample data only.** All five displayed models and their prices/benchmark values are demonstration fixtures. No live prices or benchmark results are connected. Missing values remain `Unknown`; zero remains a real zero. Upstream synchronization and scheduled checks belong to the next data phase.

Site: [llm-price-lens on GitHub Pages](https://quelit-vmilned.github.io/llm-price-lens/).

## Commands

- `npm run dev` - start the Vite development server
- `npm run typecheck` - run TypeScript checks
- `npm test` - run Vitest
- `npm run build` - build static assets for GitHub Pages
- `npm run preview` - preview the production build
- `npm run verify:build` - check release identity, relative assets, sample-only data, and license distribution
- `GITHUB_SHA=<full-source-sha> npm run verify:deployment` - verify the exact revision published to Pages
- `npm audit --audit-level=low` - check current dependency advisories

## Data

`data/benchmark-snapshot.json` is a schema-valid placeholder with `null` unknown values and an empty models list. `data/prices.sample.json` is the schema-valid sample dataset loaded by the page. No external data is fetched yet.

## Release procedure

Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:build`, and `npm audit --audit-level=low`. Check desktop/mobile layouts, keyboard navigation, dark mode, search, filters, sorting, calculator inputs, and no-result behavior in a browser. Push the reviewed revision to `main`, or dispatch deployment on current `main`.

Deployment rejects a revision that no longer matches `main`, including after the GitHub environment approval gate, then verifies the live release identity, page and assets. Keep environment approval requirements in place. For recovery, use the current `main` workflow; historical Phase 2/3 workflows predate the revision guard.

## Phase Records

- [PHASES.md](PHASES.md) is the development timeline and phase index.
- [`PHASE_2_5_RECORD.md`](PHASE_2_5_RECORD.md) records the Phase 2.5 baseline commit, validation commands, hashes, and remaining risks.
- [`PHASE_3_RECORD.md`](PHASE_3_RECORD.md) records the Phase 3 MVP implementation and verification results.
- [`PHASE_3_1_RECORD.md`](PHASE_3_1_RECORD.md) records the Phase 3.1 hardening changes and verification results.
- [`PHASE_4_RECORD.md`](PHASE_4_RECORD.md) records fixes, validation, release evidence, and the sample-data limitation.
