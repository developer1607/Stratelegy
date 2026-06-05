/** SkySwitch OAuth scopes required by portal PBX features. */

export const SKYSWITCH_FEATURE_SCOPES = {
  log: 'log',
  report: 'report',
};

/** Scopes used by implemented portal PBX endpoints (see apiRegistry.js). */
export const SKYSWITCH_PORTAL_SCOPES = [
  'pbx',
  'routing',
  'e911',
  'messaging',
  'phone_number',
  'log',
  'report',
];

export function parseConfiguredScopes(scopeString) {
  if (!scopeString || scopeString.trim() === '*') return new Set(['*']);
  return new Set(
    scopeString
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  );
}

export function hasSkySwitchScope(configured, required) {
  const scopes = parseConfiguredScopes(configured);
  if (scopes.has('*')) return true;
  return scopes.has(required);
}

export function getMissingSkySwitchScopes(configured, requiredList) {
  return requiredList.filter((scope) => !hasSkySwitchScope(configured, scope));
}

export function getSkySwitchScopeStatus(configured) {
  const missing = getMissingSkySwitchScopes(configured, Object.values(SKYSWITCH_FEATURE_SCOPES));
  return {
    configured: configured || '*',
    hasWildcard: hasSkySwitchScope(configured, '*'),
    missing,
    features: {
      auditLogs: hasSkySwitchScope(configured, SKYSWITCH_FEATURE_SCOPES.log),
      reports: hasSkySwitchScope(configured, SKYSWITCH_FEATURE_SCOPES.report),
    },
  };
}

export function mapSkySwitchScopeError(err, feature) {
  if (err?.status !== 403) return null;
  if (feature === 'log') {
    return {
      status: 403,
      body: {
        message:
          'Audit log access requires the log scope on your SkySwitch API credentials. Add log to SKYSWITCH_SCOPE.',
        code: 'skyswitch_log_scope_required',
      },
    };
  }
  if (feature === 'report') {
    return {
      status: 403,
      body: {
        message:
          'Report access requires the report scope on your SkySwitch API credentials. Add report to SKYSWITCH_SCOPE.',
        code: 'skyswitch_report_scope_required',
      },
    };
  }
  return null;
}
