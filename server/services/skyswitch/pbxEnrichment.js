import { toArray } from './client.js';

function pick(obj, ...keys) {
  if (!obj || typeof obj !== 'object') return null;
  for (const key of keys) {
    const value = obj[key];
    if (value != null && value !== '') return value;
  }
  return null;
}

function digitsOnly(value) {
  if (value == null) return '';
  return String(value).replace(/\D/g, '');
}

function normalizePhoneKey(value) {
  const d = digitsOnly(value);
  if (d.length === 11 && d.startsWith('1')) return d.slice(1);
  if (d.length === 10) return d;
  return d || null;
}

/** 11-digit US E.164 (leading 1) for SkySwitch E911 routes. */
export function toE911Phone11(value) {
  const d = digitsOnly(value);
  if (d.length >= 11) return d.slice(-11);
  if (d.length === 10) return `1${d}`;
  return null;
}

function phoneListItemNumber(item) {
  if (item == null) return '';
  if (typeof item === 'string') return item;
  return item.phone_number || item.number || item.did || '';
}

export function filterE911ForDomainPhones(phoneNumbers, e911Endpoints) {
  const keys = new Set();
  for (const item of toArray(phoneNumbers)) {
    const key = normalizePhoneKey(phoneListItemNumber(item));
    if (key) keys.add(key);
  }
  if (!keys.size) return [];
  return dedupeE911ByPhone(
    toArray(e911Endpoints).filter((item) => {
      const key = normalizePhoneKey(item.phone_number);
      return key && keys.has(key);
    })
  );
}

/** SkySwitch may return the same DID with different formatting — keep one row per number. */
export function dedupeE911ByPhone(endpoints) {
  const map = new Map();
  for (const item of toArray(endpoints)) {
    const key = normalizePhoneKey(item.phone_number);
    if (!key) continue;
    const existing = map.get(key);
    if (!existing || digitsOnly(item.phone_number).length > digitsOnly(existing.phone_number).length) {
      map.set(key, item);
    }
  }
  return [...map.values()];
}

/** Derive online / offline / unknown from common SkySwitch subscriber fields. */
export function deriveOnlineStatus(raw) {
  const explicit = pick(raw, 'online', 'is_online', 'registered');
  if (explicit === true || explicit === 1 || explicit === '1') return 'online';
  if (explicit === false || explicit === 0 || explicit === '0') return 'offline';

  const status = String(pick(raw, 'registration_status', 'reg_status', 'status', 'device_status') || '')
    .toLowerCase()
    .trim();

  if (!status) {
    const hasMac = pick(raw, 'mac_address', 'mac');
    return hasMac ? 'offline' : 'no_device';
  }
  if (/online|registered|active|reachable|connected/.test(status)) return 'online';
  if (/offline|unregistered|inactive|unreachable|disconnected|expired/.test(status)) return 'offline';
  return 'no_device';
}

function extractFeatures(raw) {
  const flags = [];
  const text = JSON.stringify(raw || {}).toLowerCase();
  if (raw?.vm || raw?.voicemail || /"vm"/.test(text)) flags.push('VM');
  if (raw?.rec || raw?.recording || /"rec"/.test(text)) flags.push('REC');
  if (raw?.tr || raw?.transcription || /"tr"/.test(text)) flags.push('TR');
  const srv = String(raw?.srv_code || '').toUpperCase();
  if (srv.includes('VM') && !flags.includes('VM')) flags.push('VM');
  return flags;
}

export function normalizeSubscriber(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  const onlineStatus =
    raw.online_status === 'online' ||
    raw.online_status === 'offline' ||
    raw.online_status === 'no_device'
      ? raw.online_status
      : deriveOnlineStatus(raw);
  return {
    ...raw,
    user: pick(raw, 'user', 'extension', 'subscriber') || raw.user,
    name: pick(raw, 'name', 'display_name') || raw.name,
    subscriber_login: pick(raw, 'subscriber_login', 'login') || raw.subscriber_login,
    email_address: pick(raw, 'email_address', 'email') || raw.email_address,
    caller_id: pick(raw, 'caller_id', 'did', 'phone_number') || raw.caller_id,
    scope: pick(raw, 'scope', 'user_scope') || raw.scope,
    site: pick(raw, 'site', 'site_name', 'location') || raw.site,
    department: pick(raw, 'department', 'dept', 'group') || raw.department,
    transport: pick(raw, 'transport', 'protocol', 'sip_transport') || raw.transport,
    geo_node: pick(raw, 'geo_node', 'server_name', 'node', 'geo') || raw.geo_node,
    wan_ip: pick(raw, 'wan_ip', 'registration_ip', 'external_ip', 'contact_ip') || raw.wan_ip,
    mac_address: pick(raw, 'mac_address', 'mac') || raw.mac_address,
    model: pick(raw, 'model', 'device_model', 'phone_model') || raw.model,
    downtime: pick(raw, 'downtime', 'offline_duration', 'unregistered_duration') || raw.downtime,
    notes: pick(raw, 'notes', 'note') || raw.notes,
    online_status: onlineStatus,
    features: extractFeatures(raw),
    is_offline: onlineStatus === 'offline',
  };
}

