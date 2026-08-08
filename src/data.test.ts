import { describe, expect, it } from "vitest";
import sampleData from "../data/prices.sample.json";
import { priceDatasetResult } from "./data";
import { priceDatasetSchema } from "./schema";

describe("sample price dataset", () => {
  it("passes schema and meets Phase 3.1 sample requirements", () => {
    expect(priceDatasetSchema.safeParse(sampleData).success).toBe(true);
    expect(priceDatasetResult.success).toBe(true);

    if (!priceDatasetResult.success) {
      return;
    }

    const dataset = priceDatasetResult.data;
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
