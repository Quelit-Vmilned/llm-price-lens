import { describe, expect, it } from "vitest";
import { DEFAULT_WORKLOAD } from "./cost";
import { fixtureModels } from "./fixtures";
import { sortModels, type SortKey, type SortSpec } from "./sort";

const ids = (models: ReturnType<typeof sortModels>) =>
  models.map((model) => model.modelId);

function sortBy(
  key: SortKey,
  direction: SortSpec["direction"],
  models = fixtureModels,
) {
  return ids(sortModels(models, { key, direction }, DEFAULT_WORKLOAD));
}

describe("sortModels", () => {
  it("sorts input price ascending with nulls last and name tie-break", () => {
    expect(sortBy("input", "asc")).toEqual([
      "gemini-test",
      "deepseek-test",
      "claude-sonnet-test",
      "gpt-test",
      "open-model-test",
    ]);
  });

  it("sorts input price descending with nulls last and name tie-break", () => {
    expect(sortBy("input", "desc")).toEqual([
      "claude-sonnet-test",
      "gpt-test",
      "deepseek-test",
      "gemini-test",
      "open-model-test",
    ]);
  });

  it("sorts output price ascending with nulls last", () => {
    expect(sortBy("output", "asc")).toEqual([
      "deepseek-test",
      "gemini-test",
      "claude-sonnet-test",
      "gpt-test",
      "open-model-test",
    ]);
  });

  it("sorts output price descending with missing values last", () => {
    expect(sortBy("output", "desc")).toEqual([
      "claude-sonnet-test", "gpt-test", "gemini-test", "deepseek-test", "open-model-test",
    ]);
  });

  it("sorts cost descending and leaves the source dataset unchanged", () => {
    const originalIds = ids(fixtureModels);
    expect(sortBy("cost", "desc")).toEqual([
      "claude-sonnet-test", "gpt-test", "deepseek-test", "gemini-test", "open-model-test",
    ]);
    expect(ids(fixtureModels)).toEqual(originalIds);
  });

  it("sorts benchmark score ascending with nulls last", () => {
    expect(sortBy("benchmark", "asc")).toEqual([
      "gemini-test",
      "claude-sonnet-test",
      "gpt-test",
      "deepseek-test",
      "open-model-test",
    ]);
  });

  it("sorts benchmark score descending with nulls last", () => {
    expect(sortBy("benchmark", "desc")).toEqual([
      "gpt-test",
      "claude-sonnet-test",
      "gemini-test",
      "deepseek-test",
      "open-model-test",
    ]);
  });

  it("sorts example workload cost ascending with nulls last", () => {
    expect(sortBy("cost", "asc")).toEqual([
      "gemini-test",
      "deepseek-test",
      "claude-sonnet-test",
      "gpt-test",
      "open-model-test",
    ]);
  });

  it("sorts by display name in both directions", () => {
    expect(sortBy("name", "asc")).toEqual([
      "claude-sonnet-test",
      "deepseek-test",
      "gemini-test",
      "gpt-test",
      "open-model-test",
    ]);
    expect(sortBy("name", "desc")).toEqual([
      "open-model-test",
      "gpt-test",
      "gemini-test",
      "deepseek-test",
      "claude-sonnet-test",
    ]);
  });
});
