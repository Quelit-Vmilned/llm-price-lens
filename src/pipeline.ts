import { z } from "zod";
import { benchmarkSnapshotSchema, modelPriceSchema, priceDatasetSchema } from "./schema.ts";
import type { BenchmarkSnapshot, ModelPrice, PriceDataset } from "./types.ts";

const text = z.string().trim().min(1);
const price = z.number().finite().nonnegative();
const date = z.iso.datetime({ offset: true });
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const httpsUrl = z.url().refine((value) => new URL(value).protocol === "https:", "Expected an HTTPS URL");

export const sourceConfigSchema = z.object({
  name: text,
  url: httpsUrl,
  repository: httpsUrl,
  auditedCommit: z.string().regex(/^[a-f0-9]{40}$/),
  license: z.literal("MIT"),
  licenseUrl: httpsUrl,
  licenseSha256: hash,
  providers: z.array(text).min(1),
  requiredProviders: z.array(text).min(1),
  providerAliases: z.record(text, z.array(text)),
}).strict();
export type SourceConfig = z.infer<typeof sourceConfigSchema>;

const overridePatch = z.object({
  displayName: text, apiModelIds: z.array(text), aliases: z.array(text), tags: z.array(text), summary: text,
  inputPerMillionUsd: price.nullable(), outputPerMillionUsd: price.nullable(), cachedInputPerMillionUsd: price.nullable(),
  contextWindow: z.number().int().positive().nullable(),
}).partial().strict();
export const overridesSchema = z.object({
  schemaVersion: z.literal(1),
  models: z.array(z.object({
    modelId: text,
    sourceName: text,
    sourceUrl: httpsUrl,
    reason: text,
    verifiedAt: date.nullable(),
    patch: overridePatch,
  }).strict()),
}).strict();
export type ManualOverrides = z.infer<typeof overridesSchema>;

export const benchmarkAliasesSchema = z.record(text, text);

export const qualityReportSchema = z.object({
  schemaVersion: z.literal(1),
  generatedAt: date,
  inputHash: hash,
  sourceCount: z.number().int().positive(),
  providerCount: z.number().int().positive(),
  recordCount: z.number().int().positive(),
  sources: z.array(z.object({
    name: text, url: httpsUrl, repository: httpsUrl, auditedCommit: text,
    license: text, licenseSha256: hash, payloadSha256: hash,
    etag: text.nullable(), lastModified: text.nullable(),
  }).strict()).min(1),
  missingFields: z.record(text, z.number().int().nonnegative()),
  excluded: z.array(z.object({ modelId: text, reason: text }).strict()),
  deduplications: z.array(text),
  overrides: z.array(z.object({ modelId: text, reason: text, sourceUrl: httpsUrl }).strict()),
  benchmark: z.object({
    source: text.nullable(), metric: text.nullable(), sourceUrl: httpsUrl.nullable(),
    capturedAt: date.nullable(), snapshotCount: z.number().int().nonnegative(),
    matchedCount: z.number().int().nonnegative(), unmatched: z.array(text),
  }).strict(),
  warnings: z.array(text),
}).strict();
export type QualityReport = z.infer<typeof qualityReportSchema>;

const upstreamModelSchema = z.object({
  id: text.optional(), name: text, description: text.optional(), family: text.optional(),
  status: text.optional(), open_weights: z.boolean().optional(),
  last_updated: text.optional(), canonical_model_id: text.optional(),
  modalities: z.object({ input: z.array(text), output: z.array(text) }).loose(),
  cost: z.object({
    input: price.nullish(), output: price.nullish(), cache_read: price.nullish(),
  }).loose().nullish(),
  limit: z.object({ context: z.number().int().nonnegative().nullable().optional() }).loose().optional(),
}).loose();

const billingFields = ["inputPerMillionUsd", "outputPerMillionUsd", "cachedInputPerMillionUsd", "contextWindow"] as const;
export const DATA_WARNINGS = [
  "Community-maintained prices imported from models.dev; not independently verified with each provider.",
  "USD base text-token rates per 1M tokens. Long-context tiers, tools, audio, images, taxes and other charges are excluded; check the provider before purchase.",
  "Benchmark: historical AIME 2024 Pass@1 (%) self-reported by DeepSeek. Ranks compare only the six-model snapshot; no match means No benchmark data.",
];

function upstreamDate(value: string | undefined): string | null {
  // Month-only dates cannot establish an exact update date.
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const candidate = `${value}T00:00:00Z`;
  return date.safeParse(candidate).success ? candidate : null;
}

