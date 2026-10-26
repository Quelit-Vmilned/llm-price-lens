import { describe, expect, it } from "vitest";
import { buildSnapshot, mergePrices, normalizePrices, type SourceConfig, type ManualOverrides } from "./pipeline";
import { searchModels } from "./search";
import { filterByProvider } from "./filter";
import type { BenchmarkSnapshot } from "./types";

const config: SourceConfig = {
  name: "Test catalog", url: "https://example.com/api.json", repository: "https://example.com/repo",
  auditedCommit: "a".repeat(40), license: "MIT", licenseUrl: "https://example.com/LICENSE",
  licenseSha256: "b".repeat(64), providers: ["test"], requiredProviders: ["test"], providerAliases: { test: ["中文厂商"] },
};
const model = { id: "v1", name: "Test V1", modalities: { input: ["text"], output: ["text"] }, cost: { input: 0, output: 2 }, limit: { context: 0 }, last_updated: "2026-10-20", open_weights: true };
const catalog = (models: Record<string, unknown> = { v1: model }) => ({ test: { name: "Test", models } });
const normalized = () => normalizePrices(catalog(), config).models;
const emptyOverrides: ManualOverrides = { schemaVersion: 1, models: [] };
const benchmark: BenchmarkSnapshot = {
  source: "Fixed report", metric: "Test accuracy (%)", capturedAt: "2026-10-26T00:00:00Z", sourceUrl: "https://example.com/report",
  models: [{ modelId: "exact-v1", benchmarkScore: 90, benchmarkRank: 1 }],
};
const override = (patch: ManualOverrides["models"][number]["patch"]): ManualOverrides => ({ schemaVersion: 1, models: [{
  modelId: "test/v1", sourceName: "Manual source", sourceUrl: "https://example.com/official", reason: "Correction checked against the exact endpoint",
  verifiedAt: "2026-10-25T00:00:00Z", patch,
}] });

describe("real-data normalization", () => {
  it("preserves zero prices and unknown cached prices/context", () => {
    const result = normalized()[0];
    expect(result.inputPerMillionUsd).toBe(0);
    expect(result.outputPerMillionUsd).toBe(2);
    expect(result.cachedInputPerMillionUsd).toBeNull();
    expect(result.contextWindow).toBeNull();
    expect(result.sourceUpdatedAt).toBe("2026-10-20T00:00:00Z");
    expect(result.status).toBe("imported");
    expect(result.verifiedAt).toBeNull();
  });
  it("does not invent a price or exact update day", () => {
    const result = normalizePrices(catalog({ v1: { ...model, cost: {}, last_updated: "2026-10" } }), config).models[0];
    expect(result.inputPerMillionUsd).toBeNull();
    expect(result.outputPerMillionUsd).toBeNull();
    expect(result.status).toBe("needs-review");
    expect(result.sourceUpdatedAt).toBeNull();
  });
  it("excludes deprecated, speech and embedding entries with reasons", () => {
    const result = normalizePrices(catalog({
      v1: model,
      old: { ...model, id: "old", status: "deprecated" },
      speech: { ...model, id: "speech", modalities: { input: ["audio"], output: ["text"] } },
      embedding: { ...model, id: "embedding" },
    }), config);
    expect(result.models).toHaveLength(1);
    expect(result.excluded).toHaveLength(3);
    expect(result.excluded.every((entry) => entry.reason.length > 0)).toBe(true);
  });
  it("excludes image/realtime billing even when upstream also lists text output", () => {
    const result = normalizePrices(catalog({
      v1: model,
      "gpt-image-1.5": { ...model, id: "gpt-image-1.5" },
      "gemini-image": { ...model, id: "gemini-image", modalities: { input: ["text"], output: ["text", "image"] } },
      "gpt-realtime-2.1": { ...model, id: "gpt-realtime-2.1" },
    }), config);
    expect(result.models.map((entry) => entry.modelId)).toEqual(["test/v1"]);
    expect(result.excluded).toHaveLength(3);
  });
  it.each([-1, NaN, Infinity, "1"])('rejects invalid upstream price %s', (input) => {
    expect(() => normalizePrices(catalog({ v1: { ...model, cost: { input } } }), config)).toThrow(/Invalid upstream model test\/v1/);
  });
  it("rejects missing required providers, empty output and ID inconsistencies", () => {
    expect(() => normalizePrices({}, config)).toThrow(/Required provider/);
    expect(() => normalizePrices(catalog({}), config)).toThrow(/no eligible/);
    expect(() => normalizePrices(catalog({ v1: { ...model, id: "different" } }), config)).toThrow(/ID mismatch/);
  });
  it("keeps provider endpoint identities separate and deterministic", () => {
    const other = { ...config, providers: ["test", "other"] };
    const result = normalizePrices({ ...catalog(), other: { name: "Other", models: { v1: { ...model, canonical_model_id: "test/v1", cost: { input: 9, output: 10 } } } } }, other).models;
    expect(result.map((entry) => entry.modelId)).toEqual(["other/v1", "test/v1"]);
    expect(result.map((entry) => entry.inputPerMillionUsd)).toEqual([9, 0]);
  });
  it("supports curated Chinese aliases and open-weight filtering with real provider names", () => {
    expect(searchModels(normalized(), "中文厂商")).toHaveLength(1);
    expect(filterByProvider(normalized(), "open-models")).toHaveLength(1);
  });
});

