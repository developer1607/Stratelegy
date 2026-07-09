import { query, execute } from "../query.js";
import { addColumnIfMissing } from "../schemaHelpers.js";

const ACCOUNT_ID_COL = "`account_id` VARCHAR(36) NULL";

const TABLES = [
  { table: "contacts", nameCol: "company" },
  { table: "leads", nameCol: "company" },
  { table: "opportunities", nameCol: "account_name" },
];

/** Add account_id FK columns and backfill from legacy name-based links. */
export async function migrateAccountIdLinks() {
  for (const { table } of TABLES) {
    await addColumnIfMissing(table, "account_id", ACCOUNT_ID_COL);
    try {
      await execute(
        `CREATE INDEX \`idx_${table}_account_id\` ON \`${table}\` (\`account_id\`)`,
      );
    } catch {
      // index may already exist
    }
  }

  for (const { table, nameCol } of TABLES) {
    const result = await execute(
      `UPDATE \`${table}\` r
       INNER JOIN accounts a ON a.name = r.\`${nameCol}\`
       SET r.account_id = a.id
       WHERE r.account_id IS NULL
         AND r.\`${nameCol}\` IS NOT NULL
         AND r.\`${nameCol}\` != ''`,
    );
    if (result?.affectedRows > 0) {
      console.log(
        `[db] Backfilled account_id on ${result.affectedRows} ${table} row(s)`,
      );
    }
  }
}

/** Backfill account.owner from created_by user when owner is empty or stores a user id. */
export async function migrateAccountOwners() {
  const result = await execute(
    `UPDATE accounts a
     INNER JOIN users u ON u.id = a.created_by
     SET a.owner = COALESCE(NULLIF(TRIM(u.full_name), ''), u.email)
     WHERE a.created_by IS NOT NULL
       AND (
         a.owner IS NULL
         OR TRIM(a.owner) = ''
         OR a.owner = a.created_by
       )`,
  );
  if (result?.affectedRows > 0) {
    console.log(`[db] Backfilled owner on ${result.affectedRows} account(s)`);
  }
}
