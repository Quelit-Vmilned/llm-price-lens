import { z } from "zod";
import type { BenchmarkSnapshot, ModelPrice, PriceDataset } from "./types";

const nonEmptyString = z.string().trim().min(1);
const nullableString = nonEmptyString.nullable();
const isoDateTime = z.iso.datetime({ offset: true, local: true });
const nullableIsoDateTime = isoDateTime.nullable();
const nonNegativeNumber = z.number().nonnegative();
const nullableNonNegativeNumber = nonNegativeNumber.nullable();
const positiveInteger = z.number().int().positive();
const nullablePositiveInteger = positiveInteger.nullable();

export const modelPriceSchema: z.ZodType<ModelPrice> = z
  .object({
    modelId: nonEmptyString,
    provider: nonEmptyString,
    displayName: nonEmptyString,
    apiModelIds: z.array(nonEmptyString),
    aliases: z.array(nonEmptyString),
    tags: z.array(nonEmptyString),
    summary: z.string(),
    inputPerMillionUsd: nullableNonNegativeNumber,
    outputPerMillionUsd: nullableNonNegativeNumber,
    cachedInputPerMillionUsd: nullableNonNegativeNumber,
    contextWindow: nullablePositiveInteger,
    sourceName: nonEmptyString,
    sourceUrl: nullableString,
    sourceUpdatedAt: nullableIsoDateTime,
    verifiedAt: nullableIsoDateTime,
    status: z.enum(["verified", "imported", "needs-review"]),
    benchmarkScore: z.number().nullable(),
    benchmarkRank: nullablePositiveInteger,
    benchmarkSource: nullableString,
    benchmarkCapturedAt: nullableIsoDateTime,
  })
  .strict();

export const priceDatasetSchema: z.ZodType<PriceDataset> = z
  .object({
    schemaVersion: z.literal(1),
    generatedAt: isoDateTime,
    models: z.array(modelPriceSchema),
    warnings: z.array(z.string()),
  })
  .strict();

export const benchmarkSnapshotSchema: z.ZodType<BenchmarkSnapshot> = z
  .object({
    source: nullableString,
    metric: nullableString,
    capturedAt: nullableIsoDateTime,
    sourceUrl: nullableString,
    models: z.array(
      z
        .object({
          modelId: nonEmptyString,
          benchmarkScore: z.number().nullable(),
          benchmarkRank: nullablePositiveInteger,
        })
        .strict(),
    ),
  })
  .strict();
