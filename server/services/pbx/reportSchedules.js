import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../../db/query.js';
import { toIsoDate } from '../../db/helpers.js';

/** Known schedule types for this budget (more types deferred). */
export const REPORT_SCHEDULE_TYPES = Object.freeze([
  'offline_endpoint',
  'domain_export',
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** @type {Map<string, (schedule: object, ctx: { force?: boolean }) => Promise<{ status?: string, message?: string, skipped?: boolean }>>} */
const generators = new Map();

/** Register a report generator for a schedule type (Day 2/3 wire real senders). */
export function registerReportGenerator(type, fn) {
  if (typeof fn !== 'function') {
    throw new Error('Report generator must be a function');
  }
  generators.set(String(type), fn);
}

export function getReportGenerator(type) {
  return generators.get(String(type)) || null;
}

function parseJsonField(value, fallback) {
  if (value == null) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function normalizeTimes(times) {
  const list = Array.isArray(times) ? times : [];
  const out = [];
  for (const raw of list) {
    const text = String(raw || '').trim();
    if (!TIME_RE.test(text)) {
      const err = new Error(`Invalid schedule time "${text}" (use HH:MM 24h)`);
      err.status = 400;
      throw err;
    }
    if (!out.includes(text)) out.push(text);
  }
  if (!out.length) {
    const err = new Error('At least one schedule time (HH:MM) is required');
    err.status = 400;
    throw err;
  }
  return out;
}

function normalizeDays(days) {
  if (days == null || days === '' || (Array.isArray(days) && days.length === 0)) {
    return null;
  }
  const list = Array.isArray(days) ? days : [];
  const out = [];
  for (const raw of list) {
    const n = Number(raw);
    if (!Number.isInteger(n) || n < 0 || n > 6) {
      const err = new Error('days must be integers 0–6 (Sun–Sat)');
      err.status = 400;
      throw err;
    }
    if (!out.includes(n)) out.push(n);
  }
  return out.length ? out : null;
}

function normalizeRecipients(recipients) {
  const src = recipients && typeof recipients === 'object' ? recipients : {};
  const userIds = [
    ...new Set(
      (Array.isArray(src.user_ids) ? src.user_ids : src.userIds || [])
        .map((id) => String(id || '').trim())
        .filter(Boolean),
    ),
  ];
  const extraEmails = [];
  const rawExtras = Array.isArray(src.extra_emails)
    ? src.extra_emails
    : src.extraEmails || [];
  for (const raw of rawExtras) {
    const email = String(raw || '').trim().toLowerCase();
    if (!email) continue;
    if (!EMAIL_RE.test(email)) {
      const err = new Error(`Invalid recipient email: ${email}`);
      err.status = 400;
      throw err;
    }
    if (!extraEmails.includes(email)) extraEmails.push(email);
  }
  if (extraEmails.length > 3) {
    const err = new Error('At most 3 extra email addresses are allowed');
    err.status = 400;
    throw err;
  }
  if (!userIds.length && !extraEmails.length) {
    const err = new Error('Select at least one recipient');
    err.status = 400;
    throw err;
  }
  return { user_ids: userIds, extra_emails: extraEmails };
}

function normalizeType(type) {
  const value = String(type || '').trim();
  if (!REPORT_SCHEDULE_TYPES.includes(value)) {
    const err = new Error(
      `Unsupported schedule type "${value}". Allowed: ${REPORT_SCHEDULE_TYPES.join(', ')}`,
    );
    err.status = 400;
    throw err;
  }
  return value;
}

function normalizeDomain(domain) {
  if (domain == null || domain === '' || domain === 'all') return null;
  return String(domain).trim() || null;
}

function rowToSchedule(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    domain: row.domain || null,
    times: parseJsonField(row.times_json, []),
    days: parseJsonField(row.days_json, null),
    recipients: parseJsonField(row.recipients_json, {
      user_ids: [],
      extra_emails: [],
    }),
    options: parseJsonField(row.options_json, {}),
    enabled: Boolean(row.enabled),
    created_by: row.created_by || null,
    last_sent_at: toIsoDate(row.last_sent_at) || null,
    last_run_status: row.last_run_status || null,
    last_run_message: row.last_run_message || null,
    created_date: toIsoDate(row.created_date) || null,
    updated_date: toIsoDate(row.updated_date) || null,
  };
}

export async function listReportSchedules({ type, domain, enabled } = {}) {
  const clauses = [];
  const params = [];
  if (type) {
    clauses.push('type = ?');
    params.push(String(type));
  }
  if (domain === 'all' || domain === null) {
    // no filter
  } else if (domain === '__null__') {
    clauses.push('domain IS NULL');
  } else if (domain) {
    clauses.push('(domain = ? OR domain IS NULL)');
    params.push(String(domain));
  }
  if (enabled === true || enabled === false) {
    clauses.push('enabled = ?');
    params.push(enabled ? 1 : 0);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const rows = await query(
    `SELECT * FROM pbx_report_schedules ${where}
     ORDER BY type ASC, domain ASC, created_date DESC`,
    params,
  );
  return rows.map(rowToSchedule);
}

export async function getReportSchedule(id) {
  const row = await queryOne('SELECT * FROM pbx_report_schedules WHERE id = ?', [
    id,
  ]);
  return rowToSchedule(row);
}

export async function createReportSchedule(input, { createdBy } = {}) {
  const type = normalizeType(input?.type);
  const times = normalizeTimes(input?.times);
  const days = normalizeDays(input?.days);
  const recipients = normalizeRecipients(input?.recipients);
  const domain = normalizeDomain(input?.domain);
  if (type === 'domain_export' && !domain) {
    const err = new Error('domain is required for Domain Export schedules');
    err.status = 400;
    throw err;
  }
  const options =
    input?.options && typeof input.options === 'object' ? input.options : {};
  const enabled = input?.enabled === false ? 0 : 1;
  const id = uuidv4();

  await execute(
    `INSERT INTO pbx_report_schedules
      (id, type, domain, times_json, days_json, recipients_json, options_json,
       enabled, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      type,
      domain,
      JSON.stringify(times),
      days == null ? null : JSON.stringify(days),
      JSON.stringify(recipients),
      JSON.stringify(options),
      enabled,
      createdBy || null,
    ],
  );
  return getReportSchedule(id);
}

export async function updateReportSchedule(id, input = {}) {
  const existing = await getReportSchedule(id);
  if (!existing) {
    const err = new Error('Schedule not found');
    err.status = 404;
    throw err;
  }

  const type =
    input.type !== undefined ? normalizeType(input.type) : existing.type;
  const times =
    input.times !== undefined ? normalizeTimes(input.times) : existing.times;
  const days =
    input.days !== undefined ? normalizeDays(input.days) : existing.days;
  const recipients =
    input.recipients !== undefined
      ? normalizeRecipients(input.recipients)
      : existing.recipients;
  const domain =
    input.domain !== undefined
      ? normalizeDomain(input.domain)
      : existing.domain;
  if (type === 'domain_export' && !domain) {
    const err = new Error('domain is required for Domain Export schedules');
    err.status = 400;
    throw err;
  }
  const options =
    input.options !== undefined
      ? input.options && typeof input.options === 'object'
        ? input.options
        : {}
      : existing.options;
  const enabled =
    input.enabled !== undefined
      ? input.enabled
        ? 1
        : 0
      : existing.enabled
        ? 1
        : 0;

  await execute(
    `UPDATE pbx_report_schedules
     SET type = ?, domain = ?, times_json = ?, days_json = ?,
         recipients_json = ?, options_json = ?, enabled = ?
     WHERE id = ?`,
    [
      type,
      domain,
      JSON.stringify(times),
      days == null ? null : JSON.stringify(days),
      JSON.stringify(recipients),
      JSON.stringify(options),
      enabled,
      id,
    ],
  );
  return getReportSchedule(id);
}

export async function deleteReportSchedule(id) {
  const result = await execute(
    'DELETE FROM pbx_report_schedules WHERE id = ?',
    [id],
  );
  return { deleted: Number(result?.affectedRows || 0) > 0 };
}

/** Resolve recipient emails from portal user ids + extras. */
export async function resolveRecipientEmails(recipients) {
  const normalized = normalizeRecipients(recipients);
  const emails = new Set(normalized.extra_emails);
  if (normalized.user_ids.length) {
    const placeholders = normalized.user_ids.map(() => '?').join(',');
    const rows = await query(
      `SELECT email FROM users
       WHERE is_active = 1 AND id IN (${placeholders})`,
      normalized.user_ids,
    );
    for (const row of rows) {
      const email = String(row.email || '').trim().toLowerCase();
      if (email && EMAIL_RE.test(email)) emails.add(email);
    }
  }
  return [...emails];
}

export async function markScheduleRun(id, { status, message, sentAt } = {}) {
  await execute(
    `UPDATE pbx_report_schedules
     SET last_sent_at = ?, last_run_status = ?, last_run_message = ?
     WHERE id = ?`,
    [
      sentAt || new Date(),
      status || null,
      message ? String(message).slice(0, 2000) : null,
      id,
    ],
  );
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function localHhMm(date = new Date()) {
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function sameLocalMinute(a, b) {
  if (!a || !b) return false;
  const left = a instanceof Date ? a : new Date(a);
  const right = b instanceof Date ? b : new Date(b);
  if (Number.isNaN(left.getTime()) || Number.isNaN(right.getTime())) return false;
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate() &&
    left.getHours() === right.getHours() &&
    left.getMinutes() === right.getMinutes()
  );
}

function scheduleMatchesNow(schedule, now = new Date()) {
  if (!schedule?.enabled) return false;
  const hhmm = localHhMm(now);
  const times = Array.isArray(schedule.times) ? schedule.times : [];
  if (!times.includes(hhmm)) return false;
  const days = schedule.days;
  if (Array.isArray(days) && days.length > 0) {
    if (!days.includes(now.getDay())) return false;
  }
  if (sameLocalMinute(schedule.last_sent_at, now)) return false;
  return true;
}

/**
 * Execute one schedule via its registered generator.
 * @param {object} schedule
 * @param {{ force?: boolean }} [ctx]
 */
export async function runReportSchedule(schedule, ctx = {}) {
  const generator = getReportGenerator(schedule.type);
  if (!generator) {
    await markScheduleRun(schedule.id, {
      status: 'skipped',
      message: `No generator registered for type "${schedule.type}"`,
      sentAt: new Date(),
    });
    return {
      id: schedule.id,
      status: 'skipped',
      message: `No generator for ${schedule.type}`,
    };
  }

  try {
    const result = (await generator(schedule, ctx)) || {};
    const status =
      result.status ||
      (result.skipped ? 'skipped' : 'sent');
    const message = result.message || null;
    await markScheduleRun(schedule.id, {
      status,
      message,
      sentAt: new Date(),
    });
    return { id: schedule.id, status, message, result };
  } catch (err) {
    const message = err?.message || String(err);
    await markScheduleRun(schedule.id, {
      status: 'error',
      message,
      sentAt: new Date(),
    });
    console.error(
      `[pbx-report-schedules] run failed id=${schedule.id} type=${schedule.type}:`,
      message,
    );
    return { id: schedule.id, status: 'error', message };
  }
}

export async function runDueReportSchedules(now = new Date()) {
  const schedules = await listReportSchedules({ enabled: true });
  const due = schedules.filter((s) => scheduleMatchesNow(s, now));
  const results = [];
  for (const schedule of due) {
    results.push(await runReportSchedule(schedule, { force: false }));
  }
  return results;
}

let ticker = null;
let tickInFlight = false;

/** In-process minute ticker (single-server deploy). */
export function startReportScheduleRunner({ intervalMs = 60_000 } = {}) {
  if (ticker) return;
  const tick = async () => {
    if (tickInFlight) return;
    tickInFlight = true;
    try {
      const results = await runDueReportSchedules();
      if (results.length) {
        console.log(
          `[pbx-report-schedules] processed ${results.length} due schedule(s)`,
        );
      }
    } catch (err) {
      console.error(
        '[pbx-report-schedules] tick error:',
        err?.message || err,
      );
    } finally {
      tickInFlight = false;
    }
  };
  // Align roughly to wall-clock minutes; first tick after short delay.
  ticker = setInterval(tick, intervalMs);
  if (typeof ticker.unref === 'function') ticker.unref();
  setTimeout(tick, 5_000).unref?.();
  console.log('[pbx-report-schedules] in-process runner started');
}

export function stopReportScheduleRunner() {
  if (ticker) {
    clearInterval(ticker);
    ticker = null;
  }
}
