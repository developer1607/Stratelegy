/** Parse JSON payload from legacy entity_records rows. */
export function parsePayload(payload) {
  if (payload == null) return {};
  if (typeof payload === 'string') return JSON.parse(payload);
  return payload;
}

/** Serialize MySQL datetime for API responses. */
export function toIsoDate(value) {
  if (value == null) return value;
  if (value instanceof Date) return value.toISOString();
  return value;
}
