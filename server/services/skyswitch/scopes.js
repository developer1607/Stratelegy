/** OAuth scopes the PBX proxy may need. */

export const SKYSWITCH_FEATURE_SCOPES = {
  log: 'log',
  report: 'report',
  uc_config: 'uc_config',
  entitlement: 'entitlement',
};

export const SKYSWITCH_PORTAL_SCOPES = [
  'pbx',
  'routing',
  'e911',
  'messaging',
  'phone_number',
  'log',
  'report',
  'uc_config',
  'entitlement',
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
      ucConfig: hasSkySwitchScope(configured, SKYSWITCH_FEATURE_SCOPES.uc_config),
      entitlements: hasSkySwitchScope(configured, SKYSWITCH_FEATURE_SCOPES.entitlement),
    },
  };
}

const scopeMsgs = {
  log: { code: 'skyswitch_log_scope_required', message: 'Call logs unavailable.' },
  report: { code: 'skyswitch_report_scope_required', message: 'Reports unavailable.' },
  uc_config: { code: 'skyswitch_uc_config_scope_required', message: 'UC config unavailable.' },
  entitlement: { code: 'skyswitch_entitlement_scope_required', message: 'Entitlements unavailable.' },
};

export function scopeErrBody(err, feature) {
  if (err?.status !== 403) return null;
  const info = scopeMsgs[feature];
  if (!info) return null;
  return { status: 403, body: { message: info.message, code: info.code } };
}
