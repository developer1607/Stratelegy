import { listUsers, getUserById } from './users.js';
import { clampLimit } from '../utils/sql.js';
import * as ticketStore from './ticketStore.js';
import * as saasStore from './saasStore.js';
import { onTicketCreated } from './tickets.js';

const USER_ENTITY = 'User';
const TICKET_ENTITIES = new Set(['Ticket', 'TicketComment']);

export async function listEntities(entityName, sort, limit) {
  if (TICKET_ENTITIES.has(entityName)) {
    if (entityName === 'Ticket') return ticketStore.listTickets(sort, limit);
    return ticketStore.filterComments({}, sort);
  }

  if (entityName === USER_ENTITY) {
    let items = await listUsers();
    const { field, desc } = parseSort(sort);
    items.sort((a, b) => {
      const cmp = compareValues(a[field], b[field]);
      return desc ? -cmp : cmp;
    });
    if (limit) items = items.slice(0, Number(limit));
    return items;
  }

  return saasStore.listEntities(entityName, sort, limit);
}

export async function listEntitiesPage(entityName, sort, limit, offset) {
  if (TICKET_ENTITIES.has(entityName) || entityName === USER_ENTITY) {
    const all = await listEntities(entityName, sort);
    const lim = clampLimit(limit ?? 25);
    const off = Math.max(0, parseInt(offset, 10) || 0);
    return {
      items: all.slice(off, off + lim),
      total: all.length,
      limit: lim,
      offset: off,
    };
  }
  return saasStore.listEntitiesPage(entityName, sort, limit, offset);
}

export async function getEntity(entityName, id) {
  if (entityName === 'Ticket') return ticketStore.getTicket(id);
  if (entityName === 'TicketComment') return ticketStore.getComment(id);
  if (entityName === USER_ENTITY) {
    return getUserById(id);
  }
  return saasStore.getEntity(entityName, id);
}

export async function filterEntities(entityName, filterQuery, sort) {
  if (entityName === 'Ticket') return ticketStore.filterTickets(filterQuery, sort);
  if (entityName === 'TicketComment') return ticketStore.filterComments(filterQuery, sort);
  if (entityName === USER_ENTITY) {
    let items = await listUsers();
    items = items.filter((r) => matchesFilter(r, filterQuery));
    if (sort) {
      const { field, desc } = parseSort(sort);
      items.sort((a, b) => {
        const cmp = compareValues(a[field], b[field]);
        return desc ? -cmp : cmp;
      });
    }
    return items;
  }
  return saasStore.filterEntities(entityName, filterQuery, sort);
}

export async function createEntity(entityName, data, { skipHooks = false, actorEmail } = {}) {
  if (entityName === 'Ticket') {
    const created = await ticketStore.createTicket(data);
    if (!skipHooks) await onTicketCreated(created, { actorEmail });
    return getEntity('Ticket', created.id);
  }
  if (entityName === 'TicketComment') {
    return ticketStore.createComment(data, { actorEmail });
  }
  if (entityName === USER_ENTITY) {
    const err = new Error('Use user management API to create users');
    err.status = 400;
    throw err;
  }
  return saasStore.createEntity(entityName, data);
}

export async function updateEntity(entityName, id, data, { actorEmail } = {}) {
  if (entityName === 'Ticket') return ticketStore.updateTicket(id, data, { actorEmail });
  if (entityName === 'TicketComment') return ticketStore.updateComment(id, data);
  if (entityName === USER_ENTITY) {
    const err = new Error('Use user management API to update users');
    err.status = 400;
    throw err;
  }
  return saasStore.updateEntity(entityName, id, data);
}

export async function deleteEntity(entityName, id) {
  if (entityName === 'Ticket') return ticketStore.deleteTicket(id);
  if (entityName === 'TicketComment') return ticketStore.deleteComment(id);
  if (entityName === USER_ENTITY) {
    const err = new Error('Use user management API to delete users');
    err.status = 400;
    throw err;
  }
  return saasStore.deleteEntity(entityName, id);
}

export async function bulkCreateEntities(entityName, items) {
  const results = [];
  for (const item of items) {
    results.push(await createEntity(entityName, item, { skipHooks: true }));
  }
  return results;
}

function parseSort(sort) {
  if (!sort) return { field: 'created_date', desc: true };
  const desc = sort.startsWith('-');
  const field = desc ? sort.slice(1) : sort;
  return { field, desc };
}

function compareValues(a, b) {
  if (a == null && b == null) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function matchesFilter(record, filterQuery) {
  for (const [key, value] of Object.entries(filterQuery)) {
    if (value && typeof value === 'object' && Array.isArray(value.$in)) {
      if (!value.$in.includes(record[key])) return false;
      continue;
    }
    if (record[key] !== value) return false;
  }
  return true;
}
