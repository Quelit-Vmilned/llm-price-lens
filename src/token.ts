export function parseTokenCount(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === "") {
    return null;
  }

  const value = Number(trimmed);
  return Number.isFinite(value) &&
    Number.isSafeInteger(value) &&
    value >= 0
    ? value
    : null;
}
