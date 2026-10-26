import { z } from "zod";
import type { BenchmarkSnapshot, ModelPrice, PriceDataset } from "./types.ts";

const nonEmptyString = z.string().trim().min(1);
const nullableString = nonEmptyString.nullable();
const urlString = z.url();
const nullableUrlString = urlString.nullable();
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
    summary: nonEmptyString,
    inputPerMillionUsd: nullableNonNegativeNumber,
    outputPerMillionUsd: nullableNonNegativeNumber,
    cachedInputPerMillionUsd: nullableNonNegativeNumber,
    contextWindow: nullablePositiveInteger,
    sourceName: nonEmptyString,
    sourceUrl: nullableUrlString,
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
    warnings: z.array(nonEmptyString),
  })
  .strict();

export const benchmarkSnapshotSchema: z.ZodType<BenchmarkSnapshot> = z
  .object({
    source: nullableString,
    metric: nullableString,
    capturedAt: nullableIsoDateTime,
    sourceUrl: nullableUrlString,
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
  .strict()
  .superRefine((snapshot, ctx) => {
    if (snapshot.models.length === 0) {
      return;
    }

    for (const field of ["source", "metric", "capturedAt", "sourceUrl"] as const) {
      if (snapshot[field] === null) {
        ctx.addIssue({
          code: "custom",
          path: [field],
          message: "Non-empty benchmark snapshots require source metadata",
        });
      }
    }
  });
