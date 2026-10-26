import { describe, expect, it } from "vitest";
import { calculateCost } from "./cost";
import { fixtureModels } from "./fixtures";

const gpt = fixtureModels[0];
const openModel = fixtureModels[4];

describe("calculateCost", () => {
  it("calculates the default example workload", () => {
    expect(calculateCost(gpt)).toBe(6);
  });

  it("returns null when either input or output price is missing", () => {
    expect(calculateCost(openModel)).toBeNull();
    expect(
      calculateCost({
        inputPerMillionUsd: null,
        outputPerMillionUsd: 15,
      }),
    ).toBeNull();
    expect(
      calculateCost({
        inputPerMillionUsd: 3,
        outputPerMillionUsd: null,
      }),
    ).toBeNull();
  });

  it("keeps zero prices as real values", () => {
    expect(
      calculateCost(
        {
          inputPerMillionUsd: 0,
          outputPerMillionUsd: 0,
        },
        { inputTokens: 1_000_000, outputTokens: 200_000 },
      ),
    ).toBe(0);
  });

  it("returns null for negative token counts", () => {
    expect(
      calculateCost(gpt, { inputTokens: -1, outputTokens: 200_000 }),
    ).toBeNull();
    expect(
      calculateCost(gpt, { inputTokens: 1_000_000, outputTokens: -1 }),
    ).toBeNull();
  });

  it("returns null for null or non-integer token counts", () => {
    expect(
      calculateCost(gpt, { inputTokens: null, outputTokens: 200_000 }),
    ).toBeNull();
    expect(
      calculateCost(gpt, { inputTokens: 1_000_000, outputTokens: null }),
    ).toBeNull();
    expect(
      calculateCost(gpt, { inputTokens: 1.5, outputTokens: 200_000 }),
    ).toBeNull();
    expect(
      calculateCost(gpt, { inputTokens: 1_000_000, outputTokens: 200.5 }),
    ).toBeNull();
  });

  it("returns zero for a zero-length workload", () => {
    expect(
      calculateCost(gpt, { inputTokens: 0, outputTokens: 0 }),
    ).toBe(0);
  });

  it("rejects token counts above the safe integer range", () => {
    expect(calculateCost(gpt, { inputTokens: Number.MAX_SAFE_INTEGER + 1, outputTokens: 0 })).toBeNull();
    expect(calculateCost(gpt, { inputTokens: 0, outputTokens: Number.MAX_SAFE_INTEGER + 1 })).toBeNull();
  });

  it("returns null instead of Infinity for extreme tokens and prices", () => {
    expect(
      calculateCost(
        {
          inputPerMillionUsd: Number.MAX_VALUE,
          outputPerMillionUsd: Number.MAX_VALUE,
        },
        {
          inputTokens: Number.MAX_SAFE_INTEGER,
          outputTokens: Number.MAX_SAFE_INTEGER,
        },
      ),
    ).toBeNull();
  });
});
