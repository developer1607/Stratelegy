import { config } from '../../config.js';
import { pbxRequest, nodeList } from './client.js';
import * as legacyPbx from '../skyswitch/pbx.js';
import {
  indexE911ByPhone,
  toE911Phone11,
} from '../skyswitch/pbxEnrichment.js';

function digitsOnly(value) {
  return String(value ?? '').replace(/\D/g, '');
}

function normalizePhoneKey(value) {
  const d = digitsOnly(value);
  if (d.length === 11 && d.startsWith('1')) return d.slice(1);
  if (d.length === 10) return d;
  return d || null;
}

function isWildcardDid(value) {
  const text = String(value ?? '').trim();
  return !text || text === '[*]' || text.includes('*');
}

function parseDidFromMatchrule(matchrule) {
  const match = String(matchrule ?? '').match(/sip:1?(\d{10})@/i);
  if (!match) return null;
  return toE911Phone11(match[1]);
}

export async function listEmergencyCallerIds(domain) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'callidemgr',
      action: 'read',
      domain,
    }),
  });
  return nodeList(xml, 'callidemgr').map((row) => ({
    callid: row.callid || null,
    domain: row.domain || domain,
    tag: row.tag || null,
  }));
}

export async function listDomainDialplanNumbers(domain) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'phonenumber',
      action: 'read',
      domain,
    }),
  });
  const numbers = new Set();
  for (const row of nodeList(xml, 'phonenumber')) {
    const did = parseDidFromMatchrule(row.matchrule);
    if (did) numbers.add(did);
  }
  return [...numbers];
}

function resolveE911Status(subscriber, e911ByPhone, emergencyPool) {
  const emgrKey = normalizePhoneKey(subscriber.e911_caller_id);
  const callerKey = normalizePhoneKey(subscriber.caller_id);

  if (emgrKey && e911ByPhone.has(emgrKey)) {
    return { status: 'Provisioned', phone: subscriber.e911_caller_id };
  }
  if (callerKey && e911ByPhone.has(callerKey)) {
    return { status: 'Provisioned', phone: subscriber.caller_id };
  }
  if (!isWildcardDid(subscriber.e911_caller_id)) {
    return { status: '911 CID configured', phone: subscriber.e911_caller_id };
  }
  if (emergencyPool.length) {
    return { status: 'Domain 911 pool', phone: subscriber.e911_caller_id || '[*]' };
  }
  if (!isWildcardDid(subscriber.caller_id)) {
    return { status: 'Caller ID set', phone: subscriber.caller_id };
  }
  return { status: 'Not configured', phone: null };
}

function buildPbxDomainPhoneRows(dids, provisioned, emergencyPool) {
  const e911ByPhone = indexE911ByPhone(provisioned);
  const poolKeys = new Set(
    emergencyPool.map((row) => normalizePhoneKey(row.callid)).filter(Boolean)
  );

  return dids.map((did) => {
    const key = normalizePhoneKey(did);
    const e911 = key ? e911ByPhone.get(key) : null;
    const civic = e911?.location?.address?.civic_address || {};
    const los = e911?.location?.level_of_service || {};
    return {
      phone_number: did,
      e911_status: e911
        ? 'Provisioned'
        : poolKeys.has(key)
          ? 'Domain 911 pool'
          : 'Not provisioned',
      routing_status: los.routing_status || '—',
      location: civic.city ? [civic.city, civic.state].filter(Boolean).join(', ') : '—',
      name: civic.name || '—',
      msag_status: los.msag_status || '—',
    };
  });
}

function normalizeCallid10(value) {
  const d = digitsOnly(value);
  if (d.length >= 11 && d.startsWith('1')) return d.slice(-10);
  if (d.length === 10) return d;
  return d || null;
}

async function pbxRequestV2(method, path, { body } = {}) {
  return pbxRequest(method, `v2/${String(path || '').replace(/^\/+/, '')}`, {
    body: body == null ? undefined : JSON.stringify(body),
    contentType: body == null ? null : 'application/json',
    parseAs: 'json',
  });
}

export async function getDomainRecord(domain) {
  const xml = await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'domain',
      action: 'read',
      domain,
    }),
  });
  const row = nodeList(xml, 'domain')[0] || {};
  return {
    domain: row.domain || domain,
    territory: row.territory || null,
    description: row.description || null,
    caller_id: row.callid_nmbr || null,
    caller_id_name: row.callid_name || null,
    e911_caller_id: row.callid_emgr || null,
    area_code: row.area_code || null,
  };
}

