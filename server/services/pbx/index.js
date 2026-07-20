import { config } from '../../config.js';
import { getCachedPbxTokenMetadata, pbxIsConfigured } from './auth.js';
import { nodeList, pbxRequest } from './client.js';
import {
  cdrRowsToCsv,
  normalizeCdrRows,
  normalizeDeviceRows,
  normalizePbxSubscriberRows,
  normalizePbxTokenInfo,
  normalizePhoneRows,
  formatWanLan,
  resolveGeoNode,
  resolveEndpointWarning,
  isRegistrationCurrentlyActive,
} from './normalize.js';
import * as legacyPbx from '../skyswitch/pbx.js';
import { buildEndpointStats, buildExtensionOfflineRows } from '../skyswitch/pbxEnrichment.js';

export { cdrRowsToCsv };

function v2Path(path) {
  return `v2/${String(path || '').replace(/^\/+/, '')}`;
}

async function pbxRequestV2(method, path, { body } = {}) {
  return pbxRequest(method, v2Path(path), {
    body: body == null ? undefined : JSON.stringify(body),
    contentType: body == null ? null : 'application/json',
    parseAs: 'json',
  });
}

function aorForUser(domain, user) {
  return `${user}@${domain}`;
}

function normalizeSiteOptions(rows) {
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list
    .map((row) => {
      if (typeof row === 'string') return row;
      return row?.site || row?.name || row?.['site-name'] || null;
    })
    .filter(Boolean)
    .sort((a, b) => String(a).localeCompare(String(b)));
}

function normalizeVoicemailItems(items, folder) {
  const list = Array.isArray(items) ? items : items ? [items] : [];
  return list.map((item) => ({
    folder,
    id: item?.filename || item?.id || `${folder}-${Math.random()}`,
    filename: item?.filename || null,
    received_at: item?.['created-datetime'] || item?.created || item?.time || null,
    duration_seconds: item?.['duration-seconds'] ?? item?.duration ?? null,
    from: item?.['caller-id-number'] || item?.from || item?.ani || null,
    transcription: item?.transcription || item?.message || null,
    file_url: item?.url || item?.['audio-file-url'] || null,
    raw: item,
  }));
}

function normalizeGroupMembership(rows, user, domain) {
  const agentId = aorForUser(domain, user).toLowerCase();
  const list = Array.isArray(rows) ? rows : rows ? [rows] : [];
  return list
    .filter((row) => {
      const value = String(row?.['callqueue-agent-id'] || row?.agent || '').toLowerCase();
      return value === agentId;
    })
    .map((row) => ({
      queue: row?.callqueue || row?.['callqueue-id'] || row?.queue || null,
      queue_name: row?.description || row?.['callqueue-name'] || row?.name || null,
      status:
        row?.['callqueue-agent-availability-for-dispatch'] ||
        row?.['agent-status'] ||
        row?.status ||
        null,
      availability_type: row?.['callqueue-agent-availability-type'] || null,
      wrap_up_seconds: row?.['callqueue-agent-wrap-up-allowance-seconds'] ?? null,
      raw: row,
    }));
}

function getPbxTerritory() {
  const tokenDomain = String(getCachedPbxTokenMetadata()?.domain || '');
  const fromDomain = tokenDomain.match(/\.([0-9]+)\.service$/)?.[1];
  if (fromDomain) return fromDomain;
  const fromClientId = String(config.pbx.clientId || '').match(/^([0-9]+)\./)?.[1];
  return fromClientId || null;
}

export async function getPbxApiStatus() {
  if (!pbxIsConfigured()) {
    return normalizePbxTokenInfo({
      configured: false,
      connected: false,
      message: 'PBX credentials not configured',
    });
  }

  try {
    await pbxRequest('POST', 'oauth2/read?format=json', {
      parseAs: 'json',
    });
    const metadata = getCachedPbxTokenMetadata();
    return normalizePbxTokenInfo({
      configured: true,
      connected: true,
      baseUrl: config.pbx.apiBaseUrl,
      scope: metadata?.scope || null,
      domain: metadata?.domain || null,
      apiVersion: metadata?.apiVersion || null,
    });
  } catch (err) {
    return normalizePbxTokenInfo({
      configured: true,
      connected: false,
      baseUrl: config.pbx.apiBaseUrl,
      message: err?.message || 'PBX API unreachable',
    });
  }
}

export async function listCdrs({
  startDate,
  endDate,
  domain,
  user,
  type,
  raw,
  qos,
  page = 1,
  perPage = 50,
} = {}) {
  const params = new URLSearchParams({
    object: 'cdr2',
    action: 'read',
    start: String(Math.max(0, (Number(page) - 1) * Number(perPage || 50))),
    limit: String(Number(perPage) || 50),
  });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  if (domain) params.set('domain', domain);
  if (user) params.set('user', user);
  if (type) params.set('type', type);
  if (raw != null && raw !== '') params.set('raw', String(raw));
  if (qos != null && qos !== '') params.set('qos', String(qos));

  const xml = await pbxRequest('POST', '', {
    body: params,
  });
  const rows = normalizeCdrRows(xml);

  return {
    page: Number(page) || 1,
    perPage: Number(perPage) || 50,
    rowCount: rows.length,
    hasMore: rows.length === (Number(perPage) || 50),
    rows,
  };
}

