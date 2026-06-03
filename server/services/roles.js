import { query, queryOne } from '../db/query.js';
import { PERMISSION_KEYS, emptyPermissions } from '../constants/permissions.js';

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

export { PERMISSION_KEYS };
