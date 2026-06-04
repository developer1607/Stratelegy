import { request } from '@/api/client';

function pbxRequest(method, path, body, query) {
  const params = new URLSearchParams();
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value != null && value !== '') params.set(key, String(value));
    }
  }
  const qs = params.toString();
  return request(method, `/api/pbx${path}${qs ? `?${qs}` : ''}`, body);
}

function pbxGet(path, query) {
  return pbxRequest('GET', path, undefined, query);
}

export const pbxApi = {
  status: () => pbxGet('/status'),
  domains: () => pbxGet('/domains'),
  resellers: () => pbxGet('/resellers'),
  apiCatalog: () => pbxGet('/api-catalog'),
  dashboard: (domain) => pbxGet('/dashboard', { domain }),
  subscribers: (domain, filter) => pbxGet('/subscribers', { domain, filter }),
  extensions: (domain) => pbxGet('/extensions', { domain }),
  endpoints: (domain) => pbxGet('/endpoints', { domain }),
  messagingUsers: (domain) => pbxGet('/messaging-users', { domain }),
  pbxUserPhoneNumbers: (domain, user, opts) =>
    pbxGet('/messaging/aliases/pbxuser', { domain, user, ...opts }),
  offlineEndpoints: (domain) => pbxGet('/offline-endpoints', { domain }),
  e911: () => pbxGet('/e911'),
  e911Countries: () => pbxGet('/e911/countries'),
  e911States: () => pbxGet('/e911/states'),
  e911Detail: (phoneNumber) => pbxGet(`/e911/${encodeURIComponent(phoneNumber)}`),
  validateE911Address: (query) => pbxGet('/e911/validate/address', query),
  provisionE911: (phoneNumber, body) =>
    pbxRequest('PUT', `/e911/${encodeURIComponent(phoneNumber)}`, body),
  unprovisionE911: (phoneNumber) =>
    pbxRequest('DELETE', `/e911/${encodeURIComponent(phoneNumber)}`),
  trunkGroups: () => pbxGet('/trunk-groups'),
  sipAlg: (domain) => pbxGet('/sip-alg', { domain }),
  callRouting: (domain) => pbxGet('/call-routing', { domain }),
  getRoute: (phoneNumber) => pbxGet(`/routes/${encodeURIComponent(phoneNumber)}`),
  setRoute: (phoneNumber, body) =>
    pbxRequest('PUT', `/routes/${encodeURIComponent(phoneNumber)}`, body),
  deleteRoute: (phoneNumber) => pbxRequest('DELETE', `/routes/${encodeURIComponent(phoneNumber)}`),
  routeByAni: (domain, ani, dnis) => pbxGet('/route-by-ani', { domain, ani, dnis }),
  provisionRouteByAni: (query) => pbxRequest('PUT', '/route-by-ani', undefined, query),
  deleteRouteByAni: (query) => pbxRequest('DELETE', '/route-by-ani', undefined, query),
  makeCall: (body) => pbxRequest('POST', '/make-call', body),
  provisionHubUser: (body) => pbxRequest('PUT', '/messaging/hubusers', body),
  unprovisionHubUser: (userId) =>
    pbxRequest('DELETE', `/messaging/hubusers/${encodeURIComponent(userId)}`),
  voicemail: (domain) => pbxGet('/voicemail', { domain }),
  autoAttendants: (domain) => pbxGet('/auto-attendants', { domain }),
  callQueues: (domain) => pbxGet('/call-queues', { domain }),
  phoneNumbers: (domain, scope) => pbxGet('/phone-numbers', { domain, scope }),
  auditLogs: (params) => pbxGet('/audit-logs', params),
  reportTypes: () => pbxGet('/reports/types'),
  listReports: (page = 1, perPage = 25) => pbxGet('/reports', { page, per_page: perPage }),
  getReport: (reportId) => pbxGet(`/reports/${encodeURIComponent(reportId)}`),
  cancelReport: (reportId) => pbxRequest('DELETE', `/reports/${encodeURIComponent(reportId)}`),
  downloadReportFile: (fileId) => pbxGet(`/reports/files/${encodeURIComponent(fileId)}/download`),
  troubleshooting: (domain) => pbxGet('/troubleshooting', { domain }),
  uiConfig: (domain, config_name) => pbxGet('/ui-config', { domain, config_name }),
};
