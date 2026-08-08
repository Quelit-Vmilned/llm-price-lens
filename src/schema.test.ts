import { describe, expect, it } from "vitest";
import benchmarkSnapshot from "../data/benchmark-snapshot.json";
import {
  benchmarkSnapshotSchema,
  modelPriceSchema,
  priceDatasetSchema,
} from "./schema";
import type { ModelPrice, PriceDataset } from "./types";

const validModel: ModelPrice = {
  modelId: "gpt-test",
  provider: "Test Provider",
  displayName: "Test Model",
  apiModelIds: ["gpt-test"],
  aliases: ["test-model"],
  tags: ["test"],
  summary: "Schema test fixture",
  inputPerMillionUsd: 1.5,
  outputPerMillionUsd: 2.5,
  cachedInputPerMillionUsd: null,
  contextWindow: 128000,
  sourceName: "Test Source",
  sourceUrl: null,
  sourceUpdatedAt: null,
  verifiedAt: "2026-08-01T00:00:00Z",
  status: "verified",
  benchmarkScore: null,
  benchmarkRank: null,
  benchmarkSource: null,
  benchmarkCapturedAt: null,
};

const validDataset: PriceDataset = {
  schemaVersion: 1,
  generatedAt: "2026-08-01T00:00:00Z",
  models: [validModel],
  warnings: [],
};

const validSnapshot = {
  source: "Test Benchmark",
  metric: "Test Score",
  capturedAt: "2026-08-01T00:00:00Z",
  sourceUrl: "https://example.com/benchmark",
  models: [
    {
      modelId: "gpt-test",
      benchmarkScore: 92.5,
      benchmarkRank: 1,
    },
    {
      modelId: "claude-test",
      benchmarkScore: null,
      benchmarkRank: null,
    },
  ],
};

describe("modelPriceSchema", () => {
  it("accepts a valid ModelPrice", () => {
    expect(modelPriceSchema.safeParse(validModel).success).toBe(true);
  });

  it("accepts null for unknown numeric fields", () => {
    const modelWithNullPrices: ModelPrice = {
      ...validModel,
      inputPerMillionUsd: null,
      outputPerMillionUsd: null,
      cachedInputPerMillionUsd: null,
      contextWindow: null,
    };

    expect(modelPriceSchema.safeParse(modelWithNullPrices).success).toBe(true);
  });

  it("accepts 0 prices as real values", () => {
    const modelWithZeroPrices: ModelPrice = {
      ...validModel,
      inputPerMillionUsd: 0,
      outputPerMillionUsd: 0,
      cachedInputPerMillionUsd: 0,
    };

    expect(modelPriceSchema.safeParse(modelWithZeroPrices).success).toBe(true);
  });

  it("keeps null and 0 distinct after parsing", () => {
    const parsedNull = modelPriceSchema.parse({
      ...validModel,
      inputPerMillionUsd: null,
    });
    const parsedZero = modelPriceSchema.parse({
      ...validModel,
      inputPerMillionUsd: 0,
    });

    expect(parsedNull.inputPerMillionUsd).toBeNull();
    expect(parsedZero.inputPerMillionUsd).toBe(0);
  });

  it("rejects unknown fields", () => {
    expect(
      modelPriceSchema.safeParse({ ...validModel, unknownField: "x" }).success,
    ).toBe(false);
  });

  it("rejects negative prices", () => {
    for (const field of [
      "inputPerMillionUsd",
      "outputPerMillionUsd",
      "cachedInputPerMillionUsd",
    ] as const) {
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: -0.01 }).success,
      ).toBe(false);
    }
  });

  it("rejects non-positive or non-integer contextWindow and benchmarkRank", () => {
    for (const field of ["contextWindow", "benchmarkRank"] as const) {
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: 0 }).success,
      ).toBe(false);
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: -1 }).success,
      ).toBe(false);
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: 1.5 }).success,
      ).toBe(false);
    }
  });

  it("rejects invalid or empty time strings but allows null", () => {
    for (const field of [
      "sourceUpdatedAt",
      "verifiedAt",
      "benchmarkCapturedAt",
    ] as const) {
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: "not-a-date" })
          .success,
      ).toBe(false);
      expect(
        modelPriceSchema.safeParse({ ...validModel, [field]: "" }).success,
      ).toBe(false);
    }

    expect(
      modelPriceSchema.safeParse({
        ...validModel,
        sourceUpdatedAt: null,
        verifiedAt: null,
        benchmarkCapturedAt: null,
      }).success,
    ).toBe(true);
  });

  it("rejects missing required fields, invalid status, and empty required strings", () => {
    const { modelId: _modelId, ...missingModelId } = validModel;

    expect(modelPriceSchema.safeParse(missingModelId).success).toBe(false);
    expect(
      modelPriceSchema.safeParse({
        ...validModel,
        status: "invalid-status",
      }).success,
    ).toBe(false);
    expect(
      modelPriceSchema.safeParse({
        ...validModel,
        provider: " ",
      }).success,
    ).toBe(false);
  });
});

