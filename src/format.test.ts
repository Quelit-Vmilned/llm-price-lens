import { describe, expect, it } from "vitest";
import {
  formatContext,
  formatDate,
  formatScore,
  formatUsd,
} from "./format";

describe("format", () => {
  it("formats null prices as Unknown", () => {
    expect(formatUsd(null)).toBe("Unknown");
  });

  it("keeps zero as a real currency value", () => {
    expect(formatUsd(0)).toBe("$0.00");
  });

  it("does not round a positive tiny estimate down to a free price", () => {
    expect(formatUsd(0.000003)).toBe("<$0.0001");
    expect(formatUsd(0.0001)).toBe("$0.0001");
  });

  it("formats dates and invalid dates", () => {
    expect(formatDate("2026-08-01T00:00:00Z")).toBe("2026-08-01");
    expect(formatDate("2026-08-01T08:00:00+08:00")).toBe("2026-08-01");
    expect(formatDate("2026-08-01T01:00:00+08:00")).toBe("2026-07-31");
    expect(formatDate(null)).toBe("Unknown");
    expect(formatDate("not-a-date")).toBe("Unknown");
  });

  it("formats context lengths", () => {
    expect(formatContext(null)).toBe("Unknown");
    expect(formatContext(0)).toBe("0");
    expect(formatContext(1000)).toBe("1K");
    expect(formatContext(1000000)).toBe("1M");
  });

  it("formats benchmark scores", () => {
    expect(formatScore(null)).toBe("No benchmark data");
    expect(formatScore(92.5)).toBe("92.5");
  });
});
