# llm-price-lens

A lightweight static website for comparing LLM API token prices.

Status: Phase 5 (`v0.5.0`). The frontend consumes validated prices imported from models.dev, with search, provider filters, sorting, a base token cost calculator, responsive layout, and accessible controls. GitHub Actions checks the source around every 30 minutes, publishes successful changes, and verifies the exact deployed revision and data hashes. The public [release identity](https://quelit-vmilned.github.io/llm-price-lens/release.json) and [quality report](https://quelit-vmilned.github.io/llm-price-lens/data/quality-report.json) identify the published snapshot. Acceptance is recorded in [PHASE_5_RECORD.md](PHASE_5_RECORD.md).

Prices are community-maintained imports, not independently verified quotations from each provider. Missing values remain `Unknown`; zero remains a real zero. Estimates use USD base text-token rates and exclude long-context tiers, tools, audio/images, taxes and other charges. Benchmark scores are a separately displayed, historical six-model AIME 2024 snapshot self-reported by DeepSeek; they are never assigned to different model versions. Current endpoints have no exact match to those retired versions and show `No benchmark data`.

Site: [llm-price-lens on GitHub Pages](https://quelit-vmilned.github.io/llm-price-lens/).

## Commands

- `npm run dev` - start the Vite development server
- `npm run typecheck` - run TypeScript checks
- `npm run sync:data` - check the licensed upstream and regenerate data only when source/local inputs change
- `npm run sync:data -- --force` - fetch and validate a fresh snapshot even when prices have not changed
- `npm test` - run Vitest
- `npm run build` - build static assets for GitHub Pages
- `npm run preview` - preview the production build
- `npm run verify:build` - check release identity, relative assets, production data/report hashes, and license distribution
- `GITHUB_SHA=<full-source-sha> npm run verify:deployment` - verify the exact revision published to Pages
- `npm audit --audit-level=low` - check current dependency advisories

## Data

Use Node.js 22.18+ (or 24+) and npm. No server, API key, paid model call or database is required. The data backend is the existing design's GitHub Actions pipeline: fetch → normalize → merge → validate → emit. Browsers consume the validated static snapshot bundled with the site.

- `data/sources.json`: price URL, approved provider whitelist, fixed license audit revision/hash and curated provider aliases. The API updates independently; response SHA256/ETag identify the actual data, without claiming it matches the audit commit.
- `data/prices.generated.json`: production prices, stable provider/endpoint IDs, source URLs, model update dates, and import/verification status. Deprecated, embedding, speech and non-text models are excluded with reasons.
- `data/manual-overrides.json`: exact endpoint patches with source and reason; overrides take priority. Search-only metadata preserves price provenance. Price overrides remain `needs-review` unless explicitly dated as manually verified.
- `data/quality-report.json`: counts, missing fields, excluded records, deduplication decisions, applied overrides, source hashes and unmatched benchmarks.
- `data/benchmark-snapshot.json` and `data/benchmark-aliases.json`: manually maintained historical results and exact version mappings. Snapshot ranks compare only these six reported scores.
- `data/prices.sample.json`: historical test fixture, never loaded by the production page.

An unchanged check (including HTTP 304) retains files and the last successful data sync time. Network, license, schema, merge or suspicious record/price-loss failures leave the previous successful snapshot intact and stop publication. File replacement is staged and rolls back on a write failure. A snapshot older than 24 hours has a visible age notice; an unchanged source can legitimately have an older sync date.

`.github/workflows/sync.yml` runs at minute 7 and 37 of each hour; GitHub may delay scheduled jobs. It supports manual dispatch and a `force` refresh input. Successful changes pass all quality gates, commit only the two generated files, then explicitly dispatch the guarded deployment workflow (bot pushes do not trigger push workflows). Check failures in Actions; a failed run does not replace the public quality report with a fake success. A concurrent main change rejects the data push rather than overwriting newer code.

## Release procedure

Run `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, `npm run verify:build`, and `npm audit --audit-level=low`. Check desktop/mobile layouts, keyboard navigation, dark mode, search, filters, sorting, calculator inputs, and no-result behavior in a browser. Push the reviewed revision to `main`, or dispatch deployment on current `main`.

Deployment rejects a revision that no longer matches `main`, including after the GitHub environment approval gate, then verifies the live release identity, page and assets. Keep environment approval requirements in place. For recovery, use the current `main` workflow; historical Phase 2/3 workflows predate the revision guard.

## Phase Records

- [PHASES.md](PHASES.md) is the development timeline and phase index.
- [`PHASE_2_5_RECORD.md`](PHASE_2_5_RECORD.md) records the Phase 2.5 baseline commit, validation commands, hashes, and remaining risks.
- [`PHASE_3_RECORD.md`](PHASE_3_RECORD.md) records the Phase 3 MVP implementation and verification results.
- [`PHASE_3_1_RECORD.md`](PHASE_3_1_RECORD.md) records the Phase 3.1 hardening changes and verification results.
- [`PHASE_4_RECORD.md`](PHASE_4_RECORD.md) records fixes, validation, release evidence, and the sample-data limitation.
- [`PHASE_5_RECORD.md`](PHASE_5_RECORD.md) records real data integration, update/rollback tests, and online evidence.
