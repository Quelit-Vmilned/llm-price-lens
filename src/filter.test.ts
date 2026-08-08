import { describe, expect, it } from "vitest";
import { fixtureModels } from "./fixtures";
import { filterByProvider } from "./filter";

const ids = (models: ReturnType<typeof filterByProvider>) =>
  models.map((model) => model.modelId);

describe("filterByProvider", () => {
  it("returns all models for the all filter", () => {
    expect(filterByProvider(fixtureModels, "all")).toHaveLength(
      fixtureModels.length,
    );
  });

  it("filters by provider", () => {
    expect(ids(filterByProvider(fixtureModels, "openai"))).toEqual([
      "gpt-test",
    ]);
  });

  it("treats Open models as a provider value, not a tag filter", () => {
    expect(ids(filterByProvider(fixtureModels, "open-models"))).toEqual([
      "open-model-test",
    ]);
  });

  it("returns no models for an unknown provider", () => {
    expect(filterByProvider(fixtureModels, "unknown")).toEqual([]);
  });
});
