import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/query.js';
import { toIsoDate } from '../db/helpers.js';
import { config } from '../config.js';
import { updateUserPermissions, applyPortalRoleOnUserCreate } from './permissions.js';
import { getSeededRoleId } from '../db/seedRoles.js';
import { sendPortalInviteEmail, sendPortalWelcomeEmail } from './email/notifications.js';
import { assertPasswordValid } from '../utils/passwordValidation.js';

export function rowToUser(row) {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    avatar_url: row.avatar_url,
    is_active: Boolean(row.is_active),
    departments: row.departments || '',
    categories: row.categories || '',
    created_date: toIsoDate(row.created_date),
    updated_date: toIsoDate(row.updated_date),
  };
}

export async function getUserById(id) {
  const row = await queryOne('SELECT * FROM users WHERE id = ?', [id]);
  return row ? rowToUser(row) : null;
}

export async function getUserByEmail(email) {
  const row = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  return row ? rowToUser(row) : null;
}

export async function listUsers() {
  const rows = await query('SELECT * FROM users ORDER BY created_date DESC');
  return rows.map(rowToUser);
}

export async function authenticateUser(email, password) {
  const row = await queryOne('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
  if (!row || !row.is_active) return null;
  const match = await bcrypt.compare(password, row.password_hash);
  if (!match) return null;
  return rowToUser(row);
}

export async function updateUser(id, data) {
  const existing = await queryOne('SELECT * FROM users WHERE id = ?', [id]);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const updates = [];
  const values = [];

  const fullName = data.full_name ?? data.display_name;
  const avatarUrl = data.avatar_url ?? data.profile_picture;

  if (fullName !== undefined) {
    updates.push('full_name = ?');
    values.push(String(fullName).trim());
  }
  if (avatarUrl !== undefined) {
    updates.push('avatar_url = ?');
    values.push(avatarUrl);
  }

  if (updates.length === 0) return rowToUser(existing);

  values.push(id);
  await execute(
    `UPDATE users SET ${updates.join(', ')}, updated_date = NOW() WHERE id = ?`,
    values
  );
  return getUserById(id);
}

/** Ticket routing preferences for support-capable portal users. */
export async function updateUserSupportRouting(userId, { departments, categories }) {
  const existing = await queryOne('SELECT id FROM users WHERE id = ?', [userId]);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const updates = [];
  const values = [];

  if (departments !== undefined) {
    updates.push('departments = ?');
    values.push(departments ? String(departments).trim() : null);
  }
  if (categories !== undefined) {
    updates.push('categories = ?');
    values.push(categories ? String(categories).trim() : null);
  }

  if (updates.length === 0) return getUserById(userId);

  values.push(userId);
  await execute(
    `UPDATE users SET ${updates.join(', ')}, updated_date = NOW() WHERE id = ?`,
    values
  );
  return getUserById(userId);
}

/** Change password for the logged-in user (requires current password). */
export async function changeUserPassword(userId, { currentPassword, newPassword }) {
  if (!currentPassword) {
    const err = new Error('Current password is required');
    err.status = 400;
    throw err;
  }
  assertPasswordValid(newPassword);

  const row = await queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
  if (!row) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  if (!bcrypt.compareSync(currentPassword, row.password_hash)) {
    const err = new Error('Current password is incorrect');
    err.status = 400;
    throw err;
  }
  if (bcrypt.compareSync(newPassword, row.password_hash)) {
    const err = new Error('New password must be different from your current password');
    err.status = 400;
    throw err;
  }

  await execute('UPDATE users SET password_hash = ?, updated_date = NOW() WHERE id = ?', [
    bcrypt.hashSync(newPassword, 10),
    userId,
  ]);
  return getUserById(userId);
}

/** Admin: set a new password for another user (no current password). */
export async function setUserPasswordAdmin(userId, newPassword) {
  assertPasswordValid(newPassword);
  const existing = await queryOne('SELECT id FROM users WHERE id = ?', [userId]);
  if (!existing) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }
  await execute('UPDATE users SET password_hash = ?, updated_date = NOW() WHERE id = ?', [
    bcrypt.hashSync(newPassword, 10),
    userId,
  ]);
  return getUserById(userId);
}

