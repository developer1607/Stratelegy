import { request } from "@/api/client";
import { appParams } from "@/lib/app-params";
import { getToken } from "@/lib/auth-token";

function pbxRequest(method, path, body, query) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return request(method, `/api/pbx${path}${qs ? `?${qs}` : ""}`, body);
}

function pbxGet(path, query) {
  return pbxRequest("GET", path, undefined, query);
}

async function pbxDownload(path, query) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== "") params.set(key, String(value));
    }
  }
  const qs = params.toString();
  const headers = {
    "X-App-Id":
      appParams.appId || import.meta.env.VITE_APP_ID || "stratelegy-insight",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`/api/pbx${path}${qs ? `?${qs}` : ""}`, {
    headers,
    credentials: "include",
  });
  if (!res.ok) {
    const error = new Error(`Download failed (${res.status})`);
    error.status = res.status;
    throw error;
  }
  return res.text();
}

export const pbxApi = {
  status: () => pbxGet("/status"),
  hybridStatus: () => pbxGet("/hybrid/status"),
  domains: () => pbxGet("/domains"),
  resellers: () => pbxGet("/resellers"),
  apiCatalog: () => pbxGet("/api-catalog"),
  dashboard: (domain) => pbxGet("/dashboard", { domain }),
  subscribers: (domain, filter) => pbxGet("/subscribers", { domain, filter }),
  extensions: (domain) => pbxGet("/extensions", { domain }),
  endpoints: (domain) => pbxGet("/endpoints", { domain }),
  messagingUsers: (domain) => pbxGet("/messaging-users", { domain }),
  pbxUserPhoneNumbers: (domain, user, opts) =>
    pbxGet("/messaging/aliases/pbxuser", { domain, user, ...opts }),
  offlineEndpoints: (domain) => pbxGet("/offline-endpoints", { domain }),
  e911: (domain) => pbxGet("/e911", domain ? { domain } : undefined),
  e911Countries: () => pbxGet("/e911/countries"),
  e911States: () => pbxGet("/e911/states"),
  e911Detail: (phoneNumber) =>
    pbxGet(`/e911/${encodeURIComponent(phoneNumber)}`),
  validateE911Address: (query) => pbxGet("/e911/validate/address", query),
  provisionE911: (phoneNumber, body) =>
    pbxRequest("PUT", `/e911/${encodeURIComponent(phoneNumber)}`, body),
  unprovisionE911: (phoneNumber) =>
    pbxRequest("DELETE", `/e911/${encodeURIComponent(phoneNumber)}`),
  trunkGroups: (domain) =>
    pbxGet("/trunk-groups", domain ? { domain } : undefined),
  sipAlg: (domain) => pbxGet("/sip-alg", { domain }),
  callRouting: (domain) => pbxGet("/call-routing", { domain }),
  getRoute: (phoneNumber) =>
    pbxGet(`/routes/${encodeURIComponent(phoneNumber)}`),
  setRoute: (phoneNumber, body) =>
    pbxRequest("PUT", `/routes/${encodeURIComponent(phoneNumber)}`, body),
  deleteRoute: (phoneNumber) =>
    pbxRequest("DELETE", `/routes/${encodeURIComponent(phoneNumber)}`),
  routeByAni: (domain, ani, dnis) =>
    pbxGet("/route-by-ani", { domain, ani, dnis }),
  provisionRouteByAni: (query) =>
    pbxRequest("PUT", "/route-by-ani", undefined, query),
  deleteRouteByAni: (query) =>
    pbxRequest("DELETE", "/route-by-ani", undefined, query),
  makeCall: (body) => pbxRequest("POST", "/make-call", body),
  provisionHubUser: (body) => pbxRequest("PUT", "/messaging/hubusers", body),
  unprovisionHubUser: (userId) =>
    pbxRequest("DELETE", `/messaging/hubusers/${encodeURIComponent(userId)}`),
  voicemail: (domain) => pbxGet("/voicemail", { domain }),
  autoAttendants: (domain) => pbxGet("/auto-attendants", { domain }),
  callQueues: (domain) => pbxGet("/call-queues", { domain }),
  phoneNumbers: (domain, scope) => pbxGet("/phone-numbers", { domain, scope }),
  auditLogs: (params) => pbxGet("/audit-logs", params),
  reportTypes: () => pbxGet("/reports/types"),
  createReport: (body) => pbxRequest("POST", "/reports", body),
  listReports: (page = 1, perPage = 25) =>
    pbxGet("/reports", { page, per_page: perPage }),
  cancelReport: (reportId) =>
    pbxRequest("DELETE", `/reports/${encodeURIComponent(reportId)}`),
  downloadReportFile: (fileId) =>
    pbxGet(`/reports/files/${encodeURIComponent(fileId)}/download`),
  troubleshooting: (domain) => pbxGet("/troubleshooting", { domain }),
  uiConfig: (domain, config_name) =>
    pbxGet("/ui-config", { domain, config_name }),
  faxAtas: () => pbxGet("/fax-atas"),
  faxAtaStatus: (macAddress) =>
    pbxGet(`/fax-atas/${encodeURIComponent(macAddress)}/status`),
  rebootFaxAta: (macAddress) =>
    pbxRequest("POST", `/fax-atas/${encodeURIComponent(macAddress)}/reboot`),
  ucSettings: (query) => pbxGet("/uc/settings", query),
  ucConfig: (domain, subscriber, query) =>
    pbxGet("/uc/config", { domain, subscriber, ...query }),
  storeUcConfigRule: (body) => pbxRequest("POST", "/uc/config-rules", body),
  getUcConfigRule: (ruleId) =>
    pbxGet(`/uc/config-rules/${encodeURIComponent(ruleId)}`),
  deleteUcConfigRule: (ruleId) =>
    pbxRequest("DELETE", `/uc/config-rules/${encodeURIComponent(ruleId)}`),
  entitlements: (query) => pbxGet("/entitlements", query),
  storeEntitlement: (body) => pbxRequest("PUT", "/entitlements", body),
  entitlementOfferings: () => pbxGet("/entitlements/offerings"),
  entitlementOfferOptions: (query) =>
    pbxGet("/entitlements/offeroptions", query),
  entitlementOfferValue: (query) => pbxGet("/entitlements/offervalue", query),
  deleteEntitlement: (id) =>
    pbxRequest("DELETE", `/entitlements/${encodeURIComponent(id)}`),
  getOutboundCnam: (phoneNumber) =>
    pbxGet(`/cnam-outbound/${encodeURIComponent(phoneNumber)}`),
  setOutboundCnam: (phoneNumber, body) =>
    pbxRequest(
      "PUT",
      `/cnam-outbound/${encodeURIComponent(phoneNumber)}`,
      body,
    ),
  removeOutboundCnam: (phoneNumber) =>
    pbxRequest("DELETE", `/cnam-outbound/${encodeURIComponent(phoneNumber)}`),
  auditActions: () => pbxGet("/audit-logs/resource-actions"),
  journals: (params) => pbxGet("/journals", params),
  journalMeta: () => pbxGet("/journals/module-type-actions"),
  cdrs: (params) => pbxGet("/cdrs", params),
  exportCdrs: (params) => pbxDownload("/cdrs/export", params),
  phones: (domain) => pbxGet("/phones", { domain }),
  createPhone: (domain, body) => pbxRequest("POST", "/phones", body, { domain }),
  deletePhone: (macAddress, domain) =>
    pbxRequest("DELETE", `/phones/${encodeURIComponent(macAddress)}`, undefined, { domain }),
  phoneDetail: (macAddress, domain) =>
    pbxGet(`/phones/${encodeURIComponent(macAddress)}`, { domain }),
  resyncPhone: (macAddress, domain) =>
    pbxRequest(
      "POST",
      `/phones/${encodeURIComponent(macAddress)}/resync`,
      undefined,
      { domain },
    ),
  endpointControlOverview: (domain) =>
    pbxGet("/endpoint-control/overview", { domain }),
  createEndpoint: (domain, body) =>
    pbxRequest("POST", "/endpoint-control/subscribers", body, { domain }),
  deleteEndpoint: (domain, user, opts = {}) =>
    pbxRequest(
      "DELETE",
      `/endpoint-control/subscribers/${encodeURIComponent(user)}`,
      undefined,
      { domain, delete_phone: opts.deletePhone === false ? "false" : "true" },
    ),
  endpointDetail: (domain, user) =>
    pbxGet(`/endpoint-control/subscribers/${encodeURIComponent(user)}/detail`, {
      domain,
    }),
  updateEndpointSubscriber: (domain, user, body) =>
    pbxRequest(
      "PATCH",
      `/endpoint-control/subscribers/${encodeURIComponent(user)}`,
      body,
      { domain },
    ),
  updateSubscriberE911CallerId: (domain, user, e911_caller_id) =>
    pbxRequest(
      "PATCH",
      `/endpoint-control/subscribers/${encodeURIComponent(user)}/e911-caller-id`,
      { e911_caller_id },
      { domain },
    ),
  endpointSites: (domain) => pbxGet("/endpoint-control/sites", { domain }),
  endpointVoicemails: (domain, user) =>
    pbxGet(
      `/endpoint-control/subscribers/${encodeURIComponent(user)}/voicemails`,
      { domain },
    ),
  endpointMonitoring: (domain, user) =>
    pbxGet(
      `/endpoint-control/subscribers/${encodeURIComponent(user)}/monitoring`,
      { domain },
    ),
  updateEndpointMonitoring: (domain, user, enabled) =>
    pbxRequest(
      "PATCH",
      `/endpoint-control/subscribers/${encodeURIComponent(user)}/monitoring`,
      { enabled },
      { domain },
    ),
  endpointGroups: (domain, user) =>
    pbxGet(`/endpoint-control/subscribers/${encodeURIComponent(user)}/groups`, {
      domain,
    }),
  updatePhoneOverrides: (macAddress, domain, overrides) =>
    pbxRequest(
      "PATCH",
      `/phones/${encodeURIComponent(macAddress)}/overrides`,
      { overrides },
      { domain },
    ),
  e911ReviewOverview: (domain) =>
    pbxGet("/e911/review-overview", domain ? { domain } : undefined),
  e911DomainDefaults: (domain) => pbxGet("/e911/domain-defaults", { domain }),
  updateE911DomainDefaults: (domain, body) =>
    pbxRequest("PATCH", "/e911/domain-defaults", body, { domain }),
  createEmergencyPoolNumber: (domain, body) =>
    pbxRequest("POST", "/e911/emergency-pool", body, { domain }),
  updateEmergencyPoolNumber: (domain, callid, body) =>
    pbxRequest(
      "PATCH",
      `/e911/emergency-pool/${encodeURIComponent(callid)}`,
      body,
      { domain },
    ),
  deleteEmergencyPoolNumber: (domain, callid) =>
    pbxRequest(
      "DELETE",
      `/e911/emergency-pool/${encodeURIComponent(callid)}`,
      undefined,
      { domain },
    ),
  subscriberE911Profile: (domain, user) =>
    pbxGet(`/e911/subscribers/${encodeURIComponent(user)}/profile`, { domain }),
  offlineEndpointsOverview: (domain) =>
    pbxGet("/offline-endpoints/overview", { domain }),
  mosScores: (params) => pbxGet("/mos-scores", params),
};