export function normalizePrices(raw: unknown, config: SourceConfig): {
  models: ModelPrice[]; excluded: QualityReport["excluded"];
} {
  const catalog = z.record(text, z.unknown()).parse(raw);
  const models: ModelPrice[] = [];
  const excluded: QualityReport["excluded"] = [];
  for (const providerId of [...config.providers].sort()) {
    const rawProvider = catalog[providerId];
    if (rawProvider === undefined) {
      if (config.requiredProviders.includes(providerId)) throw new Error(`Required provider missing: ${providerId}`);
      continue;
    }
    const provider = z.object({ name: text, models: z.record(text, z.unknown()) }).loose().parse(rawProvider);
    for (const [apiId, rawModel] of Object.entries(provider.models).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) {
      const modelId = `${providerId}/${apiId}`;
      // The URL-key pair is the stable endpoint identity. Never guess that
      // different hosts, versions or mutable aliases share a price/benchmark.
      const parsed = upstreamModelSchema.safeParse(rawModel);
      if (!parsed.success) throw new Error(`Invalid upstream model ${modelId}: ${parsed.error.message}`);
      const model = parsed.data;
      if (model.id !== undefined && model.id !== apiId) throw new Error(`Model ID mismatch: ${modelId}`);
      let reason: string | null = null;
      if (model.status === "deprecated") reason = "Deprecated endpoint; historical price excluded";
      else if (!model.modalities.input.includes("text") || !model.modalities.output.includes("text")) reason = "Not a text-input/text-output model";
      else if (model.modalities.output.some((modality) => modality !== "text") || /(?:^|[-/])(?:image|imagen|realtime)(?:[-/]|$)|dall-e/i.test(apiId)) reason = "Image generation, audio or realtime billing is outside base text-token comparison";
      else if (/embed|rerank|whisper|transcri|speech|\btts\b/i.test(`${apiId} ${model.family ?? ""}`)) reason = "Embedding, reranking or speech billing is outside token comparison";
      if (reason) { excluded.push({ modelId, reason }); continue; }
      const input = model.cost?.input ?? null;
      const output = model.cost?.output ?? null;
      models.push(modelPriceSchema.parse({
        modelId, provider: provider.name, displayName: model.name,
        apiModelIds: [apiId], aliases: config.providerAliases[providerId] ?? [],
        tags: [...(model.family ? [model.family] : []), ...(model.open_weights ? ["open-weights"] : [])],
        summary: model.description ?? `${model.name} served by ${provider.name}.`,
        inputPerMillionUsd: input, outputPerMillionUsd: output,
        cachedInputPerMillionUsd: model.cost?.cache_read ?? null,
        contextWindow: model.limit?.context ? model.limit.context : null,
        sourceName: config.name, sourceUrl: config.url,
        sourceUpdatedAt: upstreamDate(model.last_updated), verifiedAt: null,
        status: input === null || output === null ? "needs-review" : "imported",
        benchmarkScore: null, benchmarkRank: null, benchmarkSource: null, benchmarkCapturedAt: null,
      }));
    }
  }
  if (models.length === 0) throw new Error("Upstream produced no eligible text models; refusing to replace valid data");
  for (const id of config.requiredProviders) {
    if (!models.some((model) => model.modelId.startsWith(`${id}/`))) throw new Error(`No eligible models for required provider: ${id}`);
  }
  return { models, excluded };
}