/** MOS/QOS scores from domain CDRs (cdr2 with qos=yes), not journals. */
export async function getMosScores({
  startDate,
  endDate,
  domain,
  page = 1,
  perPage = 100,
} = {}) {
  if (!domain) {
    const err = new Error('domain is required for MOS scores');
    err.status = 400;
    throw err;
  }
  const end = endDate || new Date().toISOString().slice(0, 10);
  const start = startDate || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const data = await listCdrs({
    startDate: start,
    endDate: end,
    domain,
    raw: 'yes',
    qos: 'yes',
    page,
    perPage,
  });
  const cdrRows = data.rows || [];
  const rows = cdrRows
    .map((row) => {
      const qos = row.qos ?? row.qos_orig ?? row.qos_term;
      return {
        id: row.id || row.cdr_id,
        date: row.start_at || row.answer_at,
        from_name: row.from_name || row.from || null,
        from: row.from_number || row.from || null,
        dialed: row.dialed || row.to_number || null,
        to: row.to || row.term_sub || null,
        qos,
        qos_orig: row.qos_orig ?? qos,
        qos_term: row.qos_term ?? qos,
        duration: row.duration_mmss || row.duration_label || null,
        duration_seconds: row.duration_seconds,
        module: 'cdr',
        type: row.type,
        action: row.direction,
      };
    })
    .filter((row) => row.qos != null || row.qos_orig != null || row.qos_term != null);

  // If QoS fields weren't present in this page, still return CDR rows so the UI can show activity
  // and operators can widen the date range / confirm qos flags.
  const displayRows =
    rows.length > 0
      ? rows
      : cdrRows.map((row) => ({
          id: row.id || row.cdr_id,
          date: row.start_at || row.answer_at,
          from_name: row.from_name || row.from || null,
          from: row.from_number || row.from || null,
          dialed: row.dialed || row.to_number || null,
          to: row.to || row.term_sub || null,
          qos: null,
          qos_orig: null,
          qos_term: null,
          duration: row.duration_mmss || row.duration_label || null,
          duration_seconds: row.duration_seconds,
          module: 'cdr',
          type: row.type,
          action: row.direction,
        }));

  return {
    startDate: start,
    endDate: end,
    domain,
    rows: displayRows,
    total: displayRows.length,
    rawCount: cdrRows.length,
    qosCount: rows.length,
    page: data.page,
    perPage: data.perPage,
    source: 'cdr',
  };
}

export async function listDevices(domain, user, { start = 0, limit } = {}) {
  const params = new URLSearchParams({
    object: 'device',
    action: 'read',
    owner_domain: domain,
    start: String(Math.max(0, Number(start) || 0)),
    limit: String(limit ?? (user ? 50 : 500)),
  });
  if (user) params.set('owner', user);
  const xml = await pbxRequest('POST', '', { body: params });
  return normalizeDeviceRows(xml);
}

/** Paginate device read until a page is short (NetSapiens owner_domain read). */
export async function listAllDevices(domain, { pageSize = 500 } = {}) {
  const rows = [];
  let start = 0;
  const limit = Math.max(1, Number(pageSize) || 500);
  while (true) {
    const batch = await listDevices(domain, null, { start, limit });
    rows.push(...batch);
    if (batch.length < limit) break;
    start += batch.length;
  }
  return rows;
}

export async function getSubscriber(domain, user) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'subscriber',
      action: 'read',
      domain,
      user,
      limit: '1',
    }),
  });
  return normalizePbxSubscriberRows(xml)[0] || null;
}

export async function getSubscriberProfile(domain, user) {
  return pbxRequestV2('GET', `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}`);
}

export async function listSites(domain) {
  try {
    const data = await pbxRequestV2('GET', `domains/${encodeURIComponent(domain)}/sites`);
    const options = normalizeSiteOptions(data);
    if (options.length) return options;
  } catch {
    // v2 sites API is not available on all SkySwitch deployments
  }

  try {
    const xml = await pbxRequest('POST', '', {
      body: new URLSearchParams({
        object: 'site',
        action: 'read',
        domain,
      }),
    });
    return normalizeSiteOptions(nodeList(xml, 'site'));
  } catch {
    return [];
  }
}

export async function getSubscriberVoicemail(domain, user) {
  const folders = ['new', 'save', 'trash'];
  const results = await Promise.all(
    folders.map(async (folder) => {
      try {
        const data = await pbxRequestV2(
          'GET',
          `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}/voicemails/${folder}`
        );
        const items = normalizeVoicemailItems(data, folder);
        return {
          folder,
          count: items.length,
          items,
        };
      } catch {
        return {
          folder,
          count: 0,
          items: [],
        };
      }
    })
  );

  return {
    user,
    domain,
    total: results.reduce((sum, row) => sum + row.count, 0),
    folders: results,
  };
}