export function normalizeSubscriberList(list) {
  return toArray(list).map(normalizeSubscriber);
}

export function buildEndpointStats(subscribers, messagingUsers, sipAlgWarningCount = 0) {
  const subs = normalizeSubscriberList(subscribers);
  const online = subs.filter((s) => s.online_status === 'online').length;
  const offline = subs.filter((s) => s.online_status === 'offline').length;
  const noDevice = subs.filter((s) => s.online_status === 'no_device').length;
  const unknown = subs.length - online - offline - noDevice;

  return {
    totalExtensions: subs.length,
    onlineExtensions: online,
    offlineExtensions: offline,
    noDeviceExtensions: noDevice,
    unknownStatusExtensions: unknown,
    messagingUsers: toArray(messagingUsers).length,
    sipAlgWarnings: sipAlgWarningCount,
    activeCalls: 0,
  };
}

export function indexE911ByPhone(endpoints) {
  const map = new Map();
  for (const item of toArray(endpoints)) {
    const key = normalizePhoneKey(item.phone_number);
    if (key) map.set(key, item);
  }
  return map;
}

export function indexSubscribersByExtension(subscribers) {
  const map = new Map();
  for (const sub of normalizeSubscriberList(subscribers)) {
    const ext = String(sub.user || '').toLowerCase();
    if (ext) map.set(ext, sub);
    const callerKey = normalizePhoneKey(sub.caller_id);
    if (callerKey) map.set(`phone:${callerKey}`, sub);
  }
  return map;
}

export function filterE911ForDomain(subscribers, e911Endpoints) {
  const keys = new Set();
  for (const sub of normalizeSubscriberList(subscribers)) {
    const key = normalizePhoneKey(sub.caller_id);
    if (key) keys.add(key);
  }
  if (!keys.size) return [];
  return toArray(e911Endpoints).filter((item) => {
    const key = normalizePhoneKey(item.phone_number);
    return key && keys.has(key);
  });
}

export function filterTrunkGroupsForDomain(trunkGroups, domain) {
  const rows = toArray(trunkGroups);
  if (!domain) return rows;
  const withDomain = rows.filter((item) => item?.domain != null && item.domain !== '');
  if (!withDomain.length) return [];
  const target = String(domain).trim().toLowerCase();
  return rows.filter((item) => String(item.domain || '').trim().toLowerCase() === target);
}

/** Domain DIDs with E911 status — E911 is provisioned per phone number, not PBX extension. */
export function buildE911DomainPhoneRows(phoneNumbers, e911Endpoints) {
  const e911ByPhone = indexE911ByPhone(e911Endpoints);
  return toArray(phoneNumbers).map((item) => {
    const raw = phoneListItemNumber(item);
    const phone11 = toE911Phone11(raw);
    const lookupKey = normalizePhoneKey(phone11 || raw);
    const e911 = lookupKey ? e911ByPhone.get(lookupKey) : null;
    const civic = e911?.location?.address?.civic_address || {};
    const los = e911?.location?.level_of_service || {};

    return {
      phone_number: phone11 || raw,
      e911_status: e911 ? 'Provisioned' : 'Not provisioned',
      routing_status: los.routing_status || '—',
      location: civic.city ? [civic.city, civic.state].filter(Boolean).join(', ') : '—',
      name: civic.name || '—',
      msag_status: los.msag_status || '—',
    };
  });
}

