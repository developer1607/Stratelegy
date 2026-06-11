import { config } from '../../config.js';
import { skyswitchIsConfigured } from './auth.js';
import { accountPath, skyswitchRequest, toArray } from './client.js';
import { normalizeDomainList, normalizeResellerList } from './normalize.js';

export { skyswitchIsConfigured };

export async function getPbxStatus() {
  if (!skyswitchIsConfigured()) {
    return { configured: false, connected: false, message: 'SkySwitch credentials not configured' };
  }
  try {
    await skyswitchRequest('GET', accountPath('/pbx/domains'));
    return { configured: true, connected: true, accountId: config.skyswitch.accountId };
  } catch {
    return {
      configured: true,
      connected: false,
      message: 'Phone system unreachable',
    };
  }
}

export async function listDomains() {
  const data = await skyswitchRequest('GET', accountPath('/pbx/domains'));
  return normalizeDomainList(data);
}

export async function listResellers() {
  const data = await skyswitchRequest('GET', accountPath('/pbx/resellers'));
  return normalizeResellerList(data);
}

export async function resolveDomain(domain) {
  if (domain) return domain;
  if (config.skyswitch.defaultDomain) return config.skyswitch.defaultDomain;
  const domains = await listDomains();
  return domains[0]?.domain || null;
}

export async function listSubscribers(domain, filter = 'subscriber') {
  const resolved = await resolveDomain(domain);
  if (!resolved) return [];
  const data = await skyswitchRequest('GET', accountPath('/pbx/subscribers'), {
    query: { domain: resolved, filter },
  });
  return toArray(data);
}

export async function listMessagingUsers(domain) {
  const resolved = await resolveDomain(domain);
  if (!resolved) return [];
  const data = await skyswitchRequest('GET', accountPath('/messaging/users'), {
    query: { domain: resolved },
  });
  return toArray(data);
}

/** GET /messaging/aliases/pbxuser — phone numbers for a PBX user. */
export async function getPbxUserPhoneNumbers(domain, user, { service, uri } = {}) {
  const resolved = await resolveDomain(domain);
  if (!resolved || !user) return [];
  const data = await skyswitchRequest('GET', accountPath('/messaging/aliases/pbxuser'), {
    query: { domain: resolved, user, service, uri },
  });
  return Array.isArray(data) ? data : toArray(data);
}

export async function listAutoAttendants(domain) {
  const resolved = await resolveDomain(domain);
  if (!resolved) return [];
  const data = await skyswitchRequest('GET', accountPath('/auto-attendants'), {
    query: { domain: resolved },
  });
  return toArray(data);
}

export async function listCallQueues(domain) {
  const resolved = await resolveDomain(domain);
  if (!resolved) return [];
  const data = await skyswitchRequest('GET', accountPath('/call-queues'), {
    query: { domain: resolved },
  });
  return toArray(data);
}

export async function listPbxPhoneNumbers(domain) {
  const resolved = await resolveDomain(domain);
  if (!resolved) return [];
  const data = await skyswitchRequest('GET', accountPath('/pbx/phone-numbers'), {
    query: { domain: resolved },
  });
  return Array.isArray(data) ? data : toArray(data);
}

export async function listInventoryPhoneNumbers() {
  const data = await skyswitchRequest('GET', accountPath('/phone-numbers'), {
    query: { limit: 500 },
  });
  return toArray(data);
}

export async function listE911Endpoints() {
  const data = await skyswitchRequest('GET', accountPath('/e911/endpoints'));
  return Array.isArray(data) ? data : toArray(data);
}

export async function getE911ForPhone(phoneNumber) {
  return skyswitchRequest('GET', accountPath(`/phone-numbers/${phoneNumber}/e911`));
}

export async function listE911Countries() {
  return skyswitchRequest('GET', accountPath('/e911/countries'));
}

/** Returns `{ US: { AL: "Alabama", ... }, CA: { AB: "Alberta", ... } }` — do not pass a country filter. */
export async function listE911States() {
  return skyswitchRequest('GET', accountPath('/e911/states'));
}

export async function listTrunkGroups() {
  const data = await skyswitchRequest('GET', accountPath('/trunk-groups'));
  return Array.isArray(data) ? data : toArray(data);
}

export async function listFaxAtas() {
  const data = await skyswitchRequest('GET', accountPath('/fax-atas'));
  return Array.isArray(data) ? data : toArray(data);
}

export async function getPhoneRoute(phoneNumber) {
  return skyswitchRequest('GET', accountPath(`/phone-numbers/${phoneNumber}/route`));
}

export async function listRoutesByAni(domain, { ani, dnis } = {}) {
  const resolved = await resolveDomain(domain);
  return skyswitchRequest('GET', accountPath('/pbx/route-by-ani'), {
    query: { domain: resolved, ani, dnis },
  });
}

export async function getUiConfig(domain, configName) {
  const resolved = await resolveDomain(domain);
  return skyswitchRequest('GET', accountPath('/pbx/ui-config'), {
    query: { domain: resolved, config_name: configName },
  });
}

