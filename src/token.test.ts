import { describe, expect, it } from "vitest";
import { parseTokenCount } from "./token";

describe("parseTokenCount", () => {
  it("returns null for empty or non-finite input", () => {
    expect(parseTokenCount("")).toBeNull();
    expect(parseTokenCount("   ")).toBeNull();
    expect(parseTokenCount("abc")).toBeNull();
  });

  it("rejects negative and fractional values", () => {
    expect(parseTokenCount("-1")).toBeNull();
    expect(parseTokenCount("1.5")).toBeNull();
  });

  it("accepts non-negative integers", () => {
    expect(parseTokenCount("0")).toBe(0);
    expect(parseTokenCount("1000000")).toBe(1000000);
    expect(parseTokenCount("1e3")).toBe(1000);
  });
});
