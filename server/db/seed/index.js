import { seedDefaultConfig } from "../seed.js";
import { seedPortalRoles } from "../seedRoles.js";
import { ensureAdminUser } from "./admin.js";

/** Reference data and bootstrap admin — safe on every server start. */
export async function runSeeds() {
  await seedDefaultConfig();
  await seedPortalRoles();
  await ensureAdminUser();
}
