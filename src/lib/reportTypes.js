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

/** Parse a SkySwitch validation rule string into form metadata. */
export function parseFieldRule(rule) {
  const parts = String(rule || '')
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  const required = parts.includes('required');
  const enumPart = parts.find((p) => p.startsWith('in:'));
  const enumValues = enumPart
    ? enumPart
        .slice(3)
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean)
    : null;
  const type =
    parts.find(
      (p) =>
        !['required', 'sometimes'].includes(p) &&
        !p.startsWith('in:') &&
        !p.startsWith('between:') &&
        !p.startsWith('exists:') &&
        !p.startsWith('size:') &&
        !p.startsWith('alpha_')
    ) || 'string';

  return { required, type, enumValues };
}

/** Initial empty values for a report parameter form. */
export function initialReportParams(fields) {
  const entries = Object.entries(fields || {});
  if (!entries.length) return {};
  return Object.fromEntries(entries.map(([name]) => [name, '']));
}

/** Validate and normalize parameters before queueing a report. */
export function buildReportPayload(fields, rawParams) {
  const entries = Object.entries(fields || {});
  if (!entries.length) return [];

  const params = {};
  const errors = [];

  for (const [name, rule] of entries) {
    const { required, type, enumValues } = parseFieldRule(rule);
    const raw = rawParams?.[name];
    const value = raw == null ? '' : String(raw).trim();

    if (!value) {
      if (required) errors.push(`${name} is required`);
      continue;
    }

    if (enumValues && !enumValues.includes(value)) {
      errors.push(`${name} must be one of: ${enumValues.join(', ')}`);
      continue;
    }

    if (type === 'integer') {
      const n = Number(value);
      if (!Number.isInteger(n)) {
        errors.push(`${name} must be an integer`);
        continue;
      }
      params[name] = n;
      continue;
    }

    params[name] = value;
  }

  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.validationErrors = errors;
    throw err;
  }

  return params;
}

/** Find catalog rows matching report type keys (first match per key). */
export function findReportTypesByValue(rows, typeKeys) {
  const keys = new Set(typeKeys);
  const found = new Map();
  for (const row of rows) {
    if (keys.has(row.value) && !found.has(row.value)) {
      found.set(row.value, row);
    }
  }
  return found;
}
