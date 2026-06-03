import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/query.js';
import { toIsoDate } from '../db/helpers.js';
import {
  validateTicketCreate,
  validateTicketUpdate,
  validateCommentCreate,
} from '../validators/ticket.js';
import { sendTicketUpdatedEmail, sendTicketCommentEmails } from './email/notifications.js';
import {
  onTicketUpdatedNotification,
  onTicketCommentNotification,
} from './notificationEvents.js';
import { clampLimit } from '../utils/sql.js';

function rowToTicket(row) {
  if (!row) return null;
  return {
    id: row.id,
    ticket_number: row.ticket_number,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    category: row.category,
    department: row.department,
    source: row.source,
    assigned_to: row.assigned_to,
    requester: row.requester,
    requester_email: row.requester_email,
    created_by: row.created_by,
    created_date: toIsoDate(row.created_date),
    updated_date: toIsoDate(row.updated_date),
  };
}

function rowToComment(row) {
  if (!row) return null;
  return {
    id: row.id,
    ticket_id: row.ticket_id,
    message: row.message,
    is_internal: Boolean(row.is_internal),
    author: row.author,
    author_email: row.author_email,
    created_date: toIsoDate(row.created_date),
    updated_date: toIsoDate(row.updated_date),
  };
}

function parseSort(sort, allowed = ['created_date', 'updated_date', 'ticket_number', 'status', 'priority']) {
  if (!sort) return { field: 'created_date', desc: true };
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  if (!allowed.includes(field)) return { field: 'created_date', desc: true };
  return { field, desc };
}

function clampOffset(offset, { default: defaultOffset = 0, max = 100_000 } = {}) {
  const n = Number(offset);
  if (!Number.isFinite(n) || n < 0) return defaultOffset;
  return Math.min(Math.floor(n), max);
}

function buildTicketFilterClause({
  search,
  status,
  priority,
  category,
  department,
  assignedTo,
  unassignedOnly,
} = {}) {
  let sql = ' FROM tickets WHERE 1=1';
  const params = [];

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    sql += ` AND (
      title LIKE ? OR description LIKE ? OR ticket_number LIKE ? OR
      requester LIKE ? OR requester_email LIKE ? OR assigned_to LIKE ?
    )`;
    params.push(term, term, term, term, term, term);
  }

  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (department) {
    sql += ' AND department = ?';
    params.push(department);
  }
  if (assignedTo) {
    sql += ' AND assigned_to = ?';
    params.push(assignedTo);
  }
  if (unassignedOnly) {
    sql += " AND (assigned_to IS NULL OR assigned_to = '')";
  }

  return { sql, params };
}

export async function listTickets(sort, limit) {
  const { field, desc } = parseSort(sort);
  const dir = desc ? 'DESC' : 'ASC';
  const limitClause = limit != null && limit !== '' ? `LIMIT ${clampLimit(limit)}` : '';
  const rows = await query(
    `SELECT * FROM tickets ORDER BY ${field} ${dir} ${limitClause}`.replace(/\s+/g, ' ').trim()
  );
  return rows.map(rowToTicket);
}

export async function getTicket(id) {
  const row = await queryOne('SELECT * FROM tickets WHERE id = ?', [id]);
  if (!row) {
    const err = new Error('Ticket not found');
    err.status = 404;
    throw err;
  }
  return rowToTicket(row);
}

export async function getTicketDetail(id) {
  const ticket = await getTicket(id);
  const comments = await listCommentsForTicket(id, 'created_date');
  return { ticket, comments };
}

export async function listTicketsFiltered(filterOptions = {}) {
  const { sql, params } = buildTicketFilterClause(filterOptions);
  const { field, desc } = parseSort(filterOptions.sort);
  const dir = desc ? 'DESC' : 'ASC';
  let limitClause = '';
  if (filterOptions.limit != null && filterOptions.limit !== '') {
    limitClause = ` LIMIT ${clampLimit(filterOptions.limit)}`;
  }

  const rows = await query(
    `SELECT *${sql} ORDER BY ${field} ${dir}${limitClause}`.replace(/\s+/g, ' ').trim(),
    params
  );
  return rows.map(rowToTicket);
}

export async function listTicketsFilteredPage(filterOptions = {}) {
  const { sql, params } = buildTicketFilterClause(filterOptions);
  const { field, desc } = parseSort(filterOptions.sort);
  const dir = desc ? 'DESC' : 'ASC';
  const limit = clampLimit(filterOptions.limit);
  const offset = clampOffset(filterOptions.offset);

  const countRow = await queryOne(`SELECT COUNT(*) AS total${sql}`, params);
  const rows = await query(
    `SELECT *${sql} ORDER BY ${field} ${dir} LIMIT ${limit} OFFSET ${offset}`.replace(/\s+/g, ' ').trim(),
    params
  );

  return {
    items: rows.map(rowToTicket),
    total: Number(countRow?.total || 0),
    limit,
    offset,
  };
}

export async function getTicketStatusCounts() {
  const rows = await query('SELECT status, COUNT(*) AS count FROM tickets GROUP BY status');
  const counts = {};
  for (const row of rows) {
    counts[row.status] = Number(row.count || 0);
  }
  return counts;
}

export async function listDistinctAssignees() {
  const rows = await query(
    `SELECT DISTINCT assigned_to AS assignee
     FROM tickets
     WHERE assigned_to IS NOT NULL AND assigned_to != ''
     ORDER BY assigned_to ASC`
  );
  return rows.map((row) => row.assignee).filter(Boolean);
}