export async function updateDomainE911Defaults(domain, updates = {}) {
  const current = await getDomainRecord(domain);
  if (!current.territory) {
    const err = new Error('Domain territory is required to update domain caller ID defaults');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  const params = new URLSearchParams({
    object: 'domain',
    action: 'update',
    territory: current.territory,
    domain,
  });
  if (updates.e911_caller_id != null) {
    params.set('callid_emgr', String(updates.e911_caller_id));
  }
  if (updates.caller_id != null) {
    params.set('callid_nmbr', String(updates.caller_id));
  }
  if (updates.caller_id_name != null) {
    params.set('callid_name', String(updates.caller_id_name));
  }
  await pbxRequest('POST', '', { body: params });
  return getDomainRecord(domain);
}

export async function createEmergencyPoolNumber(domain, callid, tag = '') {
  const normalized = normalizeCallid10(callid);
  if (!normalized) {
    const err = new Error('A valid 10-digit emergency caller ID is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'callidemgr',
      action: 'create',
      domain,
      callid: normalized,
      tag: tag || '',
    }),
  });
  return listEmergencyCallerIds(domain);
}

export async function updateEmergencyPoolNumber(domain, callid, tag) {
  const normalized = normalizeCallid10(callid);
  if (!normalized) {
    const err = new Error('A valid emergency caller ID is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'callidemgr',
      action: 'update',
      domain,
      callid: normalized,
      tag: tag ?? '',
    }),
  });
  return listEmergencyCallerIds(domain);
}

export async function deleteEmergencyPoolNumber(domain, callid) {
  const normalized = normalizeCallid10(callid);
  if (!normalized) {
    const err = new Error('A valid emergency caller ID is required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'callidemgr',
      action: 'delete',
      domain,
      callid: normalized,
    }),
  });
  return listEmergencyCallerIds(domain);
}

export async function getSubscriberE911Profile(domain, user) {
  const profile = await pbxRequestV2(
    'GET',
    `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}`
  ).catch(() => null);

  let addresses = { supported: false, items: [] };
  try {
    const data = await pbxRequestV2(
      'GET',
      `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(user)}/addresses`
    );
    const items = Array.isArray(data) ? data : data ? [data] : [];
    addresses = { supported: true, items };
  } catch (err) {
    if (err?.status !== 404) throw err;
  }

  return {
    domain,
    user,
    v2_e911_caller_id: profile?.['caller-id-number-emergency'] ?? null,
    emergency_address_id: profile?.['emergency-address-id'] ?? null,
    addresses,
  };
}

async function loadSubscriberV2Profiles(domain, subscribers) {
  const profiles = await Promise.all(
    subscribers.map((sub) =>
      pbxRequestV2(
        'GET',
        `domains/${encodeURIComponent(domain)}/users/${encodeURIComponent(sub.user)}`
      ).catch(() => null)
    )
  );
  const map = new Map();
  subscribers.forEach((sub, index) => {
    const profile = profiles[index];
    if (profile) map.set(String(sub.user), profile);
  });
  return map;
}

function buildEmergencyPoolRows(pool, provisioned) {
  const e911ByPhone = indexE911ByPhone(provisioned);
  return pool.map((row) => {
    const key = normalizePhoneKey(row.callid);
    const e911 = key ? e911ByPhone.get(key) : null;
    const civic = e911?.location?.address?.civic_address || {};
    const los = e911?.location?.level_of_service || {};
    return {
      callid: row.callid,
      phone_number: toE911Phone11(row.callid) || row.callid,
      tag: row.tag || '',
      domain: row.domain,
      e911_status: e911 ? 'Provisioned' : 'Not provisioned',
      location: civic.city ? [civic.city, civic.state].filter(Boolean).join(', ') : '—',
      routing_status: los.routing_status || '—',
    };
  });
}

function buildDomainReviewRows(subscribers, provisioned, emergencyPool, v2Profiles = new Map()) {
  const e911ByPhone = indexE911ByPhone(provisioned);

  return subscribers.map((sub) => {
    const profile = v2Profiles.get(String(sub.user)) || null;
    const v2E911 = profile?.['caller-id-number-emergency'] ?? null;
    const emgrKey = normalizePhoneKey(sub.e911_caller_id);
    const callerKey = normalizePhoneKey(sub.caller_id);
    let e911 = emgrKey ? e911ByPhone.get(emgrKey) : null;
    if (!e911 && callerKey) e911 = e911ByPhone.get(callerKey);

    const civic = e911?.location?.address?.civic_address || {};
    const los = e911?.location?.level_of_service || {};
    const resolved = resolveE911Status(sub, e911ByPhone, emergencyPool);

    const locationLabel = civic.city
      ? [civic.city, civic.state].filter(Boolean).join(', ')
      : resolved.status === '911 CID configured'
        ? 'PBX 911 caller ID'
        : resolved.status === 'Domain 911 pool'
          ? 'Domain emergency pool'
          : '—';

    return {
      extension: sub.user,
      name: sub.name,
      caller_id: sub.caller_id,
      e911_caller_id: sub.e911_caller_id,
      v2_e911_caller_id: v2E911,
      emergency_address_id: profile?.['emergency-address-id'] || null,
      site: sub.site,
      department: sub.department,
      wan_ip: sub.wan_ip,
      phone_number: e911?.phone_number || resolved.phone || null,
      e911_status: e911 ? 'Provisioned' : resolved.status,
      routing_status: los.routing_status || '—',
      registration_status:
        sub.registration_status ||
        (sub.online_status === 'online'
          ? 'Registered'
          : sub.online_status === 'offline'
            ? 'Unregistered'
            : 'Unknown'),
      online_status: sub.online_status,
      location: locationLabel,
      notes: sub.notes || '—',
      scope: sub.scope,
    };
  });
}

