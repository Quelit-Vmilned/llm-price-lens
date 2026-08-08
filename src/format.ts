import type { VerificationStatus } from "./types";

const usdFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 4,
});

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 4,
});

export function formatUsd(value: number | null): string {
  return value === null ? "Unknown" : usdFormatter.format(value);
}

export function formatScore(value: number | null): string {
  return value === null ? "No benchmark data" : numberFormatter.format(value);
}

export function formatContext(value: number | null): string {
  if (value === null) {
    return "Unknown";
  }
  if (value >= 1_000_000) {
    return `${numberFormatter.format(value / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${numberFormatter.format(value / 1_000)}K`;
  }
  return numberFormatter.format(value);
}

export function formatDate(value: string | null): string {
  if (value === null) {
    return "Unknown";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }
  // Normalize valid timestamps to UTC before extracting the date.
  return date.toISOString().slice(0, 10);
}

export function formatStatus(value: VerificationStatus): string {
  switch (value) {
    case "verified":
      return "Verified";
    case "imported":
      return "Imported";
    case "needs-review":
      return "Needs review";
  }
}
