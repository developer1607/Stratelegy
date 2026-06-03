/** Ticket field schema & validation (server-side). */

import {
  TICKET_STATUS_VALUES,
  TICKET_PRIORITY_VALUES,
  TICKET_CATEGORY_VALUES,
  TICKET_DEPARTMENT_VALUES,
  TICKET_SOURCE_VALUES,
} from '../../shared/ticketConstants.js';

export {
  TICKET_STATUS_VALUES as TICKET_STATUSES,
  TICKET_PRIORITY_VALUES as TICKET_PRIORITIES,
  TICKET_CATEGORY_VALUES as TICKET_CATEGORIES,
  TICKET_DEPARTMENT_VALUES as TICKET_DEPARTMENTS,
  TICKET_SOURCE_VALUES as TICKET_SOURCES,
};

const TICKET_WRITABLE = new Set([
  'title',
  'description',
  'status',
  'priority',
  'category',
  'department',
  'source',
  'assigned_to',
  'assignee',
  'requester',
  'requester_email',
  'ticket_number',
  'created_by',
]);

const COMMENT_WRITABLE = new Set(['ticket_id', 'message', 'is_internal', 'author', 'author_email']);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(value) {
  if (value == null || value === '') return null;
  return String(value).trim().toLowerCase();
}

export function isValidEmail(value) {
  const email = normalizeEmail(value);
  return Boolean(email && EMAIL_RE.test(email));
}

export function normalizeAssignee(data) {
  const out = { ...data };
  if (out.assignee !== undefined && out.assigned_to === undefined) {
    out.assigned_to = out.assignee;
  }
  delete out.assignee;
  if (out.assigned_to === '') out.assigned_to = null;
  return out;
}

export function pickWritable(data, allowed) {
  const out = {};
  for (const [key, value] of Object.entries(data || {})) {
    if (allowed.has(key) && value !== undefined) out[key] = value;
  }
  return out;
}

export function validateTicketCreate(data) {
  const d = normalizeAssignee(pickWritable(data, TICKET_WRITABLE));
  const errors = [];

  if (!d.title || !String(d.title).trim()) errors.push('title is required');
  if (!d.category || !TICKET_CATEGORY_VALUES.includes(d.category)) errors.push('valid category is required');
  if (d.status && !TICKET_STATUS_VALUES.includes(d.status)) errors.push('invalid status');
  if (d.priority && !TICKET_PRIORITY_VALUES.includes(d.priority)) errors.push('invalid priority');
  if (d.department && !TICKET_DEPARTMENT_VALUES.includes(d.department)) errors.push('invalid department');
  if (d.source && !TICKET_SOURCE_VALUES.includes(d.source)) errors.push('invalid source');
  if (d.requester_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.requester_email)) {
    errors.push('invalid requester_email');
  }

  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    throw err;
  }

  return {
    title: String(d.title).trim(),
    description: d.description ? String(d.description).trim() : '',
    status: d.status && TICKET_STATUS_VALUES.includes(d.status) ? d.status : 'open',
    priority: d.priority && TICKET_PRIORITY_VALUES.includes(d.priority) ? d.priority : 'medium',
    category: d.category,
    department: d.department || null,
    source: d.source && TICKET_SOURCE_VALUES.includes(d.source) ? d.source : 'web',
    assigned_to: d.assigned_to || null,
    requester: d.requester ? String(d.requester).trim() : null,
    requester_email: d.requester_email ? String(d.requester_email).trim().toLowerCase() : null,
    created_by: d.created_by || null,
  };
}

export function validateTicketUpdate(data) {
  const d = normalizeAssignee(pickWritable(data, TICKET_WRITABLE));
  const errors = [];

  if (d.title !== undefined && !String(d.title).trim()) errors.push('title cannot be empty');
  if (d.category !== undefined && d.category !== '' && !TICKET_CATEGORY_VALUES.includes(d.category)) {
    errors.push('invalid category');
  }
  if (d.status !== undefined && !TICKET_STATUS_VALUES.includes(d.status)) errors.push('invalid status');
  if (d.priority !== undefined && !TICKET_PRIORITY_VALUES.includes(d.priority)) errors.push('invalid priority');
  if (
    d.department !== undefined &&
    d.department !== null &&
    d.department !== '' &&
    !TICKET_DEPARTMENT_VALUES.includes(d.department)
  ) {
    errors.push('invalid department');
  }
  if (
    d.source !== undefined &&
    d.source !== null &&
    d.source !== '' &&
    !TICKET_SOURCE_VALUES.includes(d.source)
  ) {
    errors.push('invalid source');
  }
  if (d.requester_email !== undefined && d.requester_email !== null && d.requester_email !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.requester_email)) errors.push('invalid requester_email');
  }

  if (errors.length) {
    const err = new Error(errors.join('; '));
    err.status = 400;
    throw err;
  }

  const out = {};
  if (d.title !== undefined) out.title = String(d.title).trim();
  if (d.description !== undefined) out.description = String(d.description).trim();
  if (d.status !== undefined) out.status = d.status;
  if (d.priority !== undefined) out.priority = d.priority;
  if (d.category !== undefined) out.category = d.category || null;
  if (d.department !== undefined) out.department = d.department || null;
  if (d.source !== undefined) out.source = d.source || null;
  if (d.assigned_to !== undefined) out.assigned_to = d.assigned_to;
  if (d.requester !== undefined) out.requester = d.requester ? String(d.requester).trim() : null;
  if (d.requester_email !== undefined) {
    out.requester_email = d.requester_email ? String(d.requester_email).trim().toLowerCase() : null;
  }
  if (d.ticket_number !== undefined) out.ticket_number = d.ticket_number;

  return out;
}

export function validateCommentCreate(data) {
  const d = pickWritable(data, COMMENT_WRITABLE);
  if (!d.ticket_id) {
    const err = new Error('ticket_id is required');
    err.status = 400;
    throw err;
  }
  if (!d.message || !String(d.message).trim()) {
    const err = new Error('message is required');
    err.status = 400;
    throw err;
  }
  return {
    ticket_id: d.ticket_id,
    message: String(d.message).trim(),
    is_internal: Boolean(d.is_internal),
    author: d.author ? String(d.author).trim() : null,
    author_email: d.author_email ? String(d.author_email).trim().toLowerCase() : null,
  };
}
