import { migrateEntitiesFromEntityRecords } from './entityRecords.js';
import { migrateLegacyUserPermissionFlags } from './permissionFlags.js';
import { cleanupObsoleteSchema } from './obsoleteSchema.js';

/** One-time / idempotent upgrades run on every server start. */
export async function runMigrations() {
  await migrateEntitiesFromEntityRecords();
  await migrateLegacyUserPermissionFlags();
  await cleanupObsoleteSchema();
}