describe("merge and benchmark provenance", () => {
  it("applies manual prices first, including null/zero, with provenance", () => {
    const result = mergePrices(normalized(), override({ inputPerMillionUsd: null, outputPerMillionUsd: 0 }), benchmark, {});
    expect(result.models[0].inputPerMillionUsd).toBeNull();
    expect(result.models[0].outputPerMillionUsd).toBe(0);
    expect(result.models[0].sourceName).toBe("Manual source");
    expect(result.models[0].status).toBe("verified");
    expect(result.applied[0].reason).toContain("Correction");
  });
  it("does not promote an unverified override or search-only metadata to verified", () => {
    const unverified = override({ inputPerMillionUsd: 1 });
    unverified.models[0].verifiedAt = null;
    expect(mergePrices(normalized(), unverified, benchmark, {}).models[0].status).toBe("needs-review");
    const result = mergePrices(normalized(), override({ aliases: ["写代码"], tags: ["编程"] }), benchmark, {});
    expect(result.models[0].status).toBe("imported");
    expect(result.models[0].sourceName).toBe("Test catalog");
    expect(searchModels(result.models, "写代码")).toHaveLength(1);
  });
  it("deduplicates identical IDs but refuses conflicting records", () => {
    const records = normalized();
    expect(mergePrices([...records, ...records], emptyOverrides, benchmark, {}).deduplications).toHaveLength(1);
    expect(() => mergePrices([...records, { ...records[0], inputPerMillionUsd: 5 }], emptyOverrides, benchmark, {})).toThrow(/Conflicting duplicate/);
  });
  it("records missing overrides and rejects duplicates/invalid patches", () => {
    const missing = override({ inputPerMillionUsd: 1 });
    missing.models[0].modelId = "test/missing";
    expect(mergePrices(normalized(), missing, benchmark, {}).warnings[0]).toContain("Override target absent");
    const duplicate = override({ inputPerMillionUsd: 1 });
    duplicate.models.push(duplicate.models[0]);
    expect(() => mergePrices(normalized(), duplicate, benchmark, {})).toThrow(/Duplicate override/);
    expect(() => mergePrices(normalized(), override({ inputPerMillionUsd: -1 }), benchmark, {})).toThrow();
  });
  it("maps only explicitly listed endpoints; similar/new versions stay unmatched", () => {
    const records = [...normalized(), { ...normalized()[0], modelId: "test/v1-latest" }];
    const result = mergePrices(records, emptyOverrides, benchmark, { "test/v1": "exact-v1" });
    expect(result.models[0].benchmarkScore).toBe(90);
    expect(result.models[0].benchmarkSource).toContain("Test accuracy");
    expect(result.models[1].benchmarkScore).toBeNull();
    expect(result.models[1].benchmarkRank).toBeNull();
  });
  it("rejects invalid mappings and duplicate benchmark entries", () => {
    expect(() => mergePrices(normalized(), emptyOverrides, benchmark, { "test/v1": "missing" })).toThrow(/Unknown benchmark/);
    expect(() => mergePrices(normalized(), emptyOverrides, { ...benchmark, models: [...benchmark.models, ...benchmark.models] }, {})).toThrow(/Duplicate benchmark/);
  });
});

describe("snapshot quality gate", () => {
  const options = {
    raw: catalog(), config, overrides: emptyOverrides, benchmark, aliases: {},
    generatedAt: "2026-10-26T01:00:00Z", inputHash: "c".repeat(64),
    source: { name: config.name, url: config.url, repository: config.repository, auditedCommit: config.auditedCommit,
      license: "MIT", licenseSha256: config.licenseSha256, payloadSha256: "d".repeat(64), etag: null, lastModified: null },
  };
  it("reports missing fields, source identity, exclusions and unmapped benchmarks", () => {
    const result = buildSnapshot(options);
    expect(result.report.recordCount).toBe(result.dataset.models.length);
    expect(result.report.missingFields.cachedInputPerMillionUsd).toBe(1);
    expect(result.report.missingFields.inputPerMillionUsd).toBe(0);
    expect(result.report.benchmark.unmatched).toEqual(["exact-v1"]);
    expect(result.report.sources[0].payloadSha256).toBe("d".repeat(64));
  });
  it("blocks a suspicious loss of more than half the dataset", () => {
    const previous = { schemaVersion: 1 as const, generatedAt: options.generatedAt, models: Array.from({ length: 4 }, (_, index) => ({ ...normalized()[0], modelId: `test/${index}` })), warnings: [] };
    expect(() => buildSnapshot({ ...options, previous })).toThrow(/half/);
  });
  it("does not publish an apparently successful snapshot when all prices disappeared", () => {
    expect(() => buildSnapshot({ ...options, raw: catalog({ v1: { ...model, cost: {} } }) })).toThrow(/No complete token prices/);
  });
});
