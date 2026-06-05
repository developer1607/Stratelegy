/**
 * Clamp list/query limits to safe integers for SQL LIMIT clauses.
 * @param {unknown} limit
 * @param {{ default?: number, max?: number }} [options]
 */
export function clampLimit(
  limit,
  { default: defaultLimit = 50, max = 500 } = {},
) {
  const n = Number(limit);
  if (!Number.isFinite(n) || n < 1) return defaultLimit;
  return Math.min(Math.floor(n), max);
}