function normalizeRecordingConfiguration(value) {
  const text = String(value ?? '').trim().toLowerCase();
  if (!text || text === 'no') return 'no';
  return text;
}

export async function getSubscriberMonitoring(domain, user) {
  const profile = await getSubscriberProfile(domain, user).catch(() => null);
  const configuration = normalizeRecordingConfiguration(profile?.['recording-configuration']);
  const enabled = configuration !== 'no';

  // v1 recording read is unreliable on this portal (often empty while enabled).
  const recordingRows = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'recording',
      action: 'read',
      aor: aorForUser(domain, user),
    }),
    parseAs: 'json',
  }).catch(() => []);

  return {
    user,
    domain,
    enabled,
    configuration,
    raw: {
      profile: profile
        ? {
            'recording-configuration': profile['recording-configuration'] || null,
          }
        : null,
      recording: Array.isArray(recordingRows) ? recordingRows : recordingRows ? [recordingRows] : [],
    },
  };
}

export async function setSubscriberMonitoring(domain, user, enabled) {
  const params = new URLSearchParams({
    object: 'recording',
    action: enabled ? 'create' : 'delete',
    aor: aorForUser(domain, user),
  });
  if (enabled) params.set('recording-configuration', 'yes');

  await pbxRequest('POST', '', {
    body: params,
    parseAs: 'json',
  });

  return getSubscriberMonitoring(domain, user);
}

export async function getSubscriberGroups(domain, user) {
  const data = await pbxRequestV2('GET', `domains/${encodeURIComponent(domain)}/agents`).catch(() => []);
  const groups = normalizeGroupMembership(data, user, domain);
  return {
    user,
    domain,
    groups,
  };
}

export async function getEndpointDetail(domain, user) {
  const [subscriber, devices, profile] = await Promise.all([
    getSubscriber(domain, user).catch(() => null),
    listDevices(domain, user).catch(() => []),
    getSubscriberProfile(domain, user).catch(() => null),
  ]);
  if (!subscriber) {
    const err = new Error('Subscriber not found');
    err.status = 404;
    err.expose = true;
    throw err;
  }

  const device = devices[0] || null;
  let phone = null;
  const phones = await listPhones(domain).catch(() => []);
  phone =
    phones.find((row) =>
      (row.lines || []).some((line) => String(line) === String(user))
    ) ||
    phones.find((row) => String(row.phone_ext || '') === String(user)) ||
    null;

  if (!phone && subscriber.phone_match_key) {
    phone = phones.find((row) => {
      const did = phoneDigits(row.primary_line);
      return did && did === subscriber.phone_match_key;
    }) || null;
  }

  if (phone?.mac) {
    phone = (await getPhone(domain, phone.mac).catch(() => phone)) || phone;
  }

  const merged = mergeSubscriberRecord(subscriber, null, phone, device);
  merged.wan_lan = formatWanLan({ device, phone });
  merged.model = phone?.user_agent || phone?.model || device?.user_agent || merged.model;
  merged.overrides = phone?.overrides || null;
  merged.site = profile?.site || merged.site || null;
  merged.time_zone = profile?.['time-zone'] || merged.time_zone || null;
  merged.vm_pin = profile?.['voicemail-login-pin'] || merged.vm_pin || null;
  merged.registration_status = device?.registration_time
    ? 'Registered'
    : device?.mode && device.mode !== 'unknown'
      ? device.mode
      : merged.registration_status;

  return {
    domain,
    subscriber: merged,
    phone,
    devices,
  };
}

export async function listPhones(domain) {
  const territory = getPbxTerritory();
  const params = new URLSearchParams({
    object: 'mac',
    action: 'read',
    domain,
  });
  if (territory) params.set('territory', territory);
  const xml = await pbxRequest('POST', '', { body: params });
  return normalizePhoneRows(xml);
}

export async function listSubscribers(domain, { page = 1, perPage = 250 } = {}) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'subscriber',
      action: 'read',
      domain,
      start: String(Math.max(0, (Number(page) - 1) * Number(perPage || 250))),
      limit: String(Number(perPage) || 250),
    }),
  });
  return normalizePbxSubscriberRows(xml);
}

/** Paginate subscriber read until a page is short (NetSapiens domain read). */
export async function listAllSubscribers(domain, { perPage = 250 } = {}) {
  const rows = [];
  let page = 1;
  const limit = Math.max(1, Number(perPage) || 250);
  while (true) {
    const batch = await listSubscribers(domain, { page, perPage: limit });
    rows.push(...batch);
    if (batch.length < limit) break;
    page += 1;
  }
  return rows;
}

export async function getPhone(domain, mac) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'mac',
      action: 'read',
      domain,
      mac,
    }),
  });
  return normalizePhoneRows(xml)[0] || null;
}