/** Merge subscriber + E911 for domain-scoped operational review. */
export function buildE911DomainReview(subscribers, e911Endpoints, domain) {
  const e911ByPhone = indexE911ByPhone(e911Endpoints);
  const rows = normalizeSubscriberList(subscribers).map((sub) => {
    const callerKey = normalizePhoneKey(sub.caller_id);
    const e911 = callerKey ? e911ByPhone.get(callerKey) : null;
    const dialableCallerId = callerKey ? sub.caller_id : null;
    const civic = e911?.location?.address?.civic_address || {};
    const los = e911?.location?.level_of_service || {};
    const locationLabel = civic.city
      ? [civic.city, civic.state].filter(Boolean).join(', ')
      : e911
        ? 'Provisioned'
        : 'E911 disabled';

    return {
      extension: sub.user,
      name: sub.name,
      caller_id: sub.caller_id,
      site: sub.site,
      wan_ip: sub.wan_ip,
      phone_number: e911?.phone_number || dialableCallerId || null,
      e911_status: e911 ? 'Provisioned' : 'Not provisioned',
      routing_status: los.routing_status || '—',
      registration_status:
        sub.online_status === 'online'
          ? 'Registered'
          : sub.online_status === 'offline'
            ? sub.downtime
              ? `Unregistered (${sub.downtime})`
              : 'Unregistered'
            : 'Unknown',
      online_status: sub.online_status,
      location: locationLabel,
      notes: sub.notes || '—',
      department: sub.department,
      scope: sub.scope,
    };
  });

  const wanGroups = new Map();
  for (const row of rows) {
    const wan = row.wan_ip || 'Unknown WAN';
    if (!wanGroups.has(wan)) {
      wanGroups.set(wan, { wan_ip: wan, endpoints: 0, e911_disabled: 0, registered: 0, unregistered: 0 });
    }
    const g = wanGroups.get(wan);
    g.endpoints += 1;
    if (row.e911_status !== 'Provisioned') g.e911_disabled += 1;
    if (row.online_status === 'online') g.registered += 1;
    if (row.online_status === 'offline') g.unregistered += 1;
  }

  return {
    domain,
    rows,
    summary: {
      visibleEndpoints: rows.length,
      wanGroups: wanGroups.size,
      registered: rows.filter((r) => r.online_status === 'online').length,
      unregistered: rows.filter((r) => r.online_status === 'offline').length,
    },
    wanGroups: [...wanGroups.values()].sort((a, b) => a.wan_ip.localeCompare(b.wan_ip)),
  };
}

export function buildExtensionOfflineRows(subscribers) {
  return normalizeSubscriberList(subscribers)
    .filter((sub) => sub.online_status === 'offline' || sub.is_offline)
    .map((sub) => ({
      extension: sub.user,
      name: sub.name,
      email: sub.email_address,
      site: sub.site,
      department: sub.department,
      caller_id: sub.caller_id,
      downtime: sub.downtime || '—',
      notes: sub.notes || '—',
      filtered: sub.filtered ?? '—',
      email_report_status: sub.email_report_status ?? '—',
      online_status: sub.online_status,
    }));
}

const MOS_JOURNAL_PATTERN = /mos|qos|quality|mean opinion/i;

export function filterMosJournalRows(journalResponse) {
  const list = toArray(journalResponse?.data ?? journalResponse);
  return list
    .filter((row) => {
      const haystack = [
        row.module,
        row.type,
        row.action,
        row.identifier,
        row.message,
        row.description,
        JSON.stringify(row.data || row.payload || {}),
      ]
        .filter(Boolean)
        .join(' ');
      return MOS_JOURNAL_PATTERN.test(haystack) || row.qos != null || row.mos != null;
    })
    .map((row) => ({
      id: row.id,
      date: row.created_at || row.timestamp || row.date,
      from: pick(row, 'from', 'ani', 'caller', 'source'),
      to: pick(row, 'to', 'dnis', 'destination', 'target'),
      dialed: pick(row, 'dialed', 'dnis'),
      qos: pick(row, 'qos', 'mos', 'score'),
      duration: pick(row, 'duration', 'call_duration'),
      module: row.module,
      type: row.type,
      action: row.action,
    }));
}

export function countSipAlgWarnings(sipAlgSettings) {
  const settings = sipAlgSettings?.settings || [];
  return settings.filter((item) => {
    const val = String(item.config_value ?? item.value ?? '').toLowerCase();
    const name = String(item.config_name || '').toLowerCase();
    return name.includes('alg') && (val === 'true' || val === '1' || val === 'enabled' || val === 'on');
  }).length;
}
