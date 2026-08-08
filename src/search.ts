import Fuse from "fuse.js";
import type { ModelPrice } from "./types";

const searchKeys = [
  { name: "displayName", weight: 1 },
  { name: "modelId", weight: 0.9 },
  { name: "apiModelIds", weight: 0.8 },
  { name: "aliases", weight: 0.7 },
  { name: "provider", weight: 0.5 },
  { name: "tags", weight: 0.3 },
  { name: "summary", weight: 0.2 },
];

export function searchModels(
  models: readonly ModelPrice[],
  query: string,
): ModelPrice[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return [...models];
  }

  const fuse = new Fuse(models, {
    keys: searchKeys,
    ignoreLocation: true,
    includeScore: true,
    minMatchCharLength: 1,
    shouldSort: true,
    threshold: 0.3,
  });

  return fuse
    .search(trimmed)
    .sort((a, b) => {
      const scoreDelta = (a.score ?? 1) - (b.score ?? 1);
      return scoreDelta !== 0
        ? scoreDelta
        : a.item.displayName.localeCompare(b.item.displayName);
    })
    .map((result) => result.item);
}