export async function updateSubscriber(domain, user, updates = {}) {
  const fieldMap = {
    email: 'email',
    email_address: 'email',
    department: 'group',
    group: 'group',
    notes: 'message',
    message: 'message',
    site: 'site',
    vm_pin: 'pwd',
    pwd: 'pwd',
    e911_caller_id: 'callid_emgr',
    callid_emgr: 'callid_emgr',
    dial_policy: 'dial_policy',
    dial_plan: 'dial_plan',
    time_zone: 'time_zone',
  };
  const params = new URLSearchParams({
    object: 'subscriber',
    action: 'update',
    domain,
    user,
  });
  let hasField = false;
  for (const [key, value] of Object.entries(updates)) {
    const apiKey = fieldMap[key];
    if (!apiKey || value == null) continue;
    const text = String(value);
    if ((key === 'site' || key === 'vm_pin' || key === 'pwd') && text.trim() === '') continue;
    params.set(apiKey, text);
    hasField = true;
  }
  if (!hasField) {
    const err = new Error('No valid subscriber fields to update');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', { body: params });
  return getEndpointDetail(domain, user);
}

function normalizeMac(value) {
  return String(value ?? '')
    .replace(/[^a-fA-F0-9]/g, '')
    .toLowerCase();
}

function requireExtension(user) {
  const extension = String(user ?? '').trim();
  if (!extension) {
    const err = new Error('Extension is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return extension;
}

export async function createSubscriber(domain, fields = {}) {
  const user = requireExtension(fields.user);
  const params = new URLSearchParams({
    object: 'subscriber',
    action: 'create',
    domain,
    user,
    first_name: String(fields.first_name || user).trim(),
    last_name: String(fields.last_name || '').trim(),
    dial_plan: String(fields.dial_plan || `${domain}_${user}`).trim(),
    dial_policy: String(fields.dial_policy || 'US and Canada').trim(),
    scope: String(fields.scope || 'Basic User').trim(),
    srv_code: String(fields.srv_code || 'system-user').trim(),
  });

  const optionalFields = {
    email: fields.email,
    group: fields.department || fields.group,
    callid_nmbr: fields.caller_id || fields.callid_nmbr,
    callid_name: fields.caller_id_name || fields.callid_name,
    callid_emgr: fields.e911_caller_id || fields.callid_emgr,
    time_zone: fields.time_zone,
    site: fields.site,
    message: fields.notes || fields.message,
  };
  for (const [key, value] of Object.entries(optionalFields)) {
    if (value != null && String(value).trim() !== '') {
      params.set(key, String(value).trim());
    }
  }

  await pbxRequest('POST', '', { body: params });

  const site = fields.site != null ? String(fields.site).trim() : '';
  if (site && !params.has('site')) {
    await pbxRequestV2('PUT', `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}`, {
      body: { site },
    }).catch(() => updateSubscriber(domain, user, { site }));
  }

  return getSubscriber(domain, user);
}

export async function deleteSubscriber(domain, user) {
  const extension = requireExtension(user);
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'subscriber',
      action: 'delete',
      domain,
      user: extension,
    }),
  });
  return { domain, user: extension, deleted: true };
}

export async function createPhone(domain, fields = {}) {
  const mac = normalizeMac(fields.mac);
  if (!mac) {
    const err = new Error('MAC address is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const params = new URLSearchParams({
    object: 'mac',
    action: 'create',
    domain,
    mac,
    model: String(fields.model || 'generic').trim(),
    transport: String(fields.transport || 'UDP').trim(),
  });

  const territory = getPbxTerritory();
  if (territory) params.set('territory', territory);

  const phoneExt = fields.phone_ext || fields.user || fields.extension;
  if (phoneExt) params.set('phone_ext', String(phoneExt).trim());

  if (fields.notes) params.set('notes', String(fields.notes).trim());

  await pbxRequest('POST', '', { body: params });
  return getPhone(domain, mac);
}

export async function deletePhoneRecord(domain, macAddress) {
  const mac = normalizeMac(macAddress);
  if (!mac) {
    const err = new Error('MAC address is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }

  const params = new URLSearchParams({
    object: 'mac',
    action: 'delete',
    domain,
    mac,
  });
  const territory = getPbxTerritory();
  if (territory) params.set('territory', territory);

  await pbxRequest('POST', '', { body: params });
  return { domain, mac, deleted: true };
}

export async function createEndpoint(domain, body = {}) {
  const user = requireExtension(body.user);
  const existing = await getSubscriber(domain, user).catch(() => null);
  if (existing) {
    const err = new Error(`Extension ${user} already exists on this domain`);
    err.status = 409;
    err.expose = true;
    throw err;
  }

  const subscriber = await createSubscriber(domain, body);

  let phone = null;
  if (body.mac) {
    phone = await createPhone(domain, {
      mac: body.mac,
      model: body.model,
      transport: body.transport,
      phone_ext: user,
      notes: body.phone_notes,
    });
  }

  let messaging = null;
  if (body.provision_messaging && body.device_user) {
    messaging = await legacyPbx.provisionHubUser({
      user,
      domain,
      device_user: String(body.device_user).trim(),
      name: body.messaging_name || subscriber.name || user,
      user_type: body.user_type || 'skyswitch-pbx',
    });
  }

  const detail = await getEndpointDetail(domain, user);
  return { subscriber: detail.subscriber, phone: detail.phone || phone, messaging };
}

export async function deleteEndpoint(domain, user, { deletePhone = true } = {}) {
  const extension = requireExtension(user);
  const detail = await getEndpointDetail(domain, extension).catch(() => null);
  const mac = detail?.phone?.mac || detail?.subscriber?.mac_address || null;

  if (deletePhone && mac) {
    await deletePhoneRecord(domain, mac).catch(() => null);
  }

  await deleteSubscriber(domain, extension);
  return { domain, user: extension, deleted: true };
}

export async function updatePhone(domain, mac, updates = {}) {
  const params = new URLSearchParams({
    object: 'mac',
    action: 'update',
    domain,
    mac,
  });
  let hasField = false;
  if (updates.overrides != null) {
    params.set('overrides', String(updates.overrides));
    hasField = true;
  }
  if (!hasField) {
    const err = new Error('No valid phone fields to update');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', { body: params });
  return getPhone(domain, mac);
}

export async function resyncPhone(device) {
  return pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'device',
      action: 'update',
      device,
      'check-sync': 'yes',
    }),
  });
}

