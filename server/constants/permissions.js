import {
  PERMISSION_KEYS,
  PERMISSION_DEFS,
  expandPermissionKeys,
  hasPermissionKey,
} from "./permissionRegistry.js";

export {
  PERMISSION_KEYS,
  PERMISSION_DEFS,
  expandPermissionKeys,
  hasPermissionKey,
};

export const DEFAULT_PERMISSIONS = Object.fromEntries(
  PERMISSION_KEYS.map((k) => [k, false]),
);

export const ADMIN_PERMISSIONS = Object.fromEntries(
  PERMISSION_KEYS.map((k) => [k, true]),
);

export function emptyPermissions() {
  return { ...DEFAULT_PERMISSIONS };
}

export function permissionsFromKeys(keys) {
  const expanded = expandPermissionKeys(keys);
  const out = emptyPermissions();
  for (const key of expanded) {
    if (key in out) out[key] = true;
  }
  return out;
}

export function mergePermissionObjects(base, overrides) {
  const out = { ...base };
  for (const key of PERMISSION_KEYS) {
    if (overrides[key] !== undefined) out[key] = Boolean(overrides[key]);
  }
  return out;
}

export function hasPermission(permissions, key) {
  return hasPermissionKey(permissions, key);
}
