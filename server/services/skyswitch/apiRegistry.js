/**
 * Maps Stratelegy /api/pbx/* proxy routes to SkySwitch Telco API paths (apiDocumentation.md).
 * Portal scope only — not every SkySwitch endpoint (151 total) is exposed to the browser.
 */

export const SKYSWITCH_API_REGISTRY = [
  {
    portal: 'GET /api/pbx/status',
    skyswitch: 'GET /accounts/{id}/pbx/domains',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/domains',
    skyswitch: 'GET /accounts/{id}/pbx/domains',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/resellers',
    skyswitch: 'GET /accounts/{id}/pbx/resellers',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/dashboard',
    skyswitch: 'multiple (domains, subscribers, e911, trunks)',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/subscribers',
    skyswitch: 'GET /accounts/{id}/pbx/subscribers',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/extensions',
    skyswitch: 'GET /accounts/{id}/pbx/subscribers?filter=subscriber',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/phone-numbers',
    skyswitch: 'GET /accounts/{id}/pbx/phone-numbers | /phone-numbers',
    scope: 'pbx|phone_number',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/ui-config',
    skyswitch: 'GET /accounts/{id}/pbx/ui-config',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/route-by-ani',
    skyswitch: 'GET /accounts/{id}/pbx/route-by-ani',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'PUT /api/pbx/route-by-ani',
    skyswitch: 'PUT /accounts/{id}/pbx/route-by-ani',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'DELETE /api/pbx/route-by-ani',
    skyswitch: 'DELETE /accounts/{id}/pbx/route-by-ani',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'POST /api/pbx/make-call',
    skyswitch: 'POST /accounts/{id}/pbx/make-call',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/routes/:phone',
    skyswitch: 'GET /accounts/{id}/phone-numbers/{phone}/route',
    scope: 'routing',
    implemented: true,
  },
  {
    portal: 'PUT /api/pbx/routes/:phone',
    skyswitch: 'PUT /accounts/{id}/phone-numbers/{phone}/route',
    scope: 'routing',
    implemented: true,
  },
  {
    portal: 'DELETE /api/pbx/routes/:phone',
    skyswitch: 'DELETE /accounts/{id}/phone-numbers/{phone}/route',
    scope: 'routing',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/e911',
    skyswitch: 'GET /accounts/{id}/e911/endpoints',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/e911/:phone',
    skyswitch: 'GET /accounts/{id}/phone-numbers/{phone}/e911',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'PUT /api/pbx/e911/:phone',
    skyswitch: 'PUT /accounts/{id}/phone-numbers/{phone}/e911',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'DELETE /api/pbx/e911/:phone',
    skyswitch: 'DELETE /accounts/{id}/phone-numbers/{phone}/e911',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/e911/validate/address',
    skyswitch: 'GET /accounts/{id}/e911/address',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/e911/countries',
    skyswitch: 'GET /accounts/{id}/e911/countries',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/e911/states',
    skyswitch: 'GET /accounts/{id}/e911/states',
    scope: 'e911',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/trunk-groups',
    skyswitch: 'GET /accounts/{id}/trunk-groups',
    scope: 'routing',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/auto-attendants',
    skyswitch: 'GET /accounts/{id}/auto-attendants',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/call-queues',
    skyswitch: 'GET /accounts/{id}/call-queues',
    scope: 'pbx',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/messaging-users',
    skyswitch: 'GET /accounts/{id}/messaging/users',
    scope: 'messaging',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/messaging/aliases/pbxuser',
    skyswitch: 'GET /accounts/{id}/messaging/aliases/pbxuser',
    scope: 'messaging',
    implemented: true,
  },
  {
    portal: 'PUT /api/pbx/messaging/hubusers',
    skyswitch: 'PUT /accounts/{id}/messaging/hubusers',
    scope: 'messaging',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/reports',
    skyswitch: 'GET /accounts/{id}/reports',
    scope: 'report',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/reports/types',
    skyswitch: 'GET /accounts/{id}/reports/types',
    scope: 'report',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/reports/:id',
    skyswitch: 'GET /accounts/{id}/reports/{id}',
    scope: 'report',
    implemented: true,
  },
  {
    portal: 'DELETE /api/pbx/reports/:id',
    skyswitch: 'DELETE /accounts/{id}/reports/{id}',
    scope: 'report',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/reports/files/:id/download',
    skyswitch: 'GET /v2/files/{file_id}',
    scope: 'report',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/audit-logs',
    skyswitch: 'GET /accounts/{id}/audit-logs',
    scope: 'log',
    implemented: true,
  },
  {
    portal: 'GET /api/pbx/offline-endpoints',
    skyswitch: 'GET /accounts/{id}/fax-atas + messaging/users',
    scope: 'pbx|messaging',
    implemented: true,
  },
];

/** SkySwitch areas documented but intentionally not proxied (admin/back-office tooling). */
export const SKYSWITCH_OUT_OF_SCOPE = [
  'tendlc (21 endpoints)',
  'tfa2p (9 endpoints)',
  'port-in / lnp',
  'catalog / inventory purchase flows',
  'users / sub-accounts CRUD',
  'branding',
  'billing',
];

/** Reports: apiDocumentation.md documents list/types/status/cancel/download only — no queue/create POST. */
export const REPORTS_API_NOTE =
  'Report generation is not exposed in apiDocumentation.md; queue jobs in SkySwitch back-office.';
