/** Parse comma- or space-separated positive integers (e.g. officer User IDs). */
export function parseIdList(raw: string): number[] {
  return raw
    .split(/[,\s]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => Number(s))
    .filter((n) => Number.isInteger(n) && n > 0)
}