function requireDomainDevice(domain, device) {
  const raw = String(device || '').trim();
  if (!raw) {
    const err = new Error('Device is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  const normalized = raw.toLowerCase().startsWith('sip:')
    ? raw
    : `sip:${raw}@${domain}`;
  if (!normalized.toLowerCase().endsWith(`@${String(domain).toLowerCase()}`)) {
    const err = new Error('Device does not belong to the selected domain');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return normalized;
}

export async function resyncEndpointDevice(domain, device) {
  const normalizedDevice = requireDomainDevice(domain, device);
  await resyncPhone(normalizedDevice);
  return { domain, device: normalizedDevice, resync_requested: true };
}

export async function deleteEndpointDevice(domain, device, owner) {
  const normalizedDevice = requireDomainDevice(domain, device);
  const ownerUser = requireExtension(owner);
  const ownerDevices = await listDevices(domain, ownerUser);
  const normalizedKey = normalizedDevice.toLowerCase();
  const belongsToOwner = ownerDevices.some((row) => {
    const rowOwner = String(row.subscriber_name || '').trim().toLowerCase();
    const deviceKeys = [row.aor, row.device]
      .filter(Boolean)
      .map((value) => requireDomainDevice(domain, value).toLowerCase());
    return rowOwner === ownerUser.toLowerCase() && deviceKeys.includes(normalizedKey);
  });
  if (!belongsToOwner) {
    const err = new Error('Device line was not found for this subscriber');
    err.status = 404;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'device',
      action: 'delete',
      uid: `${ownerUser}@${domain}`,
      device: normalizedDevice,
      aor: normalizedDevice,
    }),
  });
  return { domain, device: normalizedDevice, owner: ownerUser, deleted: true };
}

function phoneDigits(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits || null;
}

/**
 * Normalize an extension / device-line key.
 * `sip:100b@domain` / `<sip:100b@ip:port>` → `100b` (device line), not owner subscriber.
 */
function extensionKey(value) {
  if (value == null || value === '') return '';
  let text = String(value).trim().toLowerCase();
  if (!text || text === 'n/a') return '';
  const sipMatch = text.match(/sip:([^@;>\s]+)/i);
  if (sipMatch) {
    text = sipMatch[1];
  } else {
    const at = text.indexOf('@');
    if (at > 0) text = text.slice(0, at);
  }
  const tilde = text.indexOf('~');
  if (tilde > 0) text = text.slice(0, tilde);
  return text;
}

/**
 * Device line identity from AOR/device — NOT subscriber_name (owner).
 * Bug: sip:100b@domain has subscriber_name "100", so indexing by owner made
 * extension 100 inherit 100b's live registration (false Online).
 */
function deviceLineKey(device) {
  if (!device) return '';
  for (const value of [device.device, device.aor, device.contact]) {
    const text = String(value ?? '').trim().toLowerCase();
    if (!text || text.includes('conference-bridge')) continue;
    const key = extensionKey(value);
    // Skip domain-qualified pseudo-AORs like sip:3010.domain.service@conference-bridge
    if (!key || key.includes('.')) continue;
    return key;
  }
  return '';
}

/**
 * Letter-suffixed device AOR owner (3010m → 3010). Primary AORs (3010) return ''.
 * Matches NetSapiens device model: subscriber_name = owner, aor = sip:<line>@domain.
 */
function ownerKeyForDeviceLine(lineKey, subscriberKeys) {
  if (!lineKey || !/^[a-z0-9]+[a-z]$/i.test(lineKey)) return '';
  const ownerKey = lineKey.slice(0, -1);
  return subscriberKeys.has(ownerKey) ? ownerKey : '';
}

/**
 * Resolve which subscriber owns a device line using API fields:
 * - subscriber_name is the owner extension
 * - aor/device is the registered line (letter-suffixed AOR for mobile/web/desk/fax)
 */
