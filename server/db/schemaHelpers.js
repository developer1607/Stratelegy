import { query, execute } from './query.js';

export async function tableExists(table) {
  const rows = await query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

export async function columnExists(table, column) {
  const rows = await query(
    `SELECT COUNT(*) AS c FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows[0]?.c ?? 0) > 0;
}

export async function addColumnIfMissing(table, column, columnDefinition) {
  if (await columnExists(table, column)) return false;
  await execute(`ALTER TABLE \`${table}\` ADD COLUMN ${columnDefinition}`);
  console.log(`[db] Added ${table}.${column}`);
  return true;
}

export async function dropTableIfExists(table) {
  if (!(await tableExists(table))) return false;
  await execute(`DROP TABLE \`${table}\``);
  console.log(`[db] Dropped obsolete table: ${table}`);
  return true;
}
