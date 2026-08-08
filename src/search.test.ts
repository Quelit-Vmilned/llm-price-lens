import { describe, expect, it } from "vitest";
import { fixtureModels } from "./fixtures";
import { searchModels } from "./search";

const ids = (models: ReturnType<typeof searchModels>) =>
  models.map((model) => model.modelId);

describe("searchModels", () => {
  it("returns all models for an empty query", () => {
    expect(ids(searchModels(fixtureModels, ""))).toEqual(
      fixtureModels.map((model) => model.modelId),
    );
  });

  it("matches English aliases", () => {
    expect(ids(searchModels(fixtureModels, "sonnet"))).toContain(
      "claude-sonnet-test",
    );
  });

  it("matches spelling approximations", () => {
    expect(ids(searchModels(fixtureModels, "sonet"))).toContain(
      "claude-sonnet-test",
    );
  });

  it("matches Chinese tags and aliases", () => {
    const coding = ids(searchModels(fixtureModels, "写代码"));
    expect(coding).toContain("gpt-test");
    expect(coding).toContain("deepseek-test");
    expect(ids(searchModels(fixtureModels, "推理模型"))).toContain("gpt-test");
    expect(ids(searchModels(fixtureModels, "开源"))).toContain(
      "deepseek-test",
    );
  });

  it("matches providers", () => {
    expect(ids(searchModels(fixtureModels, "openai"))).toEqual(["gpt-test"]);
  });

  it("returns an empty list for no matches", () => {
    expect(ids(searchModels(fixtureModels, "not-a-model"))).toEqual([]);
  });

  it("is deterministic for repeated identical queries", () => {
    expect(ids(searchModels(fixtureModels, "写代码"))).toEqual(
      ids(searchModels(fixtureModels, "写代码")),
    );
  });
});
