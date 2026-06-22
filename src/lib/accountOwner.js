const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** True when a value looks like a user id rather than a display name. */
export function isLikelyUserId(value) {
  return UUID_RE.test(String(value ?? '').trim());
}

/** Preferred CRM owner label for a portal user. */
export function userOwnerLabel(user) {
  if (!user) return '';
  const name = String(user.full_name ?? '').trim();
  if (name) return name;
  return String(user.email ?? '').trim();
}

/** Normalize stored owner text for display and filters. */
export function normalizeOwnerLabel(value) {
  const label = String(value ?? '').trim();
  if (!label || isLikelyUserId(label)) return '';
  return label;
}

export function displayAccountOwner(account) {
  return normalizeOwnerLabel(account?.owner);
}

export function ownerInitials(label) {
  const text = normalizeOwnerLabel(label);
  if (!text) return '?';
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}
