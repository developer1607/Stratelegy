import fs from 'fs';
import { config } from '../config.js';
import { createPoolConnection } from './query.js';
import { initSchema } from './schema/index.js';
import { syncSchema } from './schemaSync.js';
import { runMigrations } from './migrations/index.js';
import { runSeeds } from './seed/index.js';

/**
 * Database bootstrap (runs on every server start):
 *  1. schema/     — CREATE TABLE IF NOT EXISTS (platform, CRM entities, roles)
 *  2. schemaSync  — ADD COLUMN for registry/permission drift on existing DBs
 *  3. seed/       — config rows, portal roles, admin, optional demo users
 *  4. migrations/ — one-time legacy upgrades (entity_records, permission flags, cleanup)
 */
export async function initDatabase() {
  fs.mkdirSync(config.uploadsDir, { recursive: true });
  await createPoolConnection();
  await initSchema();
  await syncSchema();
  await runSeeds();
  await runMigrations();
  console.log(
    `[db] MySQL ready: ${config.mysql.user}@${config.mysql.host}:${config.mysql.port}/${config.mysql.database}`
  );
}
