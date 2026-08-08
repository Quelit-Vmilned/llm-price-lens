import type { ModelPrice } from "./types";

export interface Workload {
  inputTokens: number | null;
  outputTokens: number | null;
}

export const DEFAULT_WORKLOAD: Workload = {
  inputTokens: 1_000_000,
  outputTokens: 200_000,
};

export function calculateCost(
  model: Pick<ModelPrice, "inputPerMillionUsd" | "outputPerMillionUsd">,
  workload: Workload = DEFAULT_WORKLOAD,
): number | null {
  if (
    workload.inputTokens === null ||
    workload.outputTokens === null ||
    !Number.isFinite(workload.inputTokens) ||
    !Number.isFinite(workload.outputTokens) ||
    !Number.isInteger(workload.inputTokens) ||
    !Number.isInteger(workload.outputTokens) ||
    workload.inputTokens < 0 ||
    workload.outputTokens < 0
  ) {
    return null;
  }

  if (
    model.inputPerMillionUsd === null ||
    model.outputPerMillionUsd === null
  ) {
    return null;
  }

  const result =
    (workload.inputTokens / 1_000_000) * model.inputPerMillionUsd +
    (workload.outputTokens / 1_000_000) * model.outputPerMillionUsd;

  return Number.isFinite(result) ? result : null;
}
