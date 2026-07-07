import {
  DEFAULT_PERMISSIONS,
  ADMIN_PERMISSIONS,
  PERMISSION_KEYS,
} from '../constants/permissions.js';
import {
  buildPagePermissionMap,
  buildEntityReadMap,
  buildEntityWriteMap,
  hasPermissionKey,
  hasModuleMaster,
  CRM_MODULE_KEYS,
} from '../constants/permissionRegistry.js';
import { getRolePermissionObject, getPortalRoleById } from './roles.js';
import { createEntity, filterEntities, updateEntity } from './entities.js';
import { ROLE_DEFAULT_DEPARTMENTS } from '../constants/ticketRouting.js';
import { execute } from '../db/query.js';
import { parsePbxDomains, serializePbxDomains } from '../../shared/pbxDomainAccess.js';

const PAGE_PERMISSION_KEYS = buildPagePermissionMap();
const ENTITY_READ_RULES = buildEntityReadMap();
const ENTITY_WRITE_RULES = buildEntityWriteMap();

const ADMIN_ONLY_ENTITIES = new Set([
  'User',
  'UserPermissions',
  'ContactSource',
  'LeadStage',
  'ActivityType',
  'AccountTier',
  'Industry',
  'DefaultSettings',
]);

/** CRM lookup tables — readable by any portal user with CRM module access. */
const CRM_REFERENCE_ENTITIES = new Set([
  'ContactSource',
  'LeadStage',
  'ActivityType',
  'AccountTier',
  'Industry',
  'DefaultSettings',
]);

function hasCrmModuleAccess(permissions) {
  if (!permissions) return false;
  if (hasModuleMaster(permissions, 'crm')) return true;
  return CRM_MODULE_KEYS.some((key) => hasPermissionKey(permissions, key));
}

export { hasCrmModuleAccess };

export { DEFAULT_PERMISSIONS, ADMIN_PERMISSIONS, PERMISSION_KEYS };

function normalizePermissionRecord(record) {
  if (!record) return null;
  const perms = { ...DEFAULT_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    perms[key] = Boolean(record[key]);
  }
  return {
    id: record.id,
    user_id: record.user_id,
    user_email: record.user_email,
    user_name: record.user_name,
    role_id: record.role_id || null,
    use_custom_permissions: Boolean(record.use_custom_permissions),
    pbx_domains: parsePbxDomains(record.pbx_domains),
    ...perms,
    created_date: record.created_date,
    updated_date: record.updated_date,
  };
}

export async function resolveStoredPermissionRecord(record) {
  if (!record) return null;
  const normalized = normalizePermissionRecord(record);
  if (normalized.use_custom_permissions || !normalized.role_id) {
    return normalized;
  }
  const rolePerms = await getRolePermissionObject(normalized.role_id);
  return { ...normalized, ...rolePerms };
}

export function getEffectivePermissions(user, storedPermissions) {
  if (!user) return { ...DEFAULT_PERMISSIONS };
  if (user.role === 'admin') return { ...ADMIN_PERMISSIONS };
  if (!storedPermissions) return { ...DEFAULT_PERMISSIONS };
  const effective = { ...DEFAULT_PERMISSIONS };
  for (const key of PERMISSION_KEYS) {
    effective[key] = Boolean(storedPermissions[key]);
  }
  return effective;
}

export async function getMyPermissions(userId) {
  const record = await getUserPermissionRecord(userId);
  if (!record) return null;
  return resolveStoredPermissionRecord(record);
}

export async function getPermissionsForUser(user) {
  const stored = await getMyPermissions(user.id);
  const effective = getEffectivePermissions(user, stored);
  if (user.role === 'admin') {
    return { ...effective, pbx_domains: [] };
  }
  const raw = await getUserPermissionRecord(user.id);
  return {
    ...effective,
    pbx_domains: parsePbxDomains(raw?.pbx_domains),
  };
}

export async function getUserPermissionRecord(userId) {
  const all = await filterEntities('UserPermissions', { user_id: userId });
  if (all.length === 0) return null;
  all.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
  return all[0];
}

export async function getAllPermissions() {
  const rows = await filterEntities('UserPermissions', {});
  const result = [];
  for (const row of rows) {
    result.push(await resolveStoredPermissionRecord(row));
  }
  return result;
}

export async function getUserPermissionsAdminView(userId) {
  const raw = await getUserPermissionRecord(userId);
  if (!raw) {
    return {
      user_id: userId,
      role_id: null,
      role: null,
      use_custom_permissions: false,
      effective: { ...DEFAULT_PERMISSIONS },
      overrides: { ...DEFAULT_PERMISSIONS },
    };
  }

  const role = raw.role_id ? await getPortalRoleById(raw.role_id) : null;
  const overrides = normalizePermissionRecord(raw);
  const effective = await resolveStoredPermissionRecord(raw);

  return {
    user_id: userId,
    role_id: raw.role_id || null,
    role,
    use_custom_permissions: Boolean(raw.use_custom_permissions),
    effective,
    overrides,
    record_id: raw.id,
  };
}