describe("priceDatasetSchema", () => {
  it("accepts a complete PriceDataset", () => {
    const result = priceDatasetSchema.safeParse(validDataset);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.models).toHaveLength(1);
    }
  });

  it("rejects invalid schema version or missing models", () => {
    expect(
      priceDatasetSchema.safeParse({
        ...validDataset,
        schemaVersion: 2,
      }).success,
    ).toBe(false);

    const { models: _models, ...missingModels } = validDataset;
    expect(priceDatasetSchema.safeParse(missingModels).success).toBe(false);
  });

  it("rejects unknown fields", () => {
    expect(
      priceDatasetSchema.safeParse({ ...validDataset, extra: true }).success,
    ).toBe(false);
  });

  it("rejects invalid or empty generatedAt", () => {
    expect(
      priceDatasetSchema.safeParse({
        ...validDataset,
        generatedAt: "not-a-date",
      }).success,
    ).toBe(false);
    expect(
      priceDatasetSchema.safeParse({
        ...validDataset,
        generatedAt: "",
      }).success,
    ).toBe(false);
  });
});

describe("benchmarkSnapshotSchema", () => {
  it("accepts a BenchmarkSnapshot with real entries", () => {
    const result = benchmarkSnapshotSchema.safeParse(validSnapshot);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.models).toHaveLength(2);
      expect(result.data.models[0]).toEqual({
        modelId: "gpt-test",
        benchmarkScore: 92.5,
        benchmarkRank: 1,
      });
      expect(result.data.models[1]).toEqual({
        modelId: "claude-test",
        benchmarkScore: null,
        benchmarkRank: null,
      });
    }
  });

  it("rejects unknown top-level and nested fields", () => {
    expect(
      benchmarkSnapshotSchema.safeParse({ ...validSnapshot, extra: true })
        .success,
    ).toBe(false);
    expect(
      benchmarkSnapshotSchema.safeParse({
        ...validSnapshot,
        models: [
          {
            modelId: "gpt-test",
            benchmarkScore: 1,
            benchmarkRank: 1,
            extra: true,
          },
        ],
      }).success,
    ).toBe(false);
  });

  it("rejects empty strings in place of null and invalid capturedAt", () => {
    expect(
      benchmarkSnapshotSchema.safeParse({
        source: "",
        metric: null,
        capturedAt: null,
        sourceUrl: null,
        models: [],
      }).success,
    ).toBe(false);
    expect(
      benchmarkSnapshotSchema.safeParse({
        ...validSnapshot,
        capturedAt: "not-a-date",
      }).success,
    ).toBe(false);
    expect(
      benchmarkSnapshotSchema.safeParse({
        ...validSnapshot,
        capturedAt: "",
      }).success,
    ).toBe(false);
  });

  it("validates the committed benchmark snapshot placeholder", () => {
    expect(benchmarkSnapshotSchema.safeParse(benchmarkSnapshot).success).toBe(
      true,
    );
  });
});
