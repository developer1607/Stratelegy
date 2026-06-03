/** Case-insensitive domain comparison (SkySwitch domain strings). */
export function domainsMatch(a, b) {
  if (!a || !b) return false;
  return String(a).trim().toLowerCase() === String(b).trim().toLowerCase();
}

/** Find domain record in list by domain name (case-insensitive). */
export function findDomainRecord(domains, domainName) {
  if (!domainName || !Array.isArray(domains)) return null;
  return domains.find((d) => domainsMatch(d.domain, domainName)) || null;
}
