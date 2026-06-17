import { v4 as uuidv4 } from "uuid";
import { query, queryOne, execute } from "./query.js";
import {
  expandPermissionKeys,
  PBX_READ_KEYS,
} from "../constants/permissionRegistry.js";

/** All PBX screen/view permissions except Make Call (domain role is read-only). */
const PBX_DOMAIN_VIEW_KEYS = PBX_READ_KEYS.filter(
  (key) => key !== "can_view_make_call_page",
);

/** Portal roles — one per module. Admin is a separate account type (users.role = admin). */
export const SEEDED_ROLES = [
  {
    slug: "crm",
    name: "CRM",
    description:
      "Sales module. Turn on permission toggles below to add Support or PBX access, or to restrict screens.",
    sort_order: 10,
    permissions: expandPermissionKeys(["can_access_crm"]),
  },
  {
    slug: "support",
    name: "Support",
    description:
      "Support desk. Turn on permission toggles below to add CRM or PBX access, or to restrict screens.",
    sort_order: 20,
    permissions: expandPermissionKeys(["can_access_support"]),
  },
  {
    slug: "pbx",
    name: "PBX",
    description:
      "PBX module. Turn on permission toggles below to add CRM or Support access, or to restrict screens.",
    sort_order: 30,
    permissions: expandPermissionKeys(["can_access_pbx"]),
  },
  {
    slug: "pbx_domain",
    name: "PBX Domain",
    description:
      "Full PBX read access limited to admin-assigned domain(s). View-only — no routing, E911, or endpoint changes.",
    sort_order: 35,
    permissions: expandPermissionKeys([
      "can_access_pbx_domain_scoped",
      ...PBX_DOMAIN_VIEW_KEYS,
    ]),
  },
];

const SLUG_TO_ID = {};

/** Map retired role slugs to their replacement. */
const RETIRED_ROLE_SLUGS = {
  crm_user: "crm",
  support_agent: "support",
  support_limited: "support",
  support_viewer: "support",
  pbx_operator: "pbx",
  pbx_viewer: "pbx",
  pbx_limited: "pbx",
  crm_support: "crm",
  full_portal: "crm",
};

/** Retired roles with partial permissions — keep stored flags via custom toggles. */
const RETIRE_PRESERVE_CUSTOM_FLAGS = new Set([
  "support_limited",
  "support_viewer",
  "pbx_limited",
  "pbx_viewer",
  "full_portal",
  "crm_support",
]);

export function getSeededRoleId(slug) {
  return SLUG_TO_ID[slug] || null;
}

async function retireObsoleteSystemRoles(activeSlugs) {
  const rows = await query("SELECT id, slug FROM roles WHERE is_system = 1");
  for (const row of rows) {
    if (activeSlugs.has(row.slug)) continue;

    const replacementSlug = RETIRED_ROLE_SLUGS[row.slug];
    const replacementId = replacementSlug ? SLUG_TO_ID[replacementSlug] : null;

    if (replacementId) {
      if (RETIRE_PRESERVE_CUSTOM_FLAGS.has(row.slug)) {
        await execute(
          `UPDATE user_permissions SET role_id = ?, use_custom_permissions = 1 WHERE role_id = ?`,
          [replacementId, row.id],
        );
      } else {
        await execute(
          "UPDATE user_permissions SET role_id = ? WHERE role_id = ?",
          [replacementId, row.id],
        );
      }
    }

    await execute("DELETE FROM role_permissions WHERE role_id = ?", [row.id]);
    await execute("DELETE FROM roles WHERE id = ?", [row.id]);
    console.log(
      `[db] Retired portal role: ${row.slug}${replacementSlug ? ` → ${replacementSlug}` : ""}`,
    );
  }
}

export async function seedPortalRoles() {
  for (const def of SEEDED_ROLES) {
    let row = await queryOne("SELECT id FROM roles WHERE slug = ?", [def.slug]);
    const id = row?.id || uuidv4();

    if (!row) {
      await execute(
        `INSERT INTO roles (id, slug, name, description, is_system, sort_order)
         VALUES (?, ?, ?, ?, 1, ?)`,
        [id, def.slug, def.name, def.description, def.sort_order],
      );
    } else {
      await execute(
        `UPDATE roles SET name = ?, description = ?, sort_order = ?, is_system = 1 WHERE id = ?`,
        [def.name, def.description, def.sort_order, id],
      );
    }

    SLUG_TO_ID[def.slug] = id;

    await execute("DELETE FROM role_permissions WHERE role_id = ?", [id]);
    for (const key of [...new Set(def.permissions)]) {
      await execute(
        `INSERT INTO role_permissions (role_id, permission_key) VALUES (?, ?)`,
        [id, key],
      );
    }
  }

  await retireObsoleteSystemRoles(new Set(SEEDED_ROLES.map((r) => r.slug)));

  return SLUG_TO_ID;
}
