/**
 * Helpers for report type catalog data (grouped by category).
 * Each entry has label, value (type key), and optional fields.
 */

/** @typedef {{ category: string, label: string, value: string, fields: Record<string, string>|string[] }} ReportTypeEntry */

/**
 * Flatten grouped report types into rows.
 * @param {Record<string, Array<{ label?: string, value?: string, fields?: object }>>|null|undefined} grouped
 * @returns {ReportTypeEntry[]}
 */
export function flattenReportTypes(grouped) {
  if (!grouped || typeof grouped !== 'object') return [];
  const rows = [];
  for (const [category, items] of Object.entries(grouped)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item?.value) continue;
      rows.push({
        category,
        label: item.label || item.value,
        value: item.value,
        fields: normalizeReportFields(item.fields),
      });
    }
  }
  return rows.sort((a, b) => {
    const cat = a.category.localeCompare(b.category);
    if (cat !== 0) return cat;
    return a.label.localeCompare(b.label);
  });
}

/**
 * Parse SkySwitch field rules (e.g. "required|date", "sometimes|string").
 * @param {object|array|null|undefined} fields
 * @returns {Record<string, string>}
 */
export function normalizeReportFields(fields) {
  if (!fields) return {};
  if (Array.isArray(fields)) {
    return Object.fromEntries(fields.map((f) => [f, 'required']));
  }
  if (typeof fields === 'object') {
    const out = {};
    for (const [key, rule] of Object.entries(fields)) {
      out[key] = String(rule || '');
    }
    return out;
  }
  return {};
}

/** Human-readable parameter summary for a report type. */
export function describeReportFields(fields) {
  const entries = Object.entries(fields || {});
  if (!entries.length) return 'No parameters';
  return entries
    .map(([name, rule]) => {
      const required = String(rule).includes('required');
      const type =
        String(rule)
          .split('|')
          .find((p) => !['required', 'sometimes'].includes(p)) || 'string';
      return `${name}${required ? ' *' : ''} (${type})`;
    })
    .join(', ');
}

/** Filter report types by keyword (label, value, category). */
export function filterReportTypes(rows, query) {
  const q = query.trim().toLowerCase();
  if (!q) return rows;
  return rows.filter((row) =>
    [row.category, row.label, row.value].some((part) => String(part).toLowerCase().includes(q))
  );
}
