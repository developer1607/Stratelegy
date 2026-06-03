import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/query.js';
import { toIsoDate } from '../db/helpers.js';
import { clampLimit } from '../utils/sql.js';

function rowToNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    link_path: row.link_path,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    read_at: row.read_at ? toIsoDate(row.read_at) : null,
    created_date: toIsoDate(row.created_date),
  };
}

export async function createNotification({
  userId,
  type,
  title,
  body = '',
  linkPath = null,
  entityType = null,
  entityId = null,
}) {
  if (!userId || !type || !title) return null;

  const id = uuidv4();
  await execute(
    `INSERT INTO user_notifications (
      id, user_id, type, title, body, link_path, entity_type, entity_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, userId, type, title, body, linkPath, entityType, entityId]
  );

  return getNotificationForUser(id, userId);
}

export async function getNotificationForUser(id, userId) {
  const row = await queryOne(
    'SELECT * FROM user_notifications WHERE id = ? AND user_id = ?',
    [id, userId]
  );
  if (!row) {
    const err = new Error('Notification not found');
    err.status = 404;
    throw err;
  }
  return rowToNotification(row);
}

export async function listNotifications(userId, { unreadOnly = false, limit = 30, offset = 0 } = {}) {
  const safeLimit = clampLimit(limit, { default: 30, max: 100 });
  const safeOffset = Math.max(0, Number(offset) || 0);

  let sql = 'SELECT * FROM user_notifications WHERE user_id = ?';
  const params = [userId];

  if (unreadOnly) {
    sql += ' AND read_at IS NULL';
  }

  sql += ` ORDER BY created_date DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  const rows = await query(sql, params);
  const unreadCount = await getUnreadCount(userId);

  return {
    notifications: rows.map(rowToNotification),
    unread_count: unreadCount,
  };
}

export async function getUnreadCount(userId) {
  const row = await queryOne(
    `SELECT COUNT(*) AS count FROM user_notifications
     WHERE user_id = ? AND read_at IS NULL`,
    [userId]
  );
  return Number(row?.count || 0);
}

export async function setNotificationRead(id, userId, read = true) {
  await getNotificationForUser(id, userId);
  if (read) {
    await execute(
      'UPDATE user_notifications SET read_at = NOW() WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  } else {
    await execute(
      'UPDATE user_notifications SET read_at = NULL WHERE id = ? AND user_id = ?',
      [id, userId]
    );
  }
  return getNotificationForUser(id, userId);
}

export async function markAllNotificationsRead(userId) {
  const result = await execute(
    `UPDATE user_notifications SET read_at = NOW()
     WHERE user_id = ? AND read_at IS NULL`,
    [userId]
  );
  return { updated: result.affectedRows ?? 0, unread_count: 0 };
}

export async function deleteNotification(id, userId) {
  await getNotificationForUser(id, userId);
  await execute('DELETE FROM user_notifications WHERE id = ? AND user_id = ?', [id, userId]);
  return { success: true };
}

export async function deleteAllReadNotifications(userId) {
  const result = await execute(
    'DELETE FROM user_notifications WHERE user_id = ? AND read_at IS NOT NULL',
    [userId]
  );
  return { deleted: result.affectedRows ?? 0 };
}
