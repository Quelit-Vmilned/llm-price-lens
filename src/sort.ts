import { calculateCost, type Workload } from "./cost";
import type { ModelPrice } from "./types";

export type SortKey = "name" | "input" | "output" | "benchmark" | "cost";
export type SortDirection = "asc" | "desc";

export interface SortSpec {
  key: SortKey;
  direction: SortDirection;
}

function compareNames(a: ModelPrice, b: ModelPrice): number {
  return a.displayName.localeCompare(b.displayName, undefined, {
    sensitivity: "base",
  });
}

function sortValue(
  model: ModelPrice,
  key: Exclude<SortKey, "name">,
  workload: Workload,
): number | null {
  switch (key) {
    case "input":
      return model.inputPerMillionUsd;
    case "output":
      return model.outputPerMillionUsd;
    case "benchmark":
      return model.benchmarkScore;
    case "cost":
      return calculateCost(model, workload);
  }
}

export function sortModels(
  models: readonly ModelPrice[],
  spec: SortSpec,
  workload: Workload,
): ModelPrice[] {
  const directionMultiplier = spec.direction === "asc" ? 1 : -1;

  return [...models].sort((a, b) => {
    if (spec.key === "name") {
      return directionMultiplier * compareNames(a, b);
    }

    const aValue = sortValue(a, spec.key, workload);
    const bValue = sortValue(b, spec.key, workload);

    if (aValue === null && bValue === null) {
      return compareNames(a, b);
    }
    if (aValue === null) {
      return 1;
    }
    if (bValue === null) {
      return -1;
    }

    const valueDelta = aValue - bValue;
    return valueDelta === 0
      ? compareNames(a, b)
      : directionMultiplier * valueDelta;
  });
}