function buildWanGroups(rows) {
  const wanGroups = new Map();
  for (const row of rows) {
    const wan = row.wan_ip || 'Unknown WAN';
    if (!wanGroups.has(wan)) {
      wanGroups.set(wan, {
        wan_ip: wan,
        endpoints: 0,
        e911_disabled: 0,
        registered: 0,
        unregistered: 0,
      });
    }
    const group = wanGroups.get(wan);
    group.endpoints += 1;
    if (row.e911_status !== 'Provisioned' && row.e911_status !== '911 CID configured') {
      group.e911_disabled += 1;
    }
    if (row.online_status === 'online') group.registered += 1;
    if (row.online_status === 'offline') group.unregistered += 1;
  }
  return [...wanGroups.values()].sort((a, b) => a.wan_ip.localeCompare(b.wan_ip));
}

export async function getE911ReviewOverview(domain, domainOpts = {}) {
  const { getEndpointInventory } = await import('./index.js');
  const [inventory, emergencyPool, dialplanDids, domainDefaults, legacy] = await Promise.all([
    getEndpointInventory(domain),
    listEmergencyCallerIds(domain).catch(() => []),
    listDomainDialplanNumbers(domain).catch(() => []),
    getDomainRecord(domain).catch(() => null),
    config.skyswitch.enabled
      ? legacyPbx.getE911ReviewOverview(domain, domainOpts).catch(() => null)
      : Promise.resolve(null),
  ]);

  const provisioned = legacy?.provisioned || [];
  const v2Profiles = await loadSubscriberV2Profiles(domain, inventory.subscribers);
  const rows = buildDomainReviewRows(inventory.subscribers, provisioned, emergencyPool, v2Profiles);
  const wanGroups = buildWanGroups(rows);
  const emergencyPoolRows = buildEmergencyPoolRows(emergencyPool, provisioned);

  const domainPhones = legacy?.domainPhones?.length
    ? legacy.domainPhones
    : buildPbxDomainPhoneRows(dialplanDids, provisioned, emergencyPool);

  let v2AddressesSupported = false;
  if (inventory.subscribers[0]) {
    const sample = await getSubscriberE911Profile(domain, inventory.subscribers[0].user).catch(
      () => null
    );
    v2AddressesSupported = Boolean(sample?.addresses?.supported);
  }

  return {
    provisioned,
    domainPhones,
    emergencyPool,
    emergencyPoolRows,
    domainDefaults,
    domainReview: {
      domain,
      rows,
      summary: {
        visibleEndpoints: rows.length,
        wanGroups: wanGroups.length,
        registered: rows.filter((row) => row.online_status === 'online').length,
        unregistered: rows.filter((row) => row.online_status === 'offline').length,
        pbxConfigured: rows.filter((row) => row.e911_status === '911 CID configured').length,
        telcoProvisioned: rows.filter((row) => row.e911_status === 'Provisioned').length,
        emergencyPool: emergencyPool.length,
      },
      wanGroups,
    },
    capabilities: {
      emergencyPoolCrud: true,
      subscriberE911CallerId: true,
      domainDefaultsRead: Boolean(domainDefaults),
      domainDefaultsWrite: true,
      v2Addresses: v2AddressesSupported,
      telcoCivicProvision: Boolean(config.skyswitch.enabled),
    },
    sources: {
      pbx: true,
      telco: Boolean(legacy),
      telcoAddresses: provisioned.length,
      pbxEmergencyPool: emergencyPool.length,
      pbxDialplanNumbers: dialplanDids.length,
    },
  };
}

export async function updateSubscriberE911CallerId(domain, user, e911CallerId) {
  await pbxRequest('POST', '', {
    body: new URLSearchParams({
      object: 'subscriber',
      action: 'update',
      domain,
      user,
      callid_emgr: String(e911CallerId ?? ''),
    }),
  });
  return { domain, user, e911_caller_id: e911CallerId };
}
