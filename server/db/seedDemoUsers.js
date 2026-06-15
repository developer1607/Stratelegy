import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { queryOne, execute } from './query.js';
import { getSeededRoleId } from './seedRoles.js';
import { assignPortalRole } from '../services/permissions.js';
import { updateUserSupportRouting } from '../services/users.js';
import { assertPasswordValid } from '../utils/passwordValidation.js';

/** One account per module role — dev/staging only. Admin is seeded separately. */
const DEMO_USERS = [
  { email: 'crmuser@test.com', fullName: 'CRM Demo', roleSlug: 'crm' },
  {
    email: 'supportuser@test.com',
    fullName: 'Support Demo',
    roleSlug: 'support',
    departments: 'support,billing',
  },
  { email: 'pbxuser@test.com', fullName: 'PBX Demo', roleSlug: 'pbx' },
];

/** Optional demo accounts for local role testing — never runs in production. */
export async function seedDemoUsers() {
  if (!config.seedDemoUsers) return;

  assertPasswordValid(config.demoUserPassword);

  let created = 0;
  let synced = 0;
  for (const demo of DEMO_USERS) {
    const email = demo.email.toLowerCase();
    const roleId = getSeededRoleId(demo.roleSlug);
    if (!roleId) {
      console.warn(`[db] Demo role not seeded yet: ${demo.roleSlug}`);
      continue;
    }

    const existing = await queryOne('SELECT id, full_name FROM users WHERE email = ?', [email]);
    if (existing) {
      await assignPortalRole({
        userId: existing.id,
        userEmail: email,
        userName: existing.full_name || demo.fullName,
        roleId,
      });

      if (demo.departments || demo.categories) {
        await updateUserSupportRouting(existing.id, {
          departments: demo.departments,
          categories: demo.categories,
        });
      }

      synced++;
      continue;
    }

    const id = uuidv4();
    const hash = bcrypt.hashSync(config.demoUserPassword, 10);
    await execute(
      `INSERT INTO users (id, email, password_hash, full_name, role, departments, categories)
       VALUES (?, ?, ?, ?, 'user', ?, ?)`,
      [id, email, hash, demo.fullName, demo.departments || null, demo.categories || null]
    );

    await assignPortalRole({
      userId: id,
      userEmail: email,
      userName: demo.fullName,
      roleId,
    });

    if (demo.departments || demo.categories) {
      await updateUserSupportRouting(id, {
        departments: demo.departments,
        categories: demo.categories,
      });
    }

    created++;
  }

  if (created > 0 || synced > 0) {
    console.log(
      `[db] Demo portal users — created ${created}, role-synced ${synced} (password from DEMO_USER_PASSWORD)`
    );
  }
}
