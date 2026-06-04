import {
  PERMISSION_KEYS,
  CRM_MODULE_KEYS,
  SUPPORT_MODULE_KEYS,
  PBX_MODULE_KEYS,
  PBX_ACTION_KEYS,
  TICKET_ACTION_KEYS,
  buildPagePermissionMap,
  buildEntityReadMap,
  buildEntityWriteMap,
  buildPageLists,
  hasPermissionKey,
  hasModuleMaster,
} from '@shared/permissionRegistry.js';

export { PERMISSION_KEYS, CRM_MODULE_KEYS, SUPPORT_MODULE_KEYS, PBX_MODULE_KEYS, PBX_ACTION_KEYS };

export function emptyPermissionFlags() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, false]));
}

export function adminPermissionFlags() {
  return Object.fromEntries(PERMISSION_KEYS.map((k) => [k, true]));
}

const { CRM_PAGES, SUPPORT_PAGES, PBX_PAGES } = buildPageLists();
export { CRM_PAGES, SUPPORT_PAGES, PBX_PAGES };

export const PAGE_PERMISSION_KEYS = buildPagePermissionMap();
export const ENTITY_READ_KEYS = buildEntityReadMap();
export const ENTITY_WRITE_KEYS = buildEntityWriteMap();

export const PBX_ACTION_KEYS_MAP = {
  manageRouting: 'can_manage_pbx_routing',
  manageRouteByAni: 'can_manage_route_by_ani',
  manageE911: 'can_manage_e911',
  manageEndpoints: 'can_manage_pbx_endpoints',
  makeCall: 'can_make_pbx_calls',
  manageReports: 'can_manage_pbx_reports',
};

function hasAnyKey(permissions, keys) {
  return keys.some((k) => hasPermissionKey(permissions, k));
}

/**
 * @typedef {Record<string, boolean> & { isAdmin: boolean }} PortalPermissions
 * @param {object|null|undefined} user
 * @param {Record<string, boolean>|null|undefined} storedPermissions
 * @returns {PortalPermissions}
 */
export function resolvePermissions(user, storedPermissions) {
  const denied = { ...emptyPermissionFlags(), isAdmin: false };

  if (!user) return denied;

  if (user.role === 'admin') {
    return { ...adminPermissionFlags(), isAdmin: true };
  }

  if (!storedPermissions) return denied;

  const out = { ...denied, isAdmin: false };
  for (const key of PERMISSION_KEYS) {
    out[key] = Boolean(storedPermissions[key]);
  }
  return out;
}

export function canAccessPage(permissions, pageName) {
  if (!permissions) return false;
  if (pageName === 'Profile') return true;
  if (permissions.isAdmin) return true;

  const key = PAGE_PERMISSION_KEYS[pageName];
  if (key === '__admin__') return false;
  if (!key) return false;

  const module = getModuleForPage(pageName);
  if (module && hasModuleMaster(permissions, module)) return true;
  return hasPermissionKey(permissions, key);
}

export function canReadEntity(permissions, entityName) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  const key = ENTITY_READ_KEYS[entityName];
  if (!key) return false;
  return hasPermissionKey(permissions, key);
}

export function canWriteEntity(permissions, entityName) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  const key = ENTITY_WRITE_KEYS[entityName];
  if (!key) return false;
  return hasPermissionKey(permissions, key);
}

export function canTicketAction(permissions, action) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  const key = TICKET_ACTION_KEYS[action];
  if (!key) return false;
  return hasPermissionKey(permissions, key);
}

export function canPbxAction(permissions, action) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  if (hasModuleMaster(permissions, 'pbx')) return true;
  const key = PBX_ACTION_KEYS_MAP[action];
  return key ? hasPermissionKey(permissions, key) : false;
}

export function hasCrmModuleAccess(permissions) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  return hasModuleMaster(permissions, 'crm') || hasAnyKey(permissions, CRM_MODULE_KEYS);
}

export function hasSupportModuleAccess(permissions) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  return hasModuleMaster(permissions, 'support') || hasAnyKey(permissions, SUPPORT_MODULE_KEYS);
}

export function hasPbxModuleAccess(permissions) {
  if (!permissions) return false;
  if (permissions.isAdmin) return true;
  return hasModuleMaster(permissions, 'pbx') || hasAnyKey(permissions, PBX_MODULE_KEYS);
}

export function getDefaultHomePage(permissions) {
  if (!permissions) return null;
  if (canAccessPage(permissions, 'Dashboard')) return 'Dashboard';
  if (canAccessPage(permissions, 'SupportDashboard')) return 'SupportDashboard';
  if (canAccessPage(permissions, 'PBXDashboard')) return 'PBXDashboard';
  if (hasCrmModuleAccess(permissions)) return 'Dashboard';
  if (hasSupportModuleAccess(permissions)) return 'SupportDashboard';
  if (hasPbxModuleAccess(permissions)) return 'PBXDashboard';
  return null;
}

export function getModuleForPage(pageName) {
  if (CRM_PAGES.includes(pageName)) return 'crm';
  if (SUPPORT_PAGES.includes(pageName)) return 'support';
  if (PBX_PAGES.includes(pageName)) return 'pbx';
  return null;
}

export { hasPermissionKey };
