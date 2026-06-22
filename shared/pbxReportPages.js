/**
 * Individual PBX operational report pages (SkySwitch back-office Reports menu).
 * Shared between nav, permissions, and report page UI.
 */

/** @typedef {'can_view_pbx_reports_page'|'can_view_e911_reports'} ReportPagePermissionKey */

/**
 * @typedef {{
 *   id: string,
 *   page: string,
 *   title: string,
 *   description: string,
 *   reportTypeKeys: string[],
 *   exportMatchPattern?: string,
 *   livePage?: string,
 *   livePageLabel?: string,
 *   requiresDomain?: boolean,
 *   permissionKey: ReportPagePermissionKey,
 * }} PbxOperationalReportPageDef
 */

export const PBX_OPERATIONAL_REPORT_PAGES = [
  {
    id: 'offlineEndpoints',
    page: 'PBXReportOfflineEndpoints',
    title: 'Offline Endpoints',
    description: 'Export fax ATA routing and review offline endpoint delivery status.',
    reportTypeKeys: ['fax_ata', 'organization_fax_ata'],
    exportMatchPattern: 'fax_ata|offline',
    livePage: 'OfflineEndpoints',
    livePageLabel: 'Full offline endpoints view',
    requiresDomain: true,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'deviceMonitoring',
    page: 'PBXReportDeviceMonitoring',
    title: 'Device Monitoring',
    description: 'Registered user devices for a domain.',
    reportTypeKeys: ['user_device'],
    exportMatchPattern: 'user_device|user-devices',
    livePage: 'EndpointControl',
    livePageLabel: 'Full endpoint control view',
    requiresDomain: true,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'domainExport',
    page: 'PBXReportDomainExport',
    title: 'Domain Export',
    description: 'SMS-enabled phone numbers grouped by domain.',
    reportTypeKeys: ['sms_enabled_by_domain'],
    exportMatchPattern: 'sms_enabled_by_domain|domain',
    livePage: 'PBXDomains',
    livePageLabel: 'Browse domains',
    requiresDomain: false,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'e911',
    page: 'PBXReportE911',
    title: 'E911',
    description: 'E911 routing, billable ECID, and subscriber mapping.',
    reportTypeKeys: ['e911', 'billable_e911', 'organization_e911pbx_mapping'],
    exportMatchPattern: 'e911|911|emergency',
    livePage: 'E911Review',
    livePageLabel: 'Full E911 review',
    requiresDomain: false,
    permissionKey: 'can_view_e911_reports',
  },
  {
    id: 'sipAlg',
    page: 'PBXReportSIPALG',
    title: 'SIP ALG',
    description: 'SIP ALG settings for the selected domain.',
    reportTypeKeys: [],
    livePage: 'SIPALG',
    livePageLabel: 'Full SIP ALG view',
    requiresDomain: true,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'sipTrunk',
    page: 'PBXReportSIPTrunk',
    title: 'SIP Trunk',
    description: 'SIP trunk groups for your account or selected domain.',
    reportTypeKeys: [],
    livePage: 'SIPTrunks',
    livePageLabel: 'Full SIP trunks view',
    requiresDomain: false,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'vulnerabilityCheck',
    page: 'PBXReportVulnerabilityCheck',
    title: 'Vulnerability Check',
    description: 'Vulnerability check exports are not exposed via the Telco API for this account.',
    reportTypeKeys: [],
    requiresDomain: false,
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'voicemail',
    page: 'PBXReportVoicemail',
    title: 'Voicemail',
    description: 'Auto attendants, call queues, and subscriber services.',
    reportTypeKeys: [],
    livePage: 'Voicemail',
    livePageLabel: 'Full voicemail view',
    requiresDomain: true,
    permissionKey: 'can_view_pbx_reports_page',
  },
];

export const PBX_REPORT_PAGE_BY_ID = Object.fromEntries(
  PBX_OPERATIONAL_REPORT_PAGES.map((def) => [def.id, def])
);

export const PBX_REPORT_PAGE_BY_ROUTE = Object.fromEntries(
  PBX_OPERATIONAL_REPORT_PAGES.map((def) => [def.page, def])
);

export const PBX_REPORT_PAGE_ROUTES = PBX_OPERATIONAL_REPORT_PAGES.map((def) => def.page);

/** @param {Array<{ value: string }>} catalogRows */
export function resolveReportTypesForPage(def, catalogRows) {
  const byValue = new Map(catalogRows.map((row) => [row.value, row]));
  return def.reportTypeKeys.map((key) => byValue.get(key)).filter(Boolean);
}

export function exportMatchForPage(def) {
  if (!def.exportMatchPattern) return null;
  return new RegExp(def.exportMatchPattern, 'i');
}
