import { describe, expect, it } from "vitest";
import sampleData from "../data/prices.sample.json";
import generatedData from "../data/prices.generated.json";
import qualityReport from "../data/quality-report.json";
import { qualityReportSchema } from "./pipeline";
import { searchModels } from "./search";
import { filterByProvider } from "./filter";
import { priceDatasetResult } from "./data";
import { priceDatasetSchema } from "./schema";

describe("sample price dataset", () => {
  it("loads the nonempty generated production data and matching quality report", () => {
    expect(priceDatasetSchema.safeParse(generatedData).success).toBe(true);
    expect(priceDatasetResult.success).toBe(true);
    expect(qualityReportSchema.safeParse(qualityReport).success).toBe(true);
    expect(generatedData.models.length).toBeGreaterThan(0);
    expect(qualityReport.recordCount).toBe(generatedData.models.length);
    expect(qualityReport.generatedAt).toBe(generatedData.generatedAt);
    expect(new Set(generatedData.models.map((model) => model.modelId)).size).toBe(generatedData.models.length);
    for (const model of generatedData.models) {
      expect(model.modelId).not.toMatch(/^sample-/);
      expect(model.sourceUrl).toMatch(/^https:\/\//);
      expect(model.status).not.toBe("verified");
    }
  });

  it("keeps Chinese keywords, misspellings and all provider shortcuts usable with imported data", () => {
    const models = priceDatasetSchema.parse(generatedData).models;
    for (const query of ["深度求索", "克劳德", "谷歌", "写代码", "便宜", "sonet", "GPT"]) {
      expect(searchModels(models, query).length, query).toBeGreaterThan(0);
    }
    for (const provider of ["openai", "anthropic", "google", "deepseek", "open-models"]) {
      expect(filterByProvider(models, provider).length, provider).toBeGreaterThan(0);
    }
    expect(searchModels(models, "zzzz-no-such-model-99999")).toEqual([]);
  });

  it("passes schema and meets Phase 3.1 sample requirements", () => {
    expect(priceDatasetSchema.safeParse(sampleData).success).toBe(true);
    const dataset = priceDatasetSchema.parse(sampleData);
    expect(dataset.models.length).toBeGreaterThanOrEqual(4);
    expect(dataset.models.length).toBeLessThanOrEqual(6);
    expect(dataset.warnings).toContain("示例数据，非生产价格");

    for (const model of dataset.models) {
      expect(model.modelId).toMatch(/^sample-/);
      expect(model.status).toBe("needs-review");
      expect(model.sourceName).toBe("Sample Dataset");
      expect(model.sourceUrl).toBeNull();
    }

    expect(
      dataset.models.some((model) => model.inputPerMillionUsd === 0),
    ).toBe(true);
    expect(
      dataset.models.some(
        (model) =>
          model.inputPerMillionUsd === null ||
          model.outputPerMillionUsd === null,
      ),
    ).toBe(true);
    expect(
      dataset.models.some((model) => model.contextWindow === null),
    ).toBe(true);
  });
});