export async function listReportTypes() {
  return skyswitchRequest('GET', accountPath('/reports/types'));
}

export async function listReports({ page = 1, perPage = 25 } = {}) {
  return skyswitchRequest('GET', accountPath('/reports'), {
    query: { page, per_page: perPage },
  });
}

export async function getReport(reportId) {
  return skyswitchRequest('GET', accountPath(`/reports/${reportId}`));
}

export async function cancelReport(reportId) {
  return skyswitchRequest('DELETE', accountPath(`/reports/${reportId}`));
}

export async function getReportFileDownload(fileId) {
  return skyswitchRequest('GET', `/v2/files/${fileId}`);
}

export async function listAuditLogs({ startDate, endDate, page = 1 } = {}) {
  return skyswitchRequest('GET', accountPath('/audit-logs'), {
    query: {
      start_date: startDate,
      end_date: endDate,
      page,
    },
  });
}

export async function getDashboardSummary(domain) {
  const resolved = await resolveDomain(domain);
  const [domains, e911, trunks, subscribers, phoneNumbers, autoAttendants] = await Promise.all([
    listDomains(),
    listE911Endpoints().catch(() => []),
    listTrunkGroups().catch(() => []),
    resolved ? listSubscribers(resolved).catch(() => []) : Promise.resolve([]),
    resolved ? listPbxPhoneNumbers(resolved).catch(() => []) : Promise.resolve([]),
    resolved ? listAutoAttendants(resolved).catch(() => []) : Promise.resolve([]),
  ]);

  return {
    domain: resolved,
    domains: domains.length,
    subscribers: subscribers.length,
    e911Endpoints: e911.length,
    trunkGroups: trunks.length,
    phoneNumbers: phoneNumbers.length,
    autoAttendants: autoAttendants.length,
    domainList: domains,
  };
}

const SIP_ALG_CONFIGS = [
  'SIP_ALG_DETECTION',
  'SIP_ALG_ENABLED',
  'ENABLE_SIP_ALG',
  'PORTAL_SIP_ALG',
];

export async function getSipAlgSettings(domain) {
  const resolved = await resolveDomain(domain);
  const results = [];
  for (const configName of SIP_ALG_CONFIGS) {
    try {
      const raw = await getUiConfig(resolved, configName);
      if (Array.isArray(raw) && raw.length === 0) continue;
      const value = Array.isArray(raw) ? raw[0] : raw;
      if (!value || typeof value !== 'object') continue;
      if (!value.config_value && !value.description && !value.server_name) continue;
      results.push({ config_name: configName, ...value });
    } catch {
      // config may not exist for this domain
    }
  }
  return { domain: resolved, settings: results };
}

export async function getTroubleshootingSnapshot(domain) {
  const resolved = await resolveDomain(domain);
  const status = await getPbxStatus();
  const [domains, subscribers, e911, trunks] = await Promise.all([
    listDomains().catch(() => []),
    listSubscribers(resolved).catch(() => []),
    listE911Endpoints().catch(() => []),
    listTrunkGroups().catch(() => []),
  ]);
  return {
    status,
    domain: resolved,
    domains: domains.length,
    subscribers: subscribers.length,
    e911Endpoints: e911.length,
    trunkGroups: trunks.length,
    checkedAt: new Date().toISOString(),
  };
}

export async function getCallRoutingOverview(domain) {
  const resolved = await resolveDomain(domain);
  const phoneNumbers = await listPbxPhoneNumbers(resolved);
  const routes = await Promise.all(
    phoneNumbers.slice(0, 25).map(async (phone) => {
      try {
        const route = await getPhoneRoute(phone);
        return { phone_number: phone, ...route };
      } catch (err) {
        return { phone_number: phone, error: 'Route lookup failed' };
      }
    })
  );
  return { domain: resolved, routes };
}

export async function getOfflineEndpoints(domain) {
  const [faxAtas, messagingUsers] = await Promise.all([
    listFaxAtas().catch(() => []),
    listMessagingUsers(domain).catch(() => []),
  ]);
  const offlineFax = faxAtas.filter((item) => Number(item.deliver_offline) === 1);
  return {
    domain: await resolveDomain(domain),
    offlineFaxAtas: offlineFax,
    messagingUsers,
    faxAtas,
  };
}

export async function getVoicemailOverview(domain) {
  const resolved = await resolveDomain(domain);
  const [subscribers, autoAttendants, callQueues] = await Promise.all([
    listSubscribers(resolved).catch(() => []),
    listAutoAttendants(resolved).catch(() => []),
    listCallQueues(resolved).catch(() => []),
  ]);
  return {
    domain: resolved,
    subscribers: subscribers.filter((s) => s.srv_code || s.name?.toLowerCase().includes('vm')),
    autoAttendants,
    callQueues,
    allSubscribers: subscribers,
  };
}

// ── Write operations ──

export async function setPhoneRoute(phoneNumber, body) {
  return skyswitchRequest('PUT', accountPath(`/phone-numbers/${phoneNumber}/route`), { body });
}