async function upsertUserPermissions({
  userId,
  userEmail,
  userName,
  roleId = undefined,
  useCustomPermissions = undefined,
  permissionUpdates = {},
}) {
  const existing = await getUserPermissionRecord(userId);
  const payload = { ...permissionUpdates };

  if (roleId !== undefined) payload.role_id = roleId;
  if (useCustomPermissions !== undefined) {
    payload.use_custom_permissions = useCustomPermissions ? 1 : 0;
  }

  if (existing) {
    const updated = await updateEntity('UserPermissions', existing.id, payload);
    return normalizePermissionRecord(updated);
  }

  const created = await createEntity('UserPermissions', {
    user_id: userId,
    user_email: userEmail || '',
    user_name: userName || '',
    role_id: roleId ?? null,
    use_custom_permissions: useCustomPermissions ? 1 : 0,
    ...DEFAULT_PERMISSIONS,
    ...permissionUpdates,
  });
  return normalizePermissionRecord(created);
}

export async function assignPortalRole({ userId, userEmail, userName, roleId }) {
  if (!roleId) {
    const err = new Error('roleId is required');
    err.status = 400;
    throw err;
  }
  const role = await getPortalRoleById(roleId);
  if (!role) {
    const err = new Error('Role not found');
    err.status = 404;
    throw err;
  }

  const rolePerms = await getRolePermissionObject(roleId);
  const record = await upsertUserPermissions({
    userId,
    userEmail,
    userName,
    roleId,
    useCustomPermissions: false,
    permissionUpdates: rolePerms,
  });

  try {
    const defaultDepts = ROLE_DEFAULT_DEPARTMENTS[role.slug];
    if (defaultDepts?.length) {
      await execute('UPDATE users SET departments = ? WHERE id = ?', [
        defaultDepts.join(','),
        userId,
      ]);
    }
  } catch (e) {
    console.error('[permissions] support routing defaults failed:', e.message);
  }

  return {
    ...(await resolveStoredPermissionRecord(record)),
    role,
  };
}

export async function updateUserPermissions({ userId, userEmail, userName, updates }) {
  const record = await upsertUserPermissions({
    userId,
    userEmail,
    userName,
    useCustomPermissions: true,
    permissionUpdates: updates,
  });
  return resolveStoredPermissionRecord(record);
}

export async function setUserPermissionFlags({
  userId,
  userEmail,
  userName,
  updates,
  useCustomPermissions = true,
}) {
  const record = await upsertUserPermissions({
    userId,
    userEmail,
    userName,
    useCustomPermissions,
    permissionUpdates: updates,
  });
  return resolveStoredPermissionRecord(record);
}

export async function setUserPbxDomains({ userId, userEmail, userName, domains }) {
  const list = parsePbxDomains(domains);
  const record = await upsertUserPermissions({
    userId,
    userEmail,
    userName,
    permissionUpdates: { pbx_domains: serializePbxDomains(list) },
  });
  const resolved = await resolveStoredPermissionRecord(record);
  return { ...resolved, pbx_domains: list };
}

export async function applyPortalRoleOnUserCreate({ userId, userEmail, userName, portalRoleId }) {
  if (!portalRoleId) return null;
  return assignPortalRole({ userId, userEmail, userName, roleId: portalRoleId });
}

export function canReadEntity(user, permissions, entityName) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (CRM_REFERENCE_ENTITIES.has(entityName)) {
    return hasCrmModuleAccess(permissions);
  }
  if (ADMIN_ONLY_ENTITIES.has(entityName)) return false;
  const key = ENTITY_READ_RULES[entityName];
  if (!key) return false;
  return hasPermissionKey(permissions, key);
}

export function canWriteEntity(user, permissions, entityName) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (ADMIN_ONLY_ENTITIES.has(entityName)) return false;
  const key = ENTITY_WRITE_RULES[entityName];
  if (!key) return false;
  return hasPermissionKey(permissions, key);
}

function moduleForPage(pageName) {
  if (
    [
      'Dashboard',
      'Accounts',
      'Contacts',
      'Leads',
      'Opportunities',
      'Calendar',
      'Activities',
      'Reports',
      'Settings',
      'Profile',
    ].includes(pageName)
  ) {
    return 'crm';
  }
  if (
    ['SupportDashboard', 'SupportTickets', 'SupportTicketDetail', 'KnowledgeBase'].includes(
      pageName
    )
  ) {
    return 'support';
  }
  if (
    pageName.startsWith('PBX') ||
    [
      'Extensions',
      'CallLogs',
      'CallRouting',
      'Voicemail',
      'EndpointControl',
      'OfflineEndpoints',
      'SIPALG',
      'Troubleshooting',
      'E911Review',
      'E911Reports',
      'PBXReports',
      'PBXMosScores',
      'SIPTrunks',
    ].includes(pageName)
  ) {
    return 'pbx';
  }
  return null;
}

export function canAccessPage(user, permissions, pageName) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (pageName === 'Profile') return true;

  const key = PAGE_PERMISSION_KEYS[pageName];
  if (key === '__admin__') return false;
  if (!key) return false;

  const module = moduleForPage(pageName);
  if (module && hasModuleMaster(permissions, module)) return true;
  return hasPermissionKey(permissions, key);
}