export async function createUser({
  email,
  password,
  fullName,
  role = 'user',
  grantCrmAccess = false,
  permissions,
  portalRoleId,
  createdByUserId,
}) {
  const normalized = email?.trim()?.toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    const err = new Error('A valid email address is required');
    err.status = 400;
    throw err;
  }
  assertPasswordValid(password);
  const validRole = role === 'admin' ? 'admin' : 'user';

  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [normalized]);
  if (existing) {
    const err = new Error('A user with this email already exists');
    err.status = 409;
    throw err;
  }

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  await execute(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [id, normalized, hash, fullName?.trim() || normalized, validRole]
  );

  const user = await getUserById(id);

  if (validRole !== 'admin') {
    if (portalRoleId) {
      await applyPortalRoleOnUserCreate({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        portalRoleId,
      });
    } else if (permissions) {
      await updateUserPermissions({
        userId: user.id,
        userEmail: user.email,
        userName: user.full_name,
        updates: permissions,
      });
    } else if (grantCrmAccess) {
      const crmRoleId = getSeededRoleId('crm');
      if (crmRoleId) {
        await applyPortalRoleOnUserCreate({
          userId: user.id,
          userEmail: user.email,
          userName: user.full_name,
          portalRoleId: crmRoleId,
        });
      }
    }
  }

  try {
    const creator = createdByUserId ? await getUserById(createdByUserId) : null;
    await sendPortalWelcomeEmail({
      email: user.email,
      fullName: user.full_name,
      createdByName: creator?.full_name || creator?.email,
    });
  } catch (e) {
    console.error('[users] welcome email failed:', e.message);
  }

  return user;
}

export async function inviteUser(email, role, invitedBy, portalRoleId = null) {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    const err = new Error('A valid email address is required');
    err.status = 400;
    throw err;
  }

  const validRole = role === 'admin' ? 'admin' : 'user';
  const existing = await queryOne('SELECT id FROM users WHERE email = ?', [normalized]);
  if (existing) {
    const err = new Error('User already exists');
    err.status = 409;
    throw err;
  }

  const token = uuidv4();
  const id = uuidv4();
  await execute(
    `INSERT INTO invites (id, email, role, portal_role_id, token, invited_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, normalized, validRole, portalRoleId || null, token, invitedBy]
  );

  const inviteUrl = `${config.appBaseUrl}/login?invite_token=${token}&email=${encodeURIComponent(normalized)}`;
  const inviter = invitedBy ? await getUserById(invitedBy) : null;

  let emailResult = { sent: false, skipped: true };
  try {
    emailResult = await sendPortalInviteEmail({
      email: normalized,
      inviteUrl,
      invitedByName: inviter?.full_name || inviter?.email,
      role: validRole,
    });
  } catch (e) {
    console.error('[users] invite email failed:', e.message);
  }

  return {
    email: normalized,
    role: validRole,
    invite_url: inviteUrl,
    email_sent: emailResult.sent,
  };
}

export async function registerFromInvite({ token, email, password, fullName }) {
  const invite = await queryOne(
    'SELECT * FROM invites WHERE token = ? AND email = ? AND accepted_at IS NULL',
    [token, email.toLowerCase()]
  );
  if (!invite) {
    const err = new Error('Invalid or expired invite');
    err.status = 400;
    throw err;
  }

  assertPasswordValid(password);

  const id = uuidv4();
  const hash = bcrypt.hashSync(password, 10);
  await execute(
    `INSERT INTO users (id, email, password_hash, full_name, role)
     VALUES (?, ?, ?, ?, ?)`,
    [id, email.toLowerCase(), hash, fullName || email, invite.role]
  );

  await execute('UPDATE invites SET accepted_at = NOW() WHERE id = ?', [invite.id]);

  if (invite.role !== 'admin' && invite.portal_role_id) {
    await applyPortalRoleOnUserCreate({
      userId: id,
      userEmail: email.toLowerCase(),
      userName: fullName || email,
      portalRoleId: invite.portal_role_id,
    });
  }

  return getUserById(id);
}

/** Admin: permanently delete a portal user and related permission records. */
export async function deleteUser(userId, { deletedByUserId } = {}) {
  const user = await getUserById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  if (deletedByUserId && userId === deletedByUserId) {
    const err = new Error('You cannot delete your own account');
    err.status = 400;
    throw err;
  }

  if (user.role === 'admin') {
    const row = await queryOne(
      "SELECT COUNT(*) AS c FROM users WHERE role = 'admin' AND is_active = 1"
    );
    if (Number(row?.c) <= 1) {
      const err = new Error('Cannot delete the last administrator');
      err.status = 400;
      throw err;
    }
  }

  await execute('DELETE FROM user_permissions WHERE user_id = ?', [userId]);
  await execute('DELETE FROM user_notifications WHERE user_id = ?', [userId]);
  await execute('DELETE FROM invites WHERE email = ?', [user.email.toLowerCase()]);
  await execute('DELETE FROM users WHERE id = ?', [userId]);

  return { id: userId, email: user.email };
}
