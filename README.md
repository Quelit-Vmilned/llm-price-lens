# llm-price-lens

A lightweight static website for comparing LLM API token prices.

Status: Phase 3.1 Hardening. The static frontend loads a schema-valid sample dataset and provides model price display, Fuse.js fuzzy search, sorting, an example workload cost calculator, responsive layout, and accessible controls. License texts are copied into `dist/licenses/` during build. Real data sync and upstream change checks are not implemented yet.

## Commands

- `npm run dev` - start the Vite development server
- `npm run typecheck` - run TypeScript checks
- `npm test` - run Vitest
- `npm run build` - build static assets for GitHub Pages
- `npm run preview` - preview the production build

## Data

`data/benchmark-snapshot.json` is a schema-valid placeholder with `null` unknown values and an empty models list. `data/prices.sample.json` is the schema-valid sample dataset loaded by the page. No external data is fetched yet.

## Phase Records

- [`PHASE_2_5_RECORD.md`](PHASE_2_5_RECORD.md) records the Phase 2.5 baseline commit, validation commands, hashes, and remaining risks.
- [`PHASE_3_RECORD.md`](PHASE_3_RECORD.md) records the Phase 3 MVP implementation and verification results.
- [`PHASE_3_1_RECORD.md`](PHASE_3_1_RECORD.md) records the Phase 3.1 hardening changes and verification results.
