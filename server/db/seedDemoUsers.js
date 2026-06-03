import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';
import { queryOne, execute } from './query.js';
import { getSeededRoleId } from './seedRoles.js';
import { assignPortalRole } from '../services/permissions.js';
import { updateUserSupportRouting } from '../services/users.js';
import { assertPasswordValid } from '../utils/passwordValidation.js';

/** One account per seeded portal role — dev/staging only. */
const DEMO_USERS = [
  { email: 'crmuser@test.com', fullName: 'CRM Demo', roleSlug: 'crm' },
  {
    email: 'supportuser@test.com',
    fullName: 'Support Demo',
    roleSlug: 'support',
    departments: 'support,billing',
  },
  {
    email: 'supportviewer@test.com',
    fullName: 'Support Viewer Demo',
    roleSlug: 'support_viewer',
    departments: 'support',
  },
  { email: 'pbxuser@test.com', fullName: 'PBX Demo', roleSlug: 'pbx' },
  {
    email: 'fullportal@test.com',
    fullName: 'Full Portal Demo',
    roleSlug: 'full_portal',
    departments: 'support,sales,billing,number_porting_team',
  },
];

/** Optional demo accounts for local role testing — never runs in production. */
export async function seedDemoUsers() {
  if (!config.seedDemoUsers) return;

  assertPasswordValid(config.demoUserPassword);

  let created = 0;
  for (const demo of DEMO_USERS) {
    const email = demo.email.toLowerCase();
    const existing = await queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) continue;

    const roleId = getSeededRoleId(demo.roleSlug);
    if (!roleId) {
      console.warn(`[db] Demo role not seeded yet: ${demo.roleSlug}`);
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

  if (created > 0) {
    console.log(`[db] Seeded ${created} demo portal user(s) — password from DEMO_USER_PASSWORD`);
  }
}
