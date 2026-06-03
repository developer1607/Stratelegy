import {
  PERMISSION_KEYS,
  CRM_MODULE_KEYS,
  SUPPORT_MODULE_KEYS,
  PBX_MODULE_KEYS,
} from '@shared/permissionRegistry.js';

export { PERMISSION_KEYS, CRM_MODULE_KEYS, SUPPORT_MODULE_KEYS, PBX_MODULE_KEYS };

export function emptyPermissionFlags() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, false]));
}

export function adminPermissionFlags() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true]));
}