function resolveDeviceLineOwner(lineKey, subscriberName, subscriberKeys) {
  const ownerFromApi = String(subscriberName || '').trim().toLowerCase();
  if (!lineKey || lineKey === ownerFromApi) return '';
  const inferredOwner = ownerKeyForDeviceLine(lineKey, subscriberKeys);
  if (!inferredOwner) return '';
  if (ownerFromApi && ownerFromApi !== inferredOwner) return '';
  return inferredOwner;
}

/** All extension keys on a MAC record — phone_ext, lineN_ext, and device1–8 SIP URIs. */
function phoneLineKeys(phone) {
  return [
    ...(phone?.lines || []),
    phone?.phone_ext,
    phone?.primary_line,
    ...(phone?.devices || []),
  ]
    .map((value) => extensionKey(value))
    .filter(Boolean);
}

function indexPhoneByExtension(phonesByExt, phone) {
  for (const key of new Set(phoneLineKeys(phone))) {
    const matches = phonesByExt.get(key) || [];
    matches.push(phone);
    phonesByExt.set(key, matches);
  }
}

function phoneOwnedBySubscriber(phone, subscriberKeys) {
  for (const extKey of new Set(phoneLineKeys(phone))) {
    if (subscriberKeys.has(extKey)) return true;
    const ownerKey = ownerKeyForDeviceLine(extKey, subscriberKeys);
    if (ownerKey) return true;
  }
  return false;
}

function indexDeviceByExtension(deviceByExt, device) {
  const lineKey = deviceLineKey(device);
  if (lineKey && !deviceByExt.has(lineKey)) {
    deviceByExt.set(lineKey, device);
  }
}

function resolveOnlineStatus({
  device = null,
  phone = null,
  registration_time = null,
  registration_expires_time = null,
  mac_address = null,
  contact = null,
  received_from = null,
  expires_ttl_seconds = null,
} = {}) {
  const active = isRegistrationCurrentlyActive({
    contact: contact || device?.contact || phone?.contact || null,
    received_from: received_from || device?.received_from || null,
    registration_time:
      registration_time || device?.registration_time || phone?.registration_time || null,
    registration_expires_time:
      registration_expires_time ||
      device?.registration_expires_time ||
      phone?.registration_expires_time ||
      null,
    expires_ttl_seconds:
      expires_ttl_seconds ?? device?.expires ?? phone?.expires ?? null,
  });

  if (active) {
    return { online_status: 'online', registration_status: 'Registered' };
  }

  if (mac_address || phone?.mac || device) {
    return { online_status: 'offline', registration_status: 'Unregistered' };
  }

  return { online_status: 'no_device', registration_status: '—' };
}

function mergeSubscriberRecord(base, legacy = null, phone = null, device = null) {
  const registration_time =
    device?.registration_time || phone?.registration_time || legacy?.registration_time || base.registration_time || null;
  const registration_expires_time =
    device?.registration_expires_time ||
    phone?.registration_expires_time ||
    legacy?.registration_expires_time ||
    base.registration_expires_time ||
    null;
  const mac_address = phone?.mac || legacy?.mac_address || base.mac_address || null;
  const wan_ip = device?.received_from || legacy?.wan_ip || base.wan_ip || null;
  const contact = phone?.contact || device?.contact || legacy?.contact || null;
  const received_from = device?.received_from || null;
  const expires_ttl_seconds = device?.expires ?? phone?.expires ?? legacy?.expires ?? null;
  const { online_status, registration_status } = resolveOnlineStatus({
    device,
    phone,
    registration_time,
    registration_expires_time,
    mac_address,
    contact,
    received_from,
    expires_ttl_seconds,
  });

  const merged = {
    ...base,
    transport: phone?.transport || legacy?.transport || base.transport || null,
    geo_node: resolveGeoNode({ legacy, phone, device, base }),
    wan_ip,
    wan_lan: formatWanLan({ device, phone }) || base.wan_lan || null,
    mac_address,
    model:
      phone?.user_agent ||
      phone?.model ||
      legacy?.model ||
      device?.user_agent ||
      base.model ||
      null,
    notes: base.notes || legacy?.notes || null,
    warning: resolveEndpointWarning({ base, legacy, phone }) || legacy?.warning || null,
    phone_notes: phone?.notes || null,
    overrides: phone?.overrides || base.overrides || null,
    user_agent: device?.user_agent || phone?.user_agent || base.user_agent || null,
    registration_time,
    registration_expires_time,
    vm_pin: base.vm_pin || null,
    dial_policy: base.dial_policy || null,
    dial_plan: base.dial_plan || null,
    caller_id_name: base.caller_id_name || null,
    srv_code: base.srv_code || legacy?.srv_code || null,
    area_code: base.area_code || null,
    time_zone: base.time_zone || null,
    last_update: base.last_update || null,
    online_status,
    registration_status,
  };
  merged.features = [...new Set([...(base.features || []), ...(legacy?.features || [])])];
  return merged;
}

