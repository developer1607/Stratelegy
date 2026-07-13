import { nodeList } from './client.js';

function numeric(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function epochToIso(value) {
  const num = numeric(value);
  if (!num) return null;
  return new Date(num * 1000).toISOString();
}

function csvEscape(value) {
  const text = String(value ?? '');
  if (text.includes('"') || text.includes(',') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function normalizePbxTokenInfo(status) {
  return {
    configured: Boolean(status?.configured),
    connected: Boolean(status?.connected),
    baseUrl: status?.baseUrl || null,
    scope: status?.scope || null,
    domain: status?.domain || null,
    apiVersion: status?.apiVersion || null,
    message: status?.message || null,
  };
}

/**
 * SkySwitch/NQS CDR qos blobs use MOS × 10 (e.g. a_mos_min_mult10=45 → 4.5).
 * @see apiDocumentationPBX.md cdr2 read with raw=yes&qos=yes → qos_orig / qos_term objects
 */
function mosFromMult10(...values) {
  const scores = [];
  for (const value of values) {
    if (value == null || value === '') continue;
    const num = Number(value);
    if (!Number.isFinite(num)) continue;
    // Values like 45 mean 4.5; already-scaled 1–5 also accepted.
    const mos = num > 5 ? num / 10 : num;
    if (mos >= 0 && mos <= 5) scores.push(Math.round(mos * 10) / 10);
  }
  if (!scores.length) return null;
  // Prefer worst-leg score so poor quality is visible in the list.
  return Math.min(...scores);
}

function pickCdrQosScore(row) {
  if (row == null || row === '') return null;
  if (typeof row !== 'object') {
    const num = Number(row);
    if (!Number.isFinite(num)) return null;
    if (num > 5 && num <= 50) return Math.round((num / 10) * 10) / 10;
    if (num >= 0 && num <= 5) return Math.round(num * 10) / 10;
    return null;
  }

  // Nested NQS objects on qos_orig / qos_term (most common live shape).
  const fromMult10 = mosFromMult10(
    row.a_mos_min_mult10,
    row.b_mos_min_mult10,
    row.a_mos_mult10,
    row.b_mos_mult10,
    row.mos_min_mult10,
    row.mos_mult10
  );
  if (fromMult10 != null) return fromMult10;

  const candidates = [
    row.mos,
    row.qos,
    row.mos_lq,
    row.mos_cq,
    row.orig_mos,
    row.term_mos,
    row.a_mos,
    row.b_mos,
    row.qos_mos,
    row.mean_opinion_score,
    row?.qos_stats?.mos,
    row?.rtcp?.mos,
    row?.raw?.mos,
    row?.raw?.qos,
    row.qos_orig,
    row.qos_term,
  ];
  for (const value of candidates) {
    if (value == null || value === '') continue;
    if (typeof value === 'object') {
      const nested = pickCdrQosScore(value);
      if (nested != null) return nested;
      continue;
    }
    const nested = pickCdrQosScore(value);
    if (nested != null) return nested;
  }
  return null;
}

function formatDurationMmSs(totalSeconds) {
  const sec = Number(totalSeconds);
  if (!Number.isFinite(sec) || sec < 0) return null;
  const mins = Math.floor(sec / 60);
  const rem = Math.floor(sec % 60);
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function normalizeCdrRows(xml) {
  return nodeList(xml, 'cdr').map((row) => {
    const duration = numeric(row.duration);
    const talkTime = numeric(row.time_talking);
    const qosOrig = pickCdrQosScore(row.qos_orig) ?? pickCdrQosScore({
      mos: row.orig_mos || row.a_mos || row.mos_lq,
      qos: row.orig_qos,
    });
    const qosTerm = pickCdrQosScore(row.qos_term) ?? pickCdrQosScore({
      mos: row.term_mos || row.b_mos || row.mos_cq,
      qos: row.term_qos,
    });
    const qos = qosOrig ?? qosTerm ?? pickCdrQosScore(row);
    return {
      id: row.cdr_id || `${row.orig_sub || 'unknown'}-${row.time_start || Math.random()}`,
      cdr_id: row.cdr_id || null,
      domain: row.domain || null,
      type: row.type || null,
      direction: row.orig_sub && row.term_sub && row.orig_sub !== row.term_sub ? 'external' : 'internal',
      from: row.orig_from_name || row.orig_sub || row.orig_from_uri || null,
      from_name: row.orig_from_name || null,
      from_number: row.orig_from_uri || row.orig_sub || null,
      to: row.term_to_name || row.term_sub || row.term_to_uri || row.orig_to_user || null,
      to_number: row.term_to_uri || row.orig_req_uri || null,
      dialed: row.orig_to_user || row.orig_req_user || row.term_to_uri || null,
      by_sub: row.by_sub || null,
      orig_sub: row.orig_sub || null,
      term_sub: row.term_sub || null,
      start_at: epochToIso(row.time_start),
      answer_at: epochToIso(row.time_answer),
      end_at: epochToIso(row.time_release),
      duration_seconds: duration,
      talk_seconds: talkTime,
      duration_label: duration == null ? '—' : `${duration}s`,
      duration_mmss: formatDurationMmSs(duration) || formatDurationMmSs(talkTime),
      talk_label: talkTime == null ? '—' : `${talkTime}s`,
      qos,
      qos_orig: qosOrig,
      qos_term: qosTerm,
      expected_trace: row.expected_trace || null,
      raw: row,
    };
  });
}

export function cdrRowsToCsv(rows) {
  const headers = [
    'start_at',
    'end_at',
    'domain',
    'from',
    'from_number',
    'to',
    'to_number',
    'duration_seconds',
    'talk_seconds',
    'type',
    'cdr_id',
  ];
  const lines = [
    headers.join(','),
    ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(',')),
  ];
  return lines.join('\n');
}

/**
 * Parse NetSapiens/SkySwitch registration datetimes.
 * Absolute times (unix seconds/ms or "YYYY-MM-DD HH:mm:ss") only — not TTL `expires`
 * (which is seconds between re-registers, typically 30–180).
 * @see apiDocumentationPBX.md device.expires vs mac.registration_expires_time
 */
export function parseRegistrationTimestamp(value) {
  if (value == null || value === '') return null;
  if (value instanceof Date) {
    const ms = value.getTime();
    return Number.isFinite(ms) ? ms : null;
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null;
    // Tiny values are TTL seconds (device.expires), not epoch timestamps.
    if (value < 1e9) return null;
    return value < 1e12 ? value * 1000 : value;
  }
  const text = String(value).trim();
  if (!text || /^n\/?a$/i.test(text)) return null;
  if (/^\d+(\.\d+)?$/.test(text)) {
    const num = Number(text);
    if (!Number.isFinite(num) || num <= 0 || num < 1e9) return null;
    return num < 1e12 ? num * 1000 : num;
  }
  // NetSapiens/SkySwitch often emit naive datetimes: "2018-06-29 15:27:16"
  // Treat timezone-less values as UTC so status doesn't depend on server local TZ.
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    const iso = `${text.replace(' ', 'T')}${text.length === 16 ? ':00' : ''}Z`;
    const utcMs = Date.parse(iso);
    return Number.isFinite(utcMs) ? utcMs : null;
  }
  const ms = Date.parse(text);
  return Number.isFinite(ms) ? ms : null;
}

function hasLiveSipBinding(value) {
  if (value == null) return false;
  const text = String(value).trim();
  if (!text) return false;
  if (/^n\/?a$/i.test(text)) return false;
  if (/^null$/i.test(text)) return false;
  return true;
}

/**
 * Whether a device/phone looks currently registered.
 *
 * NetSapiens guidance (device-sip-registration-state):
 * - "registered" when the device is within the valid registration time window
 * - expires datetime should be in the future for actively registered devices
 * Legacy PBX fields (DeviceLegacy / mac read): received_from, contact,
 * registration_time, registration_expires_time; separate `expires` is TTL seconds.
 *
 * Precedence used by Insight (matches NetSapiens window semantics):
 * 1. Absolute registration_expires_time present → Online only if still future (+ grace).
 *    Past expiry is Offline even if received_from/contact linger (last-known binding).
 * 2. No absolute expiry → Online if contact/received_from present (legacy live signal)
 * 3. Else registration_time within TTL `expires` or a short recent window
 */
export function isRegistrationCurrentlyActive({
  contact = null,
  received_from = null,
  registration_time = null,
  registration_expires_time = null,
  expires_ttl_seconds = null,
} = {}) {
  const hasBinding =
    hasLiveSipBinding(contact) || hasLiveSipBinding(received_from);
  const now = Date.now();
  // NetSapiens notes a system-wide grace period beyond the requested window.
  const GRACE_MS = 90_000;

  const expiresMs = parseRegistrationTimestamp(registration_expires_time);
  if (expiresMs != null) {
    return expiresMs + GRACE_MS > now;
  }

  if (hasBinding) return true;

  const registeredMs = parseRegistrationTimestamp(registration_time);
  if (registeredMs == null) return false;

  const ttlSec = Number(expires_ttl_seconds);
  if (Number.isFinite(ttlSec) && ttlSec > 0 && ttlSec < 1e6) {
    return registeredMs + ttlSec * 1000 + GRACE_MS > now;
  }

  // No absolute expiry and no live binding: only trust a recent registration_time.
  const RECENT_WITHOUT_EXPIRES_MS = 2 * 60 * 60 * 1000;
  return registeredMs + RECENT_WITHOUT_EXPIRES_MS + GRACE_MS > now;
}

function phoneStatus(row) {
  if (
    isRegistrationCurrentlyActive({
      contact: row?.contact,
      registration_time: row?.registration_time,
      registration_expires_time: row?.registration_expires_time,
      expires_ttl_seconds: row?.expires,
    })
  ) {
    return 'online';
  }
  return 'offline';
}

/** PBX MAC `server` is the reseller/territory id — not the geo node label shown in Endpoint Control. */
export function isDisplayableGeoNode(value) {
  if (value == null) return false;
  const text = String(value).trim();
  if (!text) return false;
  if (/^\d{4,6}$/.test(text)) return false;
  if (/^sipbx$/i.test(text)) return false;
  return true;
}

/** e.g. nms7-las.dialtoen.com -> LAS - NMS7 */
export function formatGeoNodeFromHostname(hostname) {
  if (!hostname) return null;
  const label = String(hostname).trim().toLowerCase().split('.')[0];
  const match = label.match(/^nms(\d+)-([a-z]{3})$/i);
  if (!match) return null;
  const [, num, site] = match;
  return `${site.toUpperCase()} - NMS${num}`;
}

export function resolveGeoNode({ legacy = null, phone = null, device = null, base = null } = {}) {
  const candidates = [
    legacy?.geo_node,
    base?.geo_node,
    formatGeoNodeFromHostname(phone?.hostname || phone?.raw?.hostname),
    formatGeoNodeFromHostname(device?.hostname || device?.raw?.hostname),
  ];
  for (const value of candidates) {
    if (isDisplayableGeoNode(value)) return value;
  }
  return null;
}

const WARNING_HINT = /sip\s*alg|alg\s*detect|warning|unregistered|fail|error|mismatch|invalid/i;

function identityTokens({ base = null, legacy = null } = {}) {
  const tokens = new Set();
  for (const value of [
    base?.user,
    base?.subscriber_login,
    base?.name,
    legacy?.user,
    legacy?.subscriber_login,
    legacy?.name,
  ]) {
    const text = cleanValue(value);
    if (text) tokens.add(text.toLowerCase());
  }
  return tokens;
}

/** Endpoint Control warning — never use subscriber `message` (often login/username). */
export function resolveEndpointWarning({ base = null, legacy = null, phone = null } = {}) {
  const identities = identityTokens({ base, legacy });
  const candidates = [
    legacy?.warning,
    base?.raw?.warning,
    phone?.raw?.warning,
    phone?.overrides,
  ];

  for (const value of candidates) {
    const text = cleanValue(value);
    if (!text) continue;
    const lower = text.toLowerCase();
    if (identities.has(lower)) continue;
    if ([...identities].some((token) => token && lower === token)) continue;
    if (WARNING_HINT.test(text)) return text;
  }
  return null;
}

export function normalizePhoneRows(xml) {
  return nodeList(xml, 'mac').map((row) => {
    const devices = [row.device1, row.device2, row.device3, row.device4, row.device5, row.device6, row.device7, row.device8]
      .filter(Boolean)
      .filter((value) => String(value).toLowerCase() !== 'n/a');
    const lineFields = [
      row.phone_ext,
      row.line1_ext,
      row.line2_ext,
      row.line3_ext,
      row.line4_ext,
      row.line5_ext,
      row.line6_ext,
    ];
    const lines = lineFields
      .filter(Boolean)
      .filter((value) => String(value).toLowerCase() !== 'n/a');
    if (!lines.length && devices[0]) {
      const sipMatch = String(devices[0]).match(/sip:([^@]+)@/i);
      if (sipMatch?.[1]) lines.push(sipMatch[1]);
    }
    const status = phoneStatus(row);
    return {
      id: row.mac || `${row.domain || 'phone'}-${devices[0] || Math.random()}`,
      mac: row.mac || null,
      domain: row.domain || null,
      model: row.model || null,
      server: row.server || null,
      hostname: cleanValue(row.hostname),
      territory: row.territory || null,
      transport: row.transport || null,
      notes: row.notes || null,
      overrides: cleanValue(row.overrides),
      primary_device: devices[0] || null,
      devices,
      primary_line: lines[0] || null,
      lines,
      contact: row.contact || null,
      user_agent: row.user_agent || null,
      registration_time: row.registration_time || null,
      registration_expires_time: row.registration_expires_time || null,
      expires: numeric(row.expires),
      resync: row.resync || null,
      presence: row.presence || null,
      sidecar: row.sidecar || null,
      phone_ext: cleanValue(row.phone_ext),
      directory_support: row.directory_support || null,
      online_status: status,
      raw: row,
    };
  });
}

function cleanValue(value) {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  if (text.toLowerCase() === 'n/a') return null;
  return text;
}

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function phoneMatchSuffix(value) {
  const digits = digitsOnly(value);
  if (digits.length >= 10) return digits.slice(-10);
  return digits || null;
}

function boolYes(value) {
  return String(value ?? '').toLowerCase() === 'yes';
}

export function formatWanLan({ device = null, phone = null } = {}) {
  const wan = cleanValue(device?.received_from) || null;
  let lan = null;
  const contact = cleanValue(phone?.contact);
  if (contact) {
    const hostMatch = contact.match(/@([^:;>]+)(?::(\d+))?/);
    if (hostMatch) {
      const host = hostMatch[1];
      const port = hostMatch[2];
      lan = port ? `${host}:${port}` : host;
    }
  }
  if (wan && lan && wan === lan) return wan;
  if (wan && lan) return `${wan} / ${lan}`;
  return wan || lan || null;
}

export function normalizePbxSubscriberRows(xml) {
  return nodeList(xml, 'subscriber').map((row) => {
    const extension = cleanValue(row.user) || cleanValue(row.dir);
    const firstName = cleanValue(row.first_name);
    const lastName = cleanValue(row.last_name);
    const fullName = [firstName, lastName].filter(Boolean).join(' ');
    const callerId = cleanValue(row.callid_nmbr);
    const e911CallerId = cleanValue(row.callid_emgr) || callerId;
    const features = [];
    if (boolYes(row.vmail_enabled) || boolYes(row.vmail_provisioned)) features.push('VM');
    if (boolYes(row.screen)) features.push('Screen');
    if (boolYes(row.vmail_transcribe)) features.push('TR');
    if (boolYes(row.ntfy_missed_call)) features.push('MC');
    return {
      id: `${cleanValue(row.domain) || 'domain'}:${extension || cleanValue(row.subscriber_login) || Math.random()}`,
      user: extension,
      dir: cleanValue(row.dir),
      domain: cleanValue(row.domain),
      name: fullName || cleanValue(row.name) || extension,
      first_name: firstName,
      last_name: lastName,
      subscriber_login: cleanValue(row.subscriber_login),
      email_address: cleanValue(row.email),
      caller_id: callerId,
      caller_id_name: cleanValue(row.callid_name),
      e911_caller_id: e911CallerId,
      scope: cleanValue(row.scope),
      site: cleanValue(row.site),
      department: cleanValue(row.group),
      language: cleanValue(row.language),
      time_zone: cleanValue(row.time_zone),
      area_code: cleanValue(row.area_code),
      account_status: cleanValue(row.account_status),
      presence: cleanValue(row.presence),
      srv_code: cleanValue(row.srv_code),
      transport: null,
      geo_node: null,
      wan_ip: null,
      wan_lan: null,
      mac_address: null,
      model: null,
      notes: cleanValue(row.message),
      vm_pin: cleanValue(row.subscriber_pin) || cleanValue(row.pwd),
      dial_policy: cleanValue(row.dial_policy),
      dial_plan: cleanValue(row.dial_plan),
      vmail_enabled: boolYes(row.vmail_enabled) || boolYes(row.vmail_provisioned),
      vmail_notify: cleanValue(row.vmail_notify),
      no_answer_timeout: cleanValue(row.no_answer_timeout),
      last_update: cleanValue(row.last_update),
      features,
      warning: null,
      online_status: null,
      raw: row,
      phone_match_key: phoneMatchSuffix(callerId),
      e911_match_key: phoneMatchSuffix(e911CallerId),
    };
  });
}

function deviceOnlineStatus(row) {
  if (
    isRegistrationCurrentlyActive({
      contact: row?.contact,
      received_from: row?.received_from,
      registration_time: row?.registration_time,
      registration_expires_time: row?.registration_expires_time,
      expires_ttl_seconds: row?.expires,
    })
  ) {
    return 'online';
  }
  return 'offline';
}

export function normalizeDeviceRows(xml) {
  return nodeList(xml, 'device').map((row) => {
    const extension = cleanValue(row.subscriber_name) || cleanValue(row.sub_login)?.split('~')[0];
    return {
      id: row.aor || row.device || `${row.subscriber_domain || 'device'}-${extension || Math.random()}`,
      aor: cleanValue(row.aor),
      device: cleanValue(row.device),
      user_agent: cleanValue(row.user_agent),
      received_from: cleanValue(row.received_from),
      contact: cleanValue(row.contact),
      registration_time: cleanValue(row.registration_time),
      registration_expires_time: cleanValue(row.registration_expires_time),
      expires: numeric(row.expires),
      subscriber_name: extension,
      hostname: cleanValue(row.hostname),
      subscriber_domain: cleanValue(row.subscriber_domain),
      sub_fullname: cleanValue(row.sub_fullname),
      sub_login: cleanValue(row.sub_login),
      mode: cleanValue(row.mode),
      call_processing_rule: cleanValue(row.call_processing_rule),
      online_status: deviceOnlineStatus({
        received_from: cleanValue(row.received_from),
        contact: cleanValue(row.contact),
        registration_time: cleanValue(row.registration_time),
        registration_expires_time: cleanValue(row.registration_expires_time),
        expires: numeric(row.expires),
      }),
      raw: row,
    };
  });
}
