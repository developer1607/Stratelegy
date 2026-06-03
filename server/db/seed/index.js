import { seedDefaultConfig } from '../seed.js';
import { seedPortalRoles } from '../seedRoles.js';
import { ensureAdminUser } from './admin.js';
import { seedDemoUsers } from '../seedDemoUsers.js';

/** Reference data and optional demo accounts — safe on every server start. */
export async function runSeeds() {
  await seedDefaultConfig();
  await seedPortalRoles();
  await ensureAdminUser();
  await seedDemoUsers();
}
