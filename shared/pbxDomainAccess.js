/** PBX domain assignment — restrict portal users to assigned SkySwitch domain(s). */

export function domainsMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

export function parsePbxDomains(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) {
    return value.map((d) => String(d).trim()).filter(Boolean);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map((d) => String(d).trim()).filter(Boolean);
      }
    } catch {
      return trimmed
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean);
    }
  }
  return [];
}

export function serializePbxDomains(domains) {
  const list = parsePbxDomains(domains);
  return list.length ? JSON.stringify(list) : '';
}

/** User is limited to assigned domain(s) — not full PBX or admin. */
export function isPbxDomainRestricted(permissions) {
  if (!permissions || permissions.isAdmin) return false;
  if (permissions.can_access_pbx) return false;
  return Boolean(permissions.can_access_pbx_domain_scoped);
}

export function getAssignedPbxDomains(permissions) {
  return parsePbxDomains(permissions?.pbx_domains);
}

export function filterDomainsForUser(permissions, domains) {
  if (!Array.isArray(domains)) domains = [];
  if (!isPbxDomainRestricted(permissions)) return domains;

  const allowed = getAssignedPbxDomains(permissions);
  if (!allowed.length) return [];

  const matched = domains.filter((d) =>
    allowed.some((name) => domainsMatch(d.domain ?? d, name))
  );

  const seen = new Set(matched.map((d) => String(d.domain ?? d).trim().toLowerCase()));
  for (const name of allowed) {
    const key = String(name).trim().toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    matched.push({ domain: name, description: 'Assigned domain' });
  }

  return matched.sort((a, b) =>
    String(a.domain || '').localeCompare(String(b.domain || ''), undefined, {
      sensitivity: 'base',
    })
  );
}

export function assertDomainAllowed(permissions, domain) {
  if (!domain || !isPbxDomainRestricted(permissions)) return;
  const allowed = getAssignedPbxDomains(permissions);
  if (!allowed.length) {
    const err = new Error('No PBX domains assigned to your account');
    err.status = 403;
    throw err;
  }
  if (!allowed.some((name) => domainsMatch(name, domain))) {
    const err = new Error('You do not have access to this PBX domain');
    err.status = 403;
    throw err;
  }
}

/** Domain-scoped PBX users are read-only (no writes across the module). */
export function isPbxDomainReadOnly(permissions) {
  return isPbxDomainRestricted(permissions);
}

export function canPerformPbxWrite(permissions) {
  if (!permissions || permissions.isAdmin) return true;
  if (permissions.can_access_pbx) return true;
  return !isPbxDomainRestricted(permissions);
}

export function resolveAllowedPbxDomain(permissions, requestedDomain, fallbackDomain) {
  if (!isPbxDomainRestricted(permissions)) {
    return requestedDomain || fallbackDomain || null;
  }
  const allowed = getAssignedPbxDomains(permissions);
  if (!allowed.length) return null;
  if (requestedDomain) {
    assertDomainAllowed(permissions, requestedDomain);
    return requestedDomain;
  }
  if (fallbackDomain && allowed.some((d) => domainsMatch(d, fallbackDomain))) {
    return fallbackDomain;
  }
  return allowed[0];
}
