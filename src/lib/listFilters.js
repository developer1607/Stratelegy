/** Client-side list filtering helpers */

export function matchSearch(row, query, keys) {
  const q = String(query || '')
    .trim()
    .toLowerCase();
  if (!q) return true;
  return keys.some((key) =>
    String(row[key] ?? '')
      .toLowerCase()
      .includes(q)
  );
}

export function matchSelect(value, filter, allValue = 'all') {
  if (!filter || filter === allValue) return true;
  return String(value ?? '') === String(filter);
}

export function uniqueFieldValues(rows, key, { limit = 50 } = {}) {
  const set = new Set();
  for (const row of rows) {
    const v = row[key];
    if (v != null && v !== '') set.add(String(v));
  }
  return [...set].sort((a, b) => a.localeCompare(b)).slice(0, limit);
}

export function filterByDateRange(dateValue, preset) {
  if (!preset || preset === 'all') return true;
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const days = preset === '7days' ? 7 : preset === '30days' ? 30 : preset === '90days' ? 90 : null;
  if (!days) return true;
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return date >= cutoff;
}

export function revenueInRange(annualRevenue, range) {
  if (!range || range === 'all') return true;
  const rev = Number(annualRevenue) || 0;
  if (range === '0-1m') return rev <= 1_000_000;
  if (range === '1m-5m') return rev > 1_000_000 && rev <= 5_000_000;
  if (range === '5m+') return rev > 5_000_000;
  return true;
}

export function formatDateInput(date) {
  return date.toISOString().slice(0, 10);
}

export function daysAgo(days) {
  return formatDateInput(new Date(Date.now() - days * 86400000));
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isLikelyUserId(value) {
  return UUID_RE.test(String(value ?? '').trim());
}

export function uniqueOwners(rows, keys = ['owner', 'created_by']) {
  const set = new Set();
  for (const row of rows || []) {
    for (const key of keys) {
      const v = row?.[key];
      if (v == null) continue;
      const label = String(v).trim();
      if (!label || isLikelyUserId(label)) continue;
      set.add(label);
    }
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function normalizeFilterText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase();
}

export function matchFieldEquals(a, b) {
  if (!b || b === 'all') return true;
  return normalizeFilterText(a) === normalizeFilterText(b);
}

export function matchFieldIncludes(a, b) {
  if (!b || b === 'all') return true;
  return normalizeFilterText(a).includes(normalizeFilterText(b));
}

export function namesFromConfigItems(items) {
  return (items || [])
    .map((item) => item?.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function todayInput() {
  return formatDateInput(new Date());
}
