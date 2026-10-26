import generatedData from "../data/prices.generated.json";
import { priceDatasetSchema } from "./schema";
import type { PriceDataset } from "./types";

export const priceDatasetResult = priceDatasetSchema.safeParse(generatedData);

export const priceDataset: PriceDataset | null = priceDatasetResult.success
  ? priceDatasetResult.data
  : null;

export const priceDatasetError: string | null = priceDatasetResult.success
  ? null
  : priceDatasetResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("; ");
