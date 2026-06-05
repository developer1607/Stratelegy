import { query, execute } from "../query.js";
import { dropTableIfExists, tableExists } from "../schemaHelpers.js";
import { SAAS_ENTITY_NAMES } from "../entityDefinitions.js";

const LEGACY_ENTITY_RECORD_NAMES = [
  ...SAAS_ENTITY_NAMES,
  "Ticket",
  "TicketComment",
];

/** Copy agent routing onto portal users, then remove the obsolete agents table. */
async function migrateAgentRoutingToUsers() {
  if (!(await tableExists("agents"))) return;

  const agents = await query(
    'SELECT email, departments, categories FROM agents WHERE email IS NOT NULL AND email != ""',
  );

  for (const agent of agents) {
    const users = await query(
      "SELECT id, departments, categories FROM users WHERE LOWER(email) = LOWER(?)",
      [agent.email],
    );
    if (!users[0]) continue;

    const departments = users[0].departments || agent.departments || null;
    const categories = users[0].categories || agent.categories || null;

    if (departments || categories) {
      await execute(
        "UPDATE users SET departments = ?, categories = ? WHERE id = ?",
        [departments, categories, users[0].id],
      );
    }
  }
}

/** Remove stale JSON rows once typed tables exist; drop the legacy table when empty. */
async function purgeLegacyEntityRecords() {
  if (!(await tableExists("entity_records"))) return;

  const placeholders = LEGACY_ENTITY_RECORD_NAMES.map(() => "?").join(", ");
  const before = await query("SELECT COUNT(*) AS c FROM entity_records");
  await execute(
    `DELETE FROM entity_records WHERE entity_name IN (${placeholders})`,
    LEGACY_ENTITY_RECORD_NAMES,
  );
  const after = await query("SELECT COUNT(*) AS c FROM entity_records");
  const removed = Number(before[0]?.c ?? 0) - Number(after[0]?.c ?? 0);
  if (removed > 0) {
    console.log(`[db] Purged ${removed} legacy entity_records row(s)`);
  }
}

/** Remove legacy JSON blob store after migration; drop retired agents table. */
export async function cleanupObsoleteSchema() {
  await migrateAgentRoutingToUsers();
  await dropTableIfExists("agents");
  await purgeLegacyEntityRecords();

  if (!(await tableExists("entity_records"))) return;

  const rows = await query("SELECT COUNT(*) AS c FROM entity_records");
  if (Number(rows[0]?.c ?? 0) === 0) {
    await dropTableIfExists("entity_records");
    return;
  }

  console.warn(
    "[db] entity_records still has rows — table retained until empty",
  );
}
