import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from './query.js';
import { expandPermissionKeys, PBX_READ_KEYS } from '../constants/permissionRegistry.js';

/** Portal roles aligned with sidebar modules (CRM, Support, PBX). */
export const SEEDED_ROLES = [
  {
    slug: 'crm',
    name: 'CRM',
    description: 'Sales module — accounts, contacts, leads, calendar, activities, reports.',
    sort_order: 10,
    permissions: expandPermissionKeys(['can_access_crm']),
  },
  {
    slug: 'support',
    name: 'Support',
    description: 'Support desk — tickets, knowledge base, assign, and close.',
    sort_order: 20,
    permissions: expandPermissionKeys(['can_access_support']),
  },
  {
    slug: 'support_viewer',
    name: 'Support Viewer',
    description: 'Read tickets and KB; add comments only.',
    sort_order: 25,
    permissions: expandPermissionKeys([
      'can_view_support_dashboard',
      'can_view_tickets_page',
      'can_view_tickets',
      'can_comment_tickets',
      'can_view_kb_page',
      'can_view_kb',
    ]),
  },
  {
    slug: 'pbx',
    name: 'PBX',
    description: 'Full PBX module — all screens and management actions.',
    sort_order: 30,
    permissions: expandPermissionKeys(['can_access_pbx']),
  },
  {
    slug: 'full_portal',
    name: 'Full Portal',
    description: 'CRM, support, and PBX with export and ticket delete.',
    sort_order: 40,
    permissions: expandPermissionKeys([
      'can_access_crm',
      'can_access_support',
      'can_access_pbx',
      'can_export_data',
      'can_delete_tickets',
    ]),
  },
];

const SLUG_TO_ID = {};

/** Map retired role slugs to their replacement. */
const RETIRED_ROLE_SLUGS = {
  crm_user: 'crm',
  support_agent: 'support',
  support_limited: 'support_viewer',
  pbx_operator: 'pbx',
  pbx_viewer: 'pbx',
  crm_support: 'full_portal',
};

export function getSeededRoleId(slug) {
  return SLUG_TO_ID[slug] || null;
}

async function retireObsoleteSystemRoles(activeSlugs) {
  const rows = await query('SELECT id, slug FROM roles WHERE is_system = 1');
  for (const row of rows) {
    if (activeSlugs.has(row.slug)) continue;

    const replacementSlug = RETIRED_ROLE_SLUGS[row.slug];
    const replacementId = replacementSlug ? SLUG_TO_ID[replacementSlug] : null;

    if (replacementId) {
      await execute('UPDATE user_permissions SET role_id = ? WHERE role_id = ?', [
        replacementId,
        row.id,
      ]);
    }

    await execute('DELETE FROM role_permissions WHERE role_id = ?', [row.id]);
    await execute('DELETE FROM roles WHERE id = ?', [row.id]);
    console.log(
      `[db] Retired portal role: ${row.slug}${replacementSlug ? ` → ${replacementSlug}` : ''}`
    );
  }
}

export async function seedPortalRoles() {
  for (const def of SEEDED_ROLES) {
    let row = await queryOne('SELECT id FROM roles WHERE slug = ?', [def.slug]);
    const id = row?.id || uuidv4();

    if (!row) {
      await execute(
        `INSERT INTO roles (id, slug, name, description, is_system, sort_order)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [id, def.slug, def.name, def.description, def.sort_order]
      );
    } else {
      await execute(
        `UPDATE roles SET name = ?, description = ?, sort_order = ?, is_system = 1 WHERE id = ?`,
        [def.name, def.description, def.sort_order, id]
      );
    }

    SLUG_TO_ID[def.slug] = id;

    await execute('DELETE FROM role_permissions WHERE role_id = ?', [id]);
    for (const key of def.permissions) {
      await execute(`INSERT INTO role_permissions (role_id, permission_key) VALUES (?, ?)`, [
        id,
        key,
      ]);
    }
  }

  await retireObsoleteSystemRoles(new Set(SEEDED_ROLES.map((r) => r.slug)));

  return SLUG_TO_ID;
}
