# llm-price-lens

A lightweight static website for comparing LLM API token prices.

Status: Phase 2. The data foundation is in place: Zod schemas, shared types, schema tests, and a schema-valid placeholder benchmark snapshot. Price querying, search, sorting, data sync, and the cost calculator are not implemented yet.

## Commands

- `npm run dev` - start the Vite development server
- `npm run typecheck` - run TypeScript checks
- `npm test` - run Vitest
- `npm run build` - build static assets for GitHub Pages
- `npm run preview` - preview the production build

## Data

`data/benchmark-snapshot.json` is a schema-valid placeholder with `null` unknown values and an empty models list. No external data is fetched yet.