export async function filterTickets(filterQuery = {}, sort) {
  let sql = 'SELECT * FROM tickets WHERE 1=1';
  const params = [];

  for (const [key, value] of Object.entries(filterQuery)) {
    if (value === undefined || value === null) continue;
    if (key === 'ticket_id') {
      sql += ' AND id = ?';
      params.push(value);
      continue;
    }
    const col = key === 'assignee' ? 'assigned_to' : key;
    if (['id', 'status', 'priority', 'category', 'department', 'source', 'assigned_to', 'requester_email', 'created_by'].includes(col)) {
      sql += ` AND ${col} = ?`;
      params.push(value);
    }
  }

  const { field, desc } = parseSort(sort);
  sql += ` ORDER BY ${field} ${desc ? 'DESC' : 'ASC'}`;

  const rows = await query(sql, params);
  return rows.map(rowToTicket);
}

export async function createTicket(rawData) {
  const data = validateTicketCreate(rawData);
  const id = rawData.id || uuidv4();

  await execute(
    `INSERT INTO tickets (
      id, title, description, status, priority, category, department, source,
      assigned_to, requester, requester_email, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description,
      data.status,
      data.priority,
      data.category,
      data.department,
      data.source,
      data.assigned_to,
      data.requester,
      data.requester_email,
      data.created_by,
    ]
  );

  return getTicket(id);
}

export async function updateTicket(id, rawData, { actorEmail } = {}) {
  const oldTicket = await getTicket(id);
  const updates = validateTicketUpdate(rawData);
  const keys = Object.keys(updates);
  if (keys.length === 0) return oldTicket;

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => updates[k]);

  await execute(`UPDATE tickets SET ${setClause}, updated_date = NOW() WHERE id = ?`, [...values, id]);
  const ticket = await getTicket(id);

  try {
    await sendTicketUpdatedEmail(ticket, oldTicket);
  } catch (e) {
    console.error('[tickets] update email failed:', e.message);
  }

  try {
    await onTicketUpdatedNotification(ticket, oldTicket, { actorEmail });
  } catch (e) {
    console.error('[tickets] update notification failed:', e.message);
  }

  return ticket;
}

export async function deleteTicket(id) {
  await getTicket(id);
  await execute('DELETE FROM ticket_comments WHERE ticket_id = ?', [id]);
  await execute('DELETE FROM tickets WHERE id = ?', [id]);
  return { success: true };
}

export async function listCommentsForTicket(ticketId, sort) {
  const { field, desc } = parseSort(sort || 'created_date', ['created_date', 'updated_date']);
  const rows = await query(
    `SELECT * FROM ticket_comments WHERE ticket_id = ? ORDER BY ${field} ${desc ? 'DESC' : 'ASC'}`,
    [ticketId]
  );
  return rows.map(rowToComment);
}

export async function filterComments(filterQuery = {}, sort) {
  if (filterQuery.ticket_id) {
    return listCommentsForTicket(filterQuery.ticket_id, sort);
  }
  const { field, desc } = parseSort(sort || 'created_date', ['created_date', 'updated_date']);
  const rows = await query(
    `SELECT * FROM ticket_comments ORDER BY ${field} ${desc ? 'DESC' : 'ASC'}`
  );
  let items = rows.map(rowToComment);
  for (const [key, value] of Object.entries(filterQuery)) {
    items = items.filter((r) => r[key] === value);
  }
  return items;
}

export async function createComment(rawData, { actorEmail } = {}) {
  const data = validateCommentCreate(rawData);
  await getTicket(data.ticket_id);

  const id = rawData.id || uuidv4();
  await execute(
    `INSERT INTO ticket_comments (id, ticket_id, message, is_internal, author, author_email)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.ticket_id, data.message, data.is_internal ? 1 : 0, data.author, data.author_email]
  );

  await execute('UPDATE tickets SET updated_date = NOW() WHERE id = ?', [data.ticket_id]);
  const comment = rowToComment(await queryOne('SELECT * FROM ticket_comments WHERE id = ?', [id]));
  const ticket = await getTicket(data.ticket_id);

  try {
    await sendTicketCommentEmails(ticket, comment, { actorEmail });
  } catch (e) {
    console.error('[tickets] comment email failed:', e.message);
  }

  try {
    await onTicketCommentNotification(ticket, comment, { actorEmail });
  } catch (e) {
    console.error('[tickets] comment notification failed:', e.message);
  }

  return comment;
}

export async function getComment(id) {
  const row = await queryOne('SELECT * FROM ticket_comments WHERE id = ?', [id]);
  if (!row) {
    const err = new Error('TicketComment not found');
    err.status = 404;
    throw err;
  }
  return rowToComment(row);
}

export async function updateComment(id, data) {
  await getComment(id);
  const allowed = {};
  if (data.message !== undefined) allowed.message = String(data.message).trim();
  if (data.is_internal !== undefined) allowed.is_internal = data.is_internal ? 1 : 0;
  const keys = Object.keys(allowed);
  if (keys.length === 0) return getComment(id);

  const setClause = keys.map((k) => `${k} = ?`).join(', ');
  await execute(`UPDATE ticket_comments SET ${setClause}, updated_date = NOW() WHERE id = ?`, [
    ...keys.map((k) => allowed[k]),
    id,
  ]);
  return getComment(id);
}

export async function deleteComment(id) {
  await getComment(id);
  await execute('DELETE FROM ticket_comments WHERE id = ?', [id]);
  return { success: true };
}