function extensionFromPhone(phone) {
  if (!phone) return null;
  return phone.phone_ext || phone.primary_line || phone.lines?.[0] || null;
}

function displayExtensionKey(value) {
  if (value == null || value === '') return '';
  let text = String(value).trim();
  if (!text || text.toLowerCase() === 'n/a') return '';
  const sipMatch = text.match(/sip:([^@;>\s]+)/i);
  if (sipMatch) {
    text = sipMatch[1];
  } else {
    const at = text.indexOf('@');
    if (at > 0) text = text.slice(0, at);
  }
  const tilde = text.indexOf('~');
  if (tilde > 0) text = text.slice(0, tilde);
  return text;
}

function preferredPhone(phones = []) {
  return (
    phones.find((phone) => phone.online_status === 'online') ||
    phones.find((phone) => phone.mac) ||
    phones[0] ||
    null
  );
}

function aggregateDeviceLineStatus(deviceLines = [], fallbackStatus = 'no_device') {
  if (deviceLines.some((line) => line.online_status === 'online')) {
    return { online_status: 'online', registration_status: 'Registered' };
  }
  if (deviceLines.some((line) => line.online_status === 'offline')) {
    return { online_status: 'offline', registration_status: 'Unregistered' };
  }
  if (fallbackStatus === 'offline') {
    return { online_status: 'offline', registration_status: 'Unregistered' };
  }
  if (fallbackStatus === 'online') {
    return { online_status: 'online', registration_status: 'Registered' };
  }
  return { online_status: 'no_device', registration_status: '—' };
}

function buildSubscriberDeviceLines(pbxSubscribers, phones, devices) {
  const subscriberKeys = new Set(
    pbxSubscribers.map((row) => String(row.user || '').trim().toLowerCase()).filter(Boolean)
  );
  const phonesByLine = new Map();
  for (const phone of phones) {
    for (const lineKey of new Set(phoneLineKeys(phone))) {
      const matches = phonesByLine.get(lineKey) || [];
      matches.push(phone);
      phonesByLine.set(lineKey, matches);
    }
  }

  const linesByOwner = new Map();
  const addLine = (ownerKey, lineKey, source) => {
    if (!ownerKey || !lineKey || lineKey === ownerKey) return;
    const ownerLines = linesByOwner.get(ownerKey) || new Map();
    const current = ownerLines.get(lineKey) || { device: null, phone: null };
    ownerLines.set(lineKey, { ...current, ...source });
    linesByOwner.set(ownerKey, ownerLines);
  };

  for (const device of devices) {
    const lineKey = deviceLineKey(device);
    const ownerKey = resolveDeviceLineOwner(
      lineKey,
      device.subscriber_name,
      subscriberKeys
    );
    if (ownerKey) addLine(ownerKey, lineKey, { device });
  }

  for (const [lineKey, matchingPhones] of phonesByLine) {
    const ownerKey = ownerKeyForDeviceLine(lineKey, subscriberKeys);
    if (ownerKey) addLine(ownerKey, lineKey, { phone: preferredPhone(matchingPhones) });
  }

  return new Map(
    [...linesByOwner].map(([ownerKey, ownerLines]) => [
      ownerKey,
      [...ownerLines]
        .map(([lineKey, sources]) => {
          const device = sources.device;
          const phone = sources.phone || preferredPhone(phonesByLine.get(lineKey));
          const { online_status, registration_status } = resolveOnlineStatus({ device, phone });
          const phoneLine = [phone?.phone_ext, phone?.primary_line, ...(phone?.lines || [])]
            .map((value) => displayExtensionKey(value))
            .find((value) => value.toLowerCase() === lineKey);
          return {
            id: `${ownerKey}:${lineKey}`,
            owner_user: ownerKey,
            line: phoneLine || displayExtensionKey(device?.aor || device?.device) || lineKey,
            aor: device?.aor || device?.device || phone?.primary_device || null,
            primary_device: phone?.primary_device || device?.device || device?.aor || null,
            model: phone?.user_agent || phone?.model || device?.user_agent || null,
            user_agent: device?.user_agent || phone?.user_agent || null,
            mac_address: phone?.mac || null,
            transport: phone?.transport || null,
            overrides: phone?.overrides || null,
            wan_ip: device?.received_from || null,
            registration_time:
              device?.registration_time || phone?.registration_time || null,
            registration_expires_time:
              device?.registration_expires_time ||
              phone?.registration_expires_time ||
              null,
            online_status,
            registration_status,
          };
        })
        .sort((a, b) =>
          String(a.line).localeCompare(String(b.line), undefined, {
            numeric: true,
            sensitivity: 'base',
          })
        ),
    ])
  );
}

function buildPhoneOnlySubscriberRow(phone, domain, device = null) {
  const extension = extensionFromPhone(phone);
  const userLabel = extension || phone.mac;
  const base = {
    id: `mac:${phone.mac}`,
    user: userLabel,
    domain,
    name: phone.model || phone.user_agent || userLabel,
    subscriber_login: null,
    caller_id: phone.primary_line || null,
    scope: null,
    site: null,
    department: null,
    srv_code: phone.model || null,
    features: [],
    notes: phone.notes || null,
    warning: null,
    online_status: null,
    is_phone_inventory: true,
    raw: phone.raw || phone,
  };
  return mergeSubscriberRecord(base, null, phone, device);
}

