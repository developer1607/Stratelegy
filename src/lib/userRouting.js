/** Comma-separated ticket routing lists on portal users (departments, categories). */

export function parseRoutingList(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function toggleRoutingItem(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function joinRoutingList(list) {
  return list.filter(Boolean).join(',');
}