export function mergePrices(
  imported: ModelPrice[], overrides: ManualOverrides, snapshot: BenchmarkSnapshot,
  aliases: Record<string, string>,
): { models: ModelPrice[]; deduplications: string[]; warnings: string[]; applied: QualityReport["overrides"] } {
  overrides = overridesSchema.parse(overrides);
  snapshot = benchmarkSnapshotSchema.parse(snapshot);
  aliases = benchmarkAliasesSchema.parse(aliases);
  const byId = new Map<string, ModelPrice>();
  const deduplications: string[] = [];
  const warnings: string[] = [];
  const applied: QualityReport["overrides"] = [];
  for (const model of imported) {
    const previous = byId.get(model.modelId);
    if (previous) {
      if (JSON.stringify(previous) !== JSON.stringify(model)) throw new Error(`Conflicting duplicate model: ${model.modelId}`);
      deduplications.push(`Identical endpoint ${model.modelId}: retained first record`);
    } else byId.set(model.modelId, modelPriceSchema.parse(model));
  }
  const seenOverrides = new Set<string>();
  for (const override of overrides.models) {
    if (seenOverrides.has(override.modelId)) throw new Error(`Duplicate override: ${override.modelId}`);
    seenOverrides.add(override.modelId);
    const existing = byId.get(override.modelId);
    if (!existing) { warnings.push(`Override target absent: ${override.modelId}`); continue; }
    const changesBilling = billingFields.some((field) => Object.prototype.hasOwnProperty.call(override.patch, field));
    const merged: ModelPrice = {
      ...existing, ...override.patch,
      aliases: [...new Set([...existing.aliases, ...(override.patch.aliases ?? [])])],
      tags: [...new Set([...existing.tags, ...(override.patch.tags ?? [])])],
    };
    if (changesBilling) {
      merged.sourceName = override.sourceName;
      merged.sourceUrl = override.sourceUrl;
      merged.sourceUpdatedAt = override.verifiedAt;
      merged.verifiedAt = override.verifiedAt;
      merged.status = override.verifiedAt === null ? "needs-review" : "verified";
    }
    byId.set(override.modelId, modelPriceSchema.parse(merged));
    applied.push({ modelId: override.modelId, reason: override.reason, sourceUrl: override.sourceUrl });
  }
  const benchmarkMap = new Map<string, BenchmarkSnapshot["models"][number]>();
  for (const entry of snapshot.models) {
    if (benchmarkMap.has(entry.modelId)) throw new Error(`Duplicate benchmark: ${entry.modelId}`);
    benchmarkMap.set(entry.modelId, entry);
  }
  for (const [modelId, benchmarkId] of Object.entries(aliases)) {
    if (!benchmarkMap.has(benchmarkId)) throw new Error(`Unknown benchmark alias target: ${modelId} -> ${benchmarkId}`);
  }
  for (const model of byId.values()) {
    const benchmarkId = aliases[model.modelId];
    const entry = benchmarkId === undefined ? undefined : benchmarkMap.get(benchmarkId);
    if (entry) {
      model.benchmarkScore = entry.benchmarkScore;
      model.benchmarkRank = entry.benchmarkRank;
      model.benchmarkSource = `${snapshot.source} · ${snapshot.metric}`;
      model.benchmarkCapturedAt = snapshot.capturedAt;
    }
  }
  const models = [...byId.values()].sort((a, b) => a.modelId < b.modelId ? -1 : a.modelId > b.modelId ? 1 : 0);
  return { models, deduplications, warnings, applied };
}

export function buildSnapshot(options: {
  raw: unknown; config: SourceConfig; overrides: ManualOverrides;
  benchmark: BenchmarkSnapshot; aliases: Record<string, string>;
  generatedAt: string; inputHash: string; source: QualityReport["sources"][number];
  previous?: PriceDataset | null;
}): { dataset: PriceDataset; report: QualityReport } {
  const normalized = normalizePrices(options.raw, options.config);
  const merged = mergePrices(normalized.models, options.overrides, options.benchmark, options.aliases);
  const priced = (models: ModelPrice[]) => models.filter((model) => model.inputPerMillionUsd !== null && model.outputPerMillionUsd !== null).length;
  if (priced(merged.models) === 0) throw new Error("No complete token prices; possible upstream billing schema change");
  if (options.previous?.models.length && merged.models.length < options.previous.models.length * 0.5) {
    throw new Error("More than half the previous models disappeared; refusing suspicious snapshot");
  }
  if (options.previous && priced(merged.models) < priced(options.previous.models) * 0.5) {
    throw new Error("More than half the known token prices disappeared; refusing suspicious snapshot");
  }
  const warnings = [...DATA_WARNINGS, ...merged.warnings];
  const dataset = priceDatasetSchema.parse({ schemaVersion: 1, generatedAt: options.generatedAt, models: merged.models, warnings });
  const nullableFields = [...billingFields, "sourceUpdatedAt", "verifiedAt", "benchmarkScore"] as const;
  const missingFields = Object.fromEntries(nullableFields.map((field) => [field, dataset.models.filter((model) => model[field] === null).length]));
  const matchedIds = new Set(dataset.models.filter((model) => model.benchmarkSource !== null).map((model) => options.aliases[model.modelId]));
  const report = qualityReportSchema.parse({
    schemaVersion: 1, generatedAt: dataset.generatedAt, inputHash: options.inputHash,
    sourceCount: 1, providerCount: new Set(dataset.models.map((model) => model.provider)).size,
    recordCount: dataset.models.length, sources: [options.source], missingFields,
    excluded: normalized.excluded, deduplications: merged.deduplications, overrides: merged.applied,
    benchmark: {
      source: options.benchmark.source, metric: options.benchmark.metric,
      sourceUrl: options.benchmark.sourceUrl, capturedAt: options.benchmark.capturedAt,
      snapshotCount: options.benchmark.models.length,
      matchedCount: dataset.models.filter((model) => model.benchmarkSource !== null).length,
      unmatched: options.benchmark.models.filter((model) => !matchedIds.has(model.modelId)).map((model) => model.modelId),
    }, warnings,
  });
  return { dataset, report };
}
