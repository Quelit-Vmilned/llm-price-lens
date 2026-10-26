import type { ModelPrice } from "./types";

export function filterByProvider(
  models: readonly ModelPrice[],
  provider: string,
): ModelPrice[] {
  if (provider === "all") {
    return [...models];
  }

  if (provider === "open-models") {
    return models.filter(
      (model) => model.provider.toLowerCase() === "open models" || model.tags.includes("open-weights"),
    );
  }

  return models.filter((model) => model.provider.toLowerCase() === provider);
}
