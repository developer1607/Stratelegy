import { hasPermissionKey, hasModuleMaster } from "./permissionRegistry.js";
import { isPbxDomainRestricted } from "./pbxDomainAccess.js";

/** PBX data scopes → permission keys that grant read access. */
export const PBX_DATA_SCOPES = {
  connection: ["can_view_troubleshooting"],
  domains: ["can_view_pbx_domains_page"],
  dashboard: ["can_view_pbx_dashboard"],
  extensions: ["can_view_extensions_page"],
  endpointControl: ["can_view_endpoint_control"],
  offlineEndpoints: ["can_view_offline_endpoints"],
  callRouting: ["can_view_call_routing_page"],
  phoneNumbers: ["can_view_phone_numbers_page"],
  routeByAni: ["can_view_route_by_ani_page", "can_manage_route_by_ani"],
  sipTrunks: ["can_view_sip_trunks"],
  e911: ["can_view_e911_review", "can_view_e911_reports"],
  e911Review: ["can_view_e911_review"],
  e911Reports: ["can_view_e911_reports"],
  pbxReports: ["can_view_pbx_reports_page", "can_view_e911_reports"],
  mosScores: ["can_view_mos_scores_page", "can_view_call_logs_page"],
  callLogs: ["can_view_call_logs_page"],
  voicemail: ["can_view_voicemail_page"],
  troubleshooting: ["can_view_troubleshooting"],
  sipAlg: ["can_view_sip_alg"],
};

export function canAccessPbxDataScope(permissions, scope) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  if (hasModuleMaster(permissions, "pbx")) return true;
  const keys = PBX_DATA_SCOPES[scope];
  if (!keys?.length) return false;
  return keys.some((key) => hasPermissionKey(permissions, key));
}

export function canViewPbxDomains(permissions) {
  return canAccessPbxDataScope(permissions, "domains");
}

export function canViewPbxConnectionStatus(permissions) {
  return canAccessPbxDataScope(permissions, "connection");
}

export function domainListFallbackAllowed(permissions) {
  return canViewPbxDomains(permissions);
}

/** Dashboard / troubleshooting stat tiles keyed by data scope. */
export const PBX_SUMMARY_STAT_SCOPES = {
  domains: "domains",
  subscribers: "extensions",
  e911Endpoints: "e911",
  trunkGroups: "sipTrunks",
  phoneNumbers: "phoneNumbers",
  autoAttendants: "voicemail",
};

export function filterPbxSummaryFields(permissions, summary) {
  if (!summary || typeof summary !== "object") return summary;
  if (!permissions || permissions.isAdmin || permissions.can_access_pbx)
    return summary;

  const out = {};
  if (
    (canViewPbxDomains(permissions) || isPbxDomainRestricted(permissions)) &&
    summary.domain != null
  ) {
    out.domain = summary.domain;
  }
  for (const [field, scope] of Object.entries(PBX_SUMMARY_STAT_SCOPES)) {
    if (canAccessPbxDataScope(permissions, scope) && summary[field] != null) {
      out[field] = summary[field];
    }
  }
  if (
    (canViewPbxDomains(permissions) || isPbxDomainRestricted(permissions)) &&
    summary.domainList
  ) {
    out.domainList = summary.domainList;
  }
  if (
    isPbxDomainRestricted(permissions) &&
    Array.isArray(summary.assignedDomains)
  ) {
    out.assignedDomains = summary.assignedDomains;
  }
  if (
    !isPbxDomainRestricted(permissions) &&
    Array.isArray(summary.scopeDomains)
  ) {
    out.scopeDomains = summary.scopeDomains;
  }
  if (summary.scope) {
    out.scope = summary.scope;
  }
  if (canViewPbxConnectionStatus(permissions) && summary.status) {
    out.status = summary.status;
  }
  if (canViewPbxConnectionStatus(permissions) && summary.checkedAt) {
    out.checkedAt = summary.checkedAt;
  }
  return out;
}
