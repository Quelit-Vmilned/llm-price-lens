export type VerificationStatus = "verified" | "imported" | "needs-review";

export interface ModelPrice {
  modelId: string;
  provider: string;
  displayName: string;
  apiModelIds: string[];
  aliases: string[];
  tags: string[];
  summary: string;
  inputPerMillionUsd: number | null;
  outputPerMillionUsd: number | null;
  cachedInputPerMillionUsd: number | null;
  contextWindow: number | null;
  sourceName: string;
  sourceUrl: string | null;
  sourceUpdatedAt: string | null;
  verifiedAt: string | null;
  status: VerificationStatus;
  benchmarkScore: number | null;
  benchmarkRank: number | null;
  benchmarkSource: string | null;
  benchmarkCapturedAt: string | null;
}

export interface PriceDataset {
  schemaVersion: 1;
  generatedAt: string;
  models: ModelPrice[];
  warnings: string[];
}

export interface BenchmarkSnapshot {
  source: string | null;
  metric: string | null;
  capturedAt: string | null;
  sourceUrl: string | null;
  models: Array<{
    modelId: string;
    benchmarkScore: number | null;
    benchmarkRank: number | null;
  }>;
}
