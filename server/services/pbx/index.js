import { config } from '../../config.js';
import { getCachedPbxTokenMetadata, pbxIsConfigured } from './auth.js';
import { pbxRequest } from './client.js';
import {
  cdrRowsToCsv,
  normalizeCdrRows,
  normalizeDeviceRows,
  normalizePbxSubscriberRows,
  normalizePbxTokenInfo,
  normalizePhoneRows,
  formatWanLan,
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

export async function listDevices(domain, user) {
  const params = new URLSearchParams({
    object: 'device',
    action: 'read',
    owner_domain: domain,
    start: '0',
    limit: user ? '50' : '500',
  });
  if (user) params.set('owner', user);
  const xml = await pbxRequest('POST', '', { body: params });
  return normalizeDeviceRows(xml);
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
  const data = await pbxRequestV2('GET', `domains/${encodeURIComponent(domain)}/sites`);
  return normalizeSiteOptions(data);
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
    params.set(apiKey, String(value));
    hasField = true;
  }
  const site = updates.site != null ? String(updates.site) : null;
  const vmPin = updates.vm_pin != null ? String(updates.vm_pin) : null;
  if (hasField) {
    await pbxRequest('POST', '', { body: params });
  }
  if (site != null || vmPin != null) {
    const body = {};
    if (site != null) body.site = site;
    if (vmPin != null) body['voicemail-login-pin'] = vmPin;
    await pbxRequestV2('PUT', `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}`, {
      body,
    });
  }
  if (!hasField && site == null && vmPin == null) {
    const err = new Error('No valid subscriber fields to update');
    err.status = 400;
    err.expose = true;
    throw err;
  }
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

function phoneDigits(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits || null;
}

function extensionKey(value) {
  if (value == null || value === '') return '';
  const text = String(value).trim().toLowerCase();
  const at = text.indexOf('@');
  return at > 0 ? text.slice(0, at) : text;
}

function indexDeviceByExtension(deviceByExt, device) {
  const keys = [
    device.subscriber_name,
    device.sub_login,
    device.aor,
    device.aor ? String(device.aor).split('@')[0] : null,
  ];
  for (const key of keys) {
    const ext = extensionKey(key);
    if (ext && !deviceByExt.has(ext)) deviceByExt.set(ext, device);
  }
}

function resolveOnlineStatus({
  device = null,
  phone = null,
  registration_time = null,
  mac_address = null,
  wan_ip = null,
  contact = null,
  received_from = null,
} = {}) {
  if (registration_time || contact || received_from || wan_ip) {
    return { online_status: 'online', registration_status: 'Registered' };
  }

  if (device?.online_status === 'online' || phone?.online_status === 'online') {
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
  const mac_address = phone?.mac || legacy?.mac_address || base.mac_address || null;
  const wan_ip = device?.received_from || legacy?.wan_ip || base.wan_ip || null;
  const { online_status, registration_status } = resolveOnlineStatus({
    device,
    phone,
    registration_time,
    mac_address,
    wan_ip,
    contact: phone?.contact || null,
    received_from: device?.received_from || null,
  });

  const merged = {
    ...base,
    transport: phone?.transport || legacy?.transport || base.transport || null,
    geo_node: legacy?.geo_node || phone?.server || base.geo_node || null,
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
    notes: legacy?.notes || phone?.notes || base.notes || null,
    warning: legacy?.notes || phone?.notes || base.warning || null,
    overrides: phone?.overrides || base.overrides || null,
    user_agent: device?.user_agent || phone?.user_agent || base.user_agent || null,
    registration_time,
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

export async function getEndpointInventory(domain) {
  const [pbxSubscribers, phones, devices, legacyOverview] = await Promise.all([
    listSubscribers(domain).catch(() => []),
    listPhones(domain).catch(() => []),
    listDevices(domain).catch(() => []),
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
  const phoneByExt = new Map();
  const phoneByDid = new Map();
  const deviceByExt = new Map();
  for (const phone of phones) {
    for (const ext of phone.lines || []) {
      const key = String(ext || '').toLowerCase();
      if (key && !phoneByExt.has(key)) phoneByExt.set(key, phone);
    }
    const phoneExtKey = String(phone.phone_ext || '').toLowerCase();
    if (phoneExtKey && !phoneByExt.has(phoneExtKey)) phoneByExt.set(phoneExtKey, phone);
    const didKey = phoneDigits(phone.primary_line);
    if (didKey && !phoneByDid.has(didKey)) phoneByDid.set(didKey, phone);
  }
  for (const device of devices) {
    indexDeviceByExtension(deviceByExt, device);
  }

  const subscribers = pbxSubscribers.map((row) => {
    const extKey = String(row.user || '').toLowerCase();
    const didKey = row.phone_match_key || row.e911_match_key || null;
    const legacy = legacyByExt.get(extKey) || null;
    const phone = phoneByExt.get(extKey) || (didKey ? phoneByDid.get(didKey) : null) || null;
    const device = deviceByExt.get(extKey) || null;
    return mergeSubscriberRecord(row, legacy, phone, device);
  });

  return {
    domain,
    subscribers,
    messagingUsers: legacyOverview.messagingUsers || [],
    phones,
    devices,
    stats: buildEndpointStats(
      subscribers,
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
