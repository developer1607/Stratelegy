import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config.js';
import { queryOne, execute } from '../query.js';
import { assertPasswordValid } from '../../utils/passwordValidation.js';

/** Seed the first admin when the users table is empty. */
export async function ensureAdminUser() {
  const row = await queryOne('SELECT COUNT(*) AS c FROM users');
  if (Number(row?.c ?? 0) > 0) return;

  const email = (process.env.ADMIN_EMAIL || 'admin@stratelegy.local').toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('[db] Skipping admin seed — set ADMIN_EMAIL and ADMIN_PASSWORD in .env');
    return;
  }

  try {
    assertPasswordValid(password);
  } catch (e) {
    console.error(`[db] ADMIN_PASSWORD invalid: ${e.message}`);
    return;
  }

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);

  await execute(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, 'admin')`,
    [id, email, hash, 'Administrator']
  );

  console.log(`[db] Seeded admin user: ${email}`);
}
