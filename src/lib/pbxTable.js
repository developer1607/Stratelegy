/** Flatten SkySwitch API records into readable table rows. */

const MAX_DEPTH = 5;

/** Keys/patterns to hide from auto-generated columns (internal/noisy API fields). */
const COLUMN_EXCLUDE = [
  /^notification\./,
  /^location\.address\.geoposition/,
  /\.custom_callback$/,
  /\.force_csz$/,
  /\.user_provided_lat_long$/,
  /\.mute_option$/,
  /\.email_addresses$/,
  /\.referred_status$/,
  /\.description$/,
  /^location\.language$/,
];

/** Preferred column order — known fields first. */
const COLUMN_ORDER = [
  'phone_number',
  'number',
  'user',
  'name',
  'domain',
  'status',
  'email_address',
  'subscriber_login',
  'caller_id',
  'ani',
  'dnis',
  'route',
  'trunk_group',
  'mac_address',
  'code',
  'label',
  'value',
  'category',
  'location.address.civic_address.name',
  'location.address.civic_address.street_number',
  'location.address.civic_address.street_name',
  'location.address.civic_address.city',
  'location.address.civic_address.state',
  'location.address.civic_address.zip_code',
  'location.delivery',
  'location.level_of_service.msag_status',
  'location.level_of_service.routing_status',
  'location.level_of_service.position_status',
  'report_type',
  'created_at',
  'id',
];

const COLUMN_LABELS = {
  phone_number: 'Phone number',
  user: 'Extension',
  subscriber_login: 'Login',
  email_address: 'Email',
  caller_id: 'Caller ID',
  srv_code: 'Service',
  mac_address: 'MAC address',
  ani: 'ANI',
  dnis: 'DNIS',
  route: 'Route',
  trunk_group: 'Trunk group',
  code: 'Code',
  label: 'Label',
  value: 'Value',
  category: 'Category',
  file_id: 'File ID',
  deliver_offline: 'Deliver offline',
  'location.address.civic_address.name': 'Location name',
  'location.address.civic_address.street_number': 'Street #',
  'location.address.civic_address.street_name': 'Street',
  'location.address.civic_address.city': 'City',
  'location.address.civic_address.state': 'State',
  'location.address.civic_address.zip_code': 'ZIP',
  'location.address.civic_address.country': 'Country',
  'location.delivery': 'Delivery',
  'location.level_of_service.msag_status': 'MSAG status',
  'location.level_of_service.routing_status': 'Routing status',
  'location.level_of_service.position_status': 'Position status',
  'location.level_of_service.responder_type': 'Responder type',
  'location.level_of_service.civic_status': 'Civic status',
  created_at: 'Created',
  report_type: 'Report type',
};

function humanizeLabel(key) {
  if (COLUMN_LABELS[key]) return COLUMN_LABELS[key];
  const leaf = key.includes('.') ? key.split('.').pop() : key;
  return leaf.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function formatPbxCell(value) {
  if (value == null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '—';
    if (value.every((v) => v == null || typeof v !== 'object')) {
      return value.filter(Boolean).join(', ');
    }
    return `${value.length} item(s)`;
  }
  if (typeof value === 'object') return '—';
  const text = String(value);
  return text.length > 120 ? `${text.slice(0, 117)}…` : text;
}

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function flattenInto(record, out, prefix = '', depth = 0) {
  if (record == null) return;

  if (!isPlainObject(record)) {
    out[prefix.replace(/\.$/, '') || 'value'] = record;
    return;
  }

  for (const [key, val] of Object.entries(record)) {
    const path = prefix ? `${prefix}${key}` : key;

    if (val == null || val === '') {
      out[path] = null;
      continue;
    }

    if (Array.isArray(val)) {
      out[path] = val;
      continue;
    }

    if (isPlainObject(val) && depth < MAX_DEPTH) {
      flattenInto(val, out, `${path}.`, depth + 1);
      continue;
    }

    out[path] = val;
  }
}

export function flattenPbxRow(record) {
  if (record == null) return {};
  if (typeof record !== 'object') return { value: record };

  const flat = {};
  flattenInto(record, flat);
  return flat;
}

function sortColumnKeys(keys) {
  const orderIndex = new Map(COLUMN_ORDER.map((k, i) => [k, i]));
  return [...keys].sort((a, b) => {
    const ai = orderIndex.has(a) ? orderIndex.get(a) : 999;
    const bi = orderIndex.has(b) ? orderIndex.get(b) : 999;
    if (ai !== bi) return ai - bi;
    return a.localeCompare(b);
  });
}

function isExcludedKey(key, extraExclude = []) {
  if (extraExclude.includes(key)) return true;
  return COLUMN_EXCLUDE.some((pattern) =>
    typeof pattern === 'string' ? key === pattern : pattern.test(key)
  );
}

export function columnsFromRecords(records, { maxCols = 16, exclude = [] } = {}) {
  if (!records?.length) return [];
  const seen = new Set();

  for (const row of records) {
    for (const key of Object.keys(row)) {
      if (!isExcludedKey(key, exclude)) seen.add(key);
    }
  }

  const keys = sortColumnKeys([...seen]).slice(0, maxCols);

  return keys.map((key) => ({
    key,
    label: humanizeLabel(key),
    render: (row) => formatPbxCell(row[key]),
  }));
}

export function preparePbxRows(records) {
  return (records || []).map(flattenPbxRow);
}

export function normalizePbxList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

/** Format E911 endpoint for display. */
export function formatE911Row(item) {
  const civic = item?.location?.address?.civic_address || {};
  const los = item?.location?.level_of_service || {};
  const street = [civic.street_number, civic.street_name].filter(Boolean).join(' ');

  return {
    phone_number: item.phone_number,
    name: civic.name,
    street,
    city: civic.city,
    state: civic.state,
    zip_code: civic.zip_code,
    country: civic.country,
    delivery: item?.location?.delivery,
    msag_status: los.msag_status,
    routing_status: los.routing_status,
    position_status: los.position_status,
    responder_type: los.responder_type,
  };
}

export const E911_COLUMNS = [
  { key: 'phone_number', label: 'Phone number' },
  { key: 'name', label: 'Location name' },
  { key: 'street', label: 'Street' },
  { key: 'city', label: 'City' },
  { key: 'state', label: 'State' },
  { key: 'zip_code', label: 'ZIP' },
  { key: 'delivery', label: 'Delivery' },
  { key: 'msag_status', label: 'MSAG status' },
  { key: 'routing_status', label: 'Routing status' },
  { key: 'position_status', label: 'Position status' },
];
