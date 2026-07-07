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

export function normalizeCdrRows(xml) {
  return nodeList(xml, 'cdr').map((row) => {
    const duration = numeric(row.duration);
    const talkTime = numeric(row.time_talking);
    return {
      id: row.cdr_id || `${row.orig_sub || 'unknown'}-${row.time_start || Math.random()}`,
      cdr_id: row.cdr_id || null,
      domain: row.domain || null,
      type: row.type || null,
      direction: row.orig_sub && row.term_sub && row.orig_sub !== row.term_sub ? 'external' : 'internal',
      from: row.orig_from_name || row.orig_sub || row.orig_from_uri || null,
      from_number: row.orig_from_uri || row.orig_sub || null,
      to: row.term_to_name || row.term_sub || row.term_to_uri || row.orig_to_user || null,
      to_number: row.term_to_uri || row.orig_req_uri || null,
      by_sub: row.by_sub || null,
      orig_sub: row.orig_sub || null,
      term_sub: row.term_sub || null,
      start_at: epochToIso(row.time_start),
      answer_at: epochToIso(row.time_answer),
      end_at: epochToIso(row.time_release),
      duration_seconds: duration,
      talk_seconds: talkTime,
      duration_label: duration == null ? '—' : `${duration}s`,
      talk_label: talkTime == null ? '—' : `${talkTime}s`,
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

function phoneStatus(row) {
  if (row?.contact || row?.registration_time || row?.registration_expires_time) return 'online';
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
  if (row?.registration_time || row?.received_from) return 'online';
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
      registration_time: cleanValue(row.registration_time),
      registration_expires_time: cleanValue(row.registration_expires_time),
      subscriber_name: extension,
      hostname: cleanValue(row.hostname),
      subscriber_domain: cleanValue(row.subscriber_domain),
      sub_fullname: cleanValue(row.sub_fullname),
      sub_login: cleanValue(row.sub_login),
      mode: cleanValue(row.mode),
      call_processing_rule: cleanValue(row.call_processing_rule),
      online_status: deviceOnlineStatus(row),
      raw: row,
    };
  });
}
