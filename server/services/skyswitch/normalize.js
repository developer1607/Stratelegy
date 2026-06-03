/**
 * SkySwitch often returns object maps keyed by ID (see apiDocumentation.md domain/reseller examples).
 * Normalize to arrays with stable identifier fields.
 */

export function normalizeObjectMap(data, idField) {
  if (Array.isArray(data)) {
    return data.map((item) => normalizeRecord(item, idField));
  }
  if (!data || typeof data !== 'object') return [];

  return Object.entries(data).map(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return normalizeRecord({ ...value, [idField]: value[idField] || key }, idField);
    }
    return { [idField]: key, name: String(value) };
  });
}

function normalizeRecord(record, idField) {
  const id = record[idField] || record.domain || record.name || record.id;
  return id ? { ...record, [idField]: id } : record;
}

export function normalizeDomainList(data) {
  return normalizeObjectMap(data, 'domain').sort((a, b) =>
    (a.domain || '').localeCompare(b.domain || '', undefined, { sensitivity: 'base' })
  );
}

export function normalizeResellerList(data) {
  return normalizeObjectMap(data, 'name').sort((a, b) =>
    (a.name || '').localeCompare(b.name || '', undefined, { sensitivity: 'base' })
  );
}