export async function deletePhoneRoute(phoneNumber) {
  return skyswitchRequest('DELETE', accountPath(`/phone-numbers/${phoneNumber}/route`));
}

export async function provisionE911(phoneNumber, body) {
  return skyswitchRequest('PUT', accountPath(`/phone-numbers/${phoneNumber}/e911`), { body });
}

export async function unprovisionE911(phoneNumber) {
  return skyswitchRequest('DELETE', accountPath(`/phone-numbers/${phoneNumber}/e911`));
}

export async function validateE911Address(query) {
  const params = {
    ...query,
    force: query.force ?? 0,
    name: query.name?.trim() || 'E911 Location',
  };
  return skyswitchRequest('GET', accountPath('/e911/address'), { query: params });
}

export async function makeCall(body) {
  return skyswitchRequest('POST', accountPath('/pbx/make-call'), { body });
}

export async function provisionRouteByAni(query) {
  return skyswitchRequest('PUT', accountPath('/pbx/route-by-ani'), { query });
}

export async function deleteRouteByAni(query) {
  return skyswitchRequest('DELETE', accountPath('/pbx/route-by-ani'), { query });
}

export async function provisionHubUser(body) {
  return skyswitchRequest('PUT', accountPath('/messaging/hubusers'), { body });
}

export async function unprovisionHubUser(userId) {
  return skyswitchRequest('DELETE', accountPath(`/messaging/hubusers/${userId}`));
}

// ── Fax ATA ──

export async function getFaxAtaStatus(macAddress) {
  return skyswitchRequest('GET', accountPath(`/fax-atas/${encodeURIComponent(macAddress)}/status`));
}

export async function rebootFaxAta(macAddress) {
  return skyswitchRequest('POST', accountPath(`/fax-atas/${encodeURIComponent(macAddress)}/reboot`));
}

// ── UC config ──

export async function listUcConfig(domain, subscriber, query = {}) {
  const resolved = await resolveDomain(domain);
  if (!resolved || !subscriber) {
    const err = new Error('domain and subscriber are required');
    err.status = 400;
    err.expose = true;
    throw err;
  }
  return skyswitchRequest('GET', accountPath('/uc/config'), {
    query: { domain: resolved, subscriber, ...query },
  });
}

export async function listUcSettings(query = {}) {
  return skyswitchRequest('GET', '/uc/settings', { query });
}

export async function storeUcConfigRule(body) {
  return skyswitchRequest('POST', accountPath('/uc/config-rules'), { body });
}

export async function getUcConfigRule(ruleId) {
  return skyswitchRequest('GET', accountPath(`/uc/config-rules/${ruleId}`));
}

export async function deleteUcConfigRule(ruleId) {
  return skyswitchRequest('DELETE', accountPath(`/uc/config-rules/${ruleId}`));
}

// ── Entitlements ──

export async function listEntitlements(query = {}) {
  const resolved = query.domain ? await resolveDomain(query.domain) : query.domain;
  return skyswitchRequest('GET', accountPath('/entitlements'), {
    query: { ...query, domain: resolved || query.domain },
  });
}

export async function storeEntitlement(body) {
  return skyswitchRequest('PUT', accountPath('/entitlements'), { body });
}

export async function listEntitlementOfferings() {
  return skyswitchRequest('GET', accountPath('/entitlements/offerings'));
}

export async function listEntitlementOfferOptions(query = {}) {
  return skyswitchRequest('GET', accountPath('/entitlements/offeroptions'), { query });
}

export async function getEntitlementOfferValue(query) {
  return skyswitchRequest('GET', accountPath('/entitlements/offervalue'), { query });
}

export async function deleteEntitlement(entitlementId) {
  return skyswitchRequest('DELETE', accountPath(`/entitlements/${entitlementId}`));
}

// ── Outbound CNAM ──

export async function getOutboundCnam(phoneNumber) {
  return skyswitchRequest(
    'GET',
    accountPath(`/phone-numbers/${phoneNumber}/cnam-outbound/enum`)
  );
}

export async function setOutboundCnam(phoneNumber, body) {
  return skyswitchRequest(
    'PUT',
    accountPath(`/phone-numbers/${phoneNumber}/cnam-outbound/neustar`),
    { body }
  );
}

export async function removeOutboundCnam(phoneNumber) {
  return skyswitchRequest(
    'DELETE',
    accountPath(`/phone-numbers/${phoneNumber}/cnam-outbound/neustar`)
  );
}

// ── Audit logs & journals ──

export async function listAuditActions() {
  return skyswitchRequest('GET', accountPath('/audit-logs/resource-actions'));
}

export async function listJournals({ startDate, endDate, page = 1, perPage = 25, ...rest } = {}) {
  return skyswitchRequest('GET', accountPath('/journals'), {
    query: {
      start_date: startDate,
      end_date: endDate,
      page,
      per_page: perPage,
      ...rest,
    },
  });
}

export async function listJournalTypes() {
  return skyswitchRequest('GET', accountPath('/journals/module-type-actions'));
}
