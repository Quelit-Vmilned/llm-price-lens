# llm-price-lens

A lightweight static website for comparing LLM API token prices.

Status: Phase 3 baseline. Phase 2.5 finalized the data foundation: Zod schemas with non-empty summaries/warnings, source URL validation, source-metadata requirements for non-empty benchmark snapshots, schema tests, and repo-contained third-party license texts. Price querying, search, sorting, data sync, and the cost calculator are not implemented yet.

## Commands

- `npm run dev` - start the Vite development server
- `npm run typecheck` - run TypeScript checks
- `npm test` - run Vitest
- `npm run build` - build static assets for GitHub Pages
- `npm run preview` - preview the production build

## Data

`data/benchmark-snapshot.json` is a schema-valid placeholder with `null` unknown values and an empty models list. No external data is fetched yet.

## Phase Records

- [`PHASE_2_5_RECORD.md`](PHASE_2_5_RECORD.md) records the Phase 2.5 baseline commit, validation commands, hashes, and remaining risks.
