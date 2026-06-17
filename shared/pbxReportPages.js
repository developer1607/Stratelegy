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
    livePageLabel: 'Live offline endpoints',
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'deviceMonitoring',
    page: 'PBXReportDeviceMonitoring',
    title: 'Device Monitoring',
    description: 'Export registered user devices for a domain.',
    reportTypeKeys: ['user_device'],
    exportMatchPattern: 'user_device|user-devices',
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'domainExport',
    page: 'PBXReportDomainExport',
    title: 'Domain Export',
    description: 'Export SMS-enabled phone numbers grouped by domain.',
    reportTypeKeys: ['sms_enabled_by_domain'],
    exportMatchPattern: 'sms_enabled_by_domain|domain',
    livePage: 'PBXDomains',
    livePageLabel: 'Browse domains',
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'e911',
    page: 'PBXReportE911',
    title: 'E911',
    description: 'Export E911 routing, billable ECID, and subscriber mapping reports.',
    reportTypeKeys: ['e911', 'billable_e911', 'organization_e911pbx_mapping'],
    exportMatchPattern: 'e911|911|emergency',
    livePage: 'E911Review',
    livePageLabel: 'E911 review',
    permissionKey: 'can_view_e911_reports',
  },
  {
    id: 'sipAlg',
    page: 'PBXReportSIPALG',
    title: 'SIP ALG',
    description:
      'SIP ALG settings are available on the live monitoring screen. No async export type is returned for this account.',
    reportTypeKeys: [],
    livePage: 'SIPALG',
    livePageLabel: 'Live SIP ALG settings',
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'sipTrunk',
    page: 'PBXReportSIPTrunk',
    title: 'SIP Trunk',
    description:
      'SIP trunk groups are available on the live routing screen. No async export type is returned for this account.',
    reportTypeKeys: [],
    livePage: 'SIPTrunks',
    livePageLabel: 'Live SIP trunks',
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'vulnerabilityCheck',
    page: 'PBXReportVulnerabilityCheck',
    title: 'Vulnerability Check',
    description: 'Vulnerability check exports are not exposed via the Telco API for this account.',
    reportTypeKeys: [],
    permissionKey: 'can_view_pbx_reports_page',
  },
  {
    id: 'voicemail',
    page: 'PBXReportVoicemail',
    title: 'Voicemail',
    description:
      'Voicemail auto attendants and queues are on the live screen. No async export type is returned for this account.',
    reportTypeKeys: [],
    livePage: 'Voicemail',
    livePageLabel: 'Live voicemail',
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