export async function getEndpointInventory(domain) {
  const [pbxSubscribers, phones, devices, legacyOverview] = await Promise.all([
    listAllSubscribers(domain).catch(() => []),
    listPhones(domain).catch(() => []),
    listAllDevices(domain).catch(() => []),
    legacyPbx.getEndpointControlOverview(domain).catch(() => ({
      subscribers: [],
      messagingUsers: [],
      sipAlgWarningCount: 0,
      stats: null,
    })),
  ]);

  const legacyByExt = new Map(
    (legacyOverview.subscribers || []).map((row) => [String(row.user || '').toLowerCase(), row])
  );
  const subscriberKeys = new Set(
    pbxSubscribers.map((row) => String(row.user || '').trim().toLowerCase()).filter(Boolean)
  );
  const phonesByExt = new Map();
  const phoneByDid = new Map();
  const deviceByExt = new Map();
  for (const phone of phones) {
    indexPhoneByExtension(phonesByExt, phone);
    const didKey = phoneDigits(phone.primary_line);
    if (didKey && !phoneByDid.has(didKey)) phoneByDid.set(didKey, phone);
  }
  for (const device of devices) {
    indexDeviceByExtension(deviceByExt, device);
  }
  const deviceLinesBySubscriber = buildSubscriberDeviceLines(
    pbxSubscribers,
    phones,
    devices
  );

  const usedPhoneMacs = new Set();
  const subscribers = pbxSubscribers.map((row) => {
    const extKey = String(row.user || '').toLowerCase();
    const didKey = row.phone_match_key || row.e911_match_key || null;
    const legacy = legacyByExt.get(extKey) || null;
    const phone = preferredPhone(phonesByExt.get(extKey) || []) || (didKey ? phoneByDid.get(didKey) : null) || null;
    const device = deviceByExt.get(extKey) || null;
    if (phone?.mac) usedPhoneMacs.add(String(phone.mac).toLowerCase());
    const deviceLines = deviceLinesBySubscriber.get(extKey) || [];
    for (const line of deviceLines) {
      if (line.mac_address) usedPhoneMacs.add(String(line.mac_address).toLowerCase());
    }
    const merged = mergeSubscriberRecord(row, legacy, phone, device);
    const aggregateStatus = aggregateDeviceLineStatus(deviceLines, merged.online_status);
    return {
      ...merged,
      ...aggregateStatus,
      deviceLines,
    };
  });

  const phoneOnlyRows = phones
    .filter((phone) => {
      if (phone.online_status !== 'online' || !phone.mac) return false;
      if (usedPhoneMacs.has(String(phone.mac).toLowerCase())) return false;
      if (phoneOwnedBySubscriber(phone, subscriberKeys)) return false;
      return true;
    })
    .map((phone) => {
      const ext = extensionFromPhone(phone);
      const device = ext ? deviceByExt.get(String(ext).toLowerCase()) || null : null;
      return buildPhoneOnlySubscriberRow(phone, domain, device);
    });

  const allSubscribers = [...subscribers, ...phoneOnlyRows];

  return {
    domain,
    subscribers: allSubscribers,
    messagingUsers: legacyOverview.messagingUsers || [],
    phones,
    devices,
    stats: buildEndpointStats(
      allSubscribers,
      legacyOverview.messagingUsers || [],
      legacyOverview.sipAlgWarningCount || 0
    ),
  };
}

/** Offline extensions + fax ATAs — extension rows use PBX device/MAC signals. */
export async function getOfflineExtensionOverview(domain, domainOpts = {}) {
  const resolved = await legacyPbx.resolveDomain(domain, domainOpts).catch(() => domain);
  const [inventory, faxBundle] = await Promise.all([
    getEndpointInventory(resolved).catch(() => ({
      domain: resolved,
      subscribers: [],
      messagingUsers: [],
      phones: [],
      devices: [],
      stats: null,
    })),
    legacyPbx.getOfflineEndpoints(resolved).catch(() => ({
      domain: resolved,
      offlineFaxAtas: [],
      faxAtas: [],
      messagingUsers: [],
    })),
  ]);

  return {
    domain: inventory.domain || faxBundle.domain || resolved,
    fax: faxBundle,
    extensionOffline: buildExtensionOfflineRows(inventory.subscribers || []),
    extensionCount: (inventory.subscribers || []).length,
  };
}

export { getE911ReviewOverview, updateSubscriberE911CallerId, getDomainRecord, updateDomainE911Defaults, createEmergencyPoolNumber, updateEmergencyPoolNumber, deleteEmergencyPoolNumber, getSubscriberE911Profile, listEmergencyCallerIds } from './e911.js';
export { getVulnerabilityCheck, updateDomainCallLimit } from './vulnerability.js';
