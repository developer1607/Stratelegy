import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/query.js';
import { PERMISSION_KEYS, emptyPermissions } from '../constants/permissions.js';
import { createHttpError } from '../utils/errors.js';

export async function listPortalRoles() {
  const rows = await query('SELECT * FROM roles ORDER BY sort_order ASC, name ASC');
  return rows.map(rowToRole);
}

export async function getPortalRoleById(id) {
  const row = await queryOne('SELECT * FROM roles WHERE id = ?', [id]);
  return row ? rowToRole(row) : null;
}

export async function getPortalRoleBySlug(slug) {
  const row = await queryOne('SELECT * FROM roles WHERE slug = ?', [slug]);
  return row ? rowToRole(row) : null;
}

export async function getRolePermissionKeys(roleId) {
  if (!roleId) return [];
  const rows = await query(
    'SELECT permission_key FROM role_permissions WHERE role_id = ? ORDER BY permission_key',
    [roleId]
  );
  return rows.map((r) => r.permission_key);
}

export async function getRolePermissionObject(roleId) {
  const keys = await getRolePermissionKeys(roleId);
  const out = emptyPermissions();
  for (const key of keys) {
    if (key in out) out[key] = true;
  }
  return out;
}

export async function listRolesWithPermissions() {
  const roles = await listPortalRoles();
  const result = [];
  for (const role of roles) {
    result.push({
      ...role,
      permissions: await getRolePermissionObject(role.id),
    });
  }
  return result;
}

function rowToRole(row) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    is_system: Boolean(row.is_system),
    sort_order: Number(row.sort_order),
  };
}

function slugifyName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

async function uniqueSlug(baseSlug) {
  let slug = baseSlug || 'custom-role';
  let suffix = 0;
  while (await queryOne('SELECT id FROM roles WHERE slug = ?', [slug])) {
    suffix += 1;
    slug = `${baseSlug}-${suffix}`;
  }
  return slug;
}

function permissionKeysFromObject(permissions = {}) {
  return PERMISSION_KEYS.filter((key) => Boolean(permissions[key]));
}

async function setRolePermissions(roleId, permissionKeys) {
  await execute('DELETE FROM role_permissions WHERE role_id = ?', [roleId]);
  for (const key of permissionKeys) {
    if (!PERMISSION_KEYS.includes(key)) continue;
    await execute('INSERT INTO role_permissions (role_id, permission_key) VALUES (?, ?)', [
      roleId,
      key,
    ]);
  }
}

export async function createPortalRole({ name, description, permissions = {} }) {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) throw createHttpError(400, 'Role name is required');

  const id = uuidv4();
  const slug = await uniqueSlug(`custom-${slugifyName(trimmedName) || 'role'}`);
  const permissionKeys = permissionKeysFromObject(permissions);
  const maxSort = await queryOne('SELECT COALESCE(MAX(sort_order), 0) AS max_sort FROM roles');
  const sortOrder = Number(maxSort?.max_sort || 0) + 10;

  await execute(
    `INSERT INTO roles (id, slug, name, description, is_system, sort_order)
     VALUES (?, ?, ?, ?, 0, ?)`,
    [id, slug, trimmedName, description?.trim() || null, sortOrder]
  );
  await setRolePermissions(id, permissionKeys);

  return {
    ...(await getPortalRoleById(id)),
    permissions: await getRolePermissionObject(id),
  };
}

export async function updatePortalRole(id, { name, description, permissions }) {
  const role = await getPortalRoleById(id);
  if (!role) throw createHttpError(404, 'Portal role not found');

  const updates = [];
  const params = [];

  if (role.is_system && (name !== undefined || description !== undefined || permissions !== undefined)) {
    throw createHttpError(403, 'System roles cannot be edited. Create a custom role instead.');
  }

  if (name !== undefined) {
    const trimmedName = String(name).trim();
    if (!trimmedName) throw createHttpError(400, 'Role name is required');
    updates.push('name = ?');
    params.push(trimmedName);
  }
  if (description !== undefined) {
    updates.push('description = ?');
    params.push(description?.trim() || null);
  }

  if (updates.length) {
    params.push(id);
    await execute(`UPDATE roles SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  if (permissions !== undefined) {
    await setRolePermissions(id, permissionKeysFromObject(permissions));
  }

  return {
    ...(await getPortalRoleById(id)),
    permissions: await getRolePermissionObject(id),
  };
}

export async function deletePortalRole(id) {
  const role = await getPortalRoleById(id);
  if (!role) throw createHttpError(404, 'Portal role not found');
  if (role.is_system) {
    throw createHttpError(403, 'System roles cannot be deleted.');
  }

  const assigned = await queryOne(
    'SELECT COUNT(*) AS c FROM user_permissions WHERE role_id = ?',
    [id]
  );
  if (Number(assigned?.c) > 0) {
    throw createHttpError(
      409,
      'This role is assigned to users. Reassign them before deleting the role.'
    );
  }

  await execute('DELETE FROM role_permissions WHERE role_id = ?', [id]);
  await execute('DELETE FROM roles WHERE id = ?', [id]);
}

export { PERMISSION_KEYS };
