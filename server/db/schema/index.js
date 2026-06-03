import { execute } from '../query.js';
import { createPlatformTables } from './platform.js';
import { createRoleTables } from './roles.js';
import { createEntityTables } from '../entitySchema.js';

/** Create all tables on first run (IF NOT EXISTS). Column drift handled by schemaSync. */
export async function initSchema() {
  await createPlatformTables(execute);
  await createEntityTables(execute);
  await createRoleTables(execute);
}
