import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, execute } from '../db/query.js';
import { toIsoDate } from '../db/helpers.js';
import {
  getEntityDef,
  apiToDbField,
  dbToApiField,
  isExternalStore,
} from '../db/entityDefinitions.js';
import { notifyEntityChange } from './entityEvents.js';
import { clampLimit } from '../utils/sql.js';

function assertSaasEntity(entityName) {
  if (isExternalStore(entityName)) {
    const err = new Error(`${entityName} is managed by an external store`);
    err.status = 400;
    throw err;
  }
}

function getWritableColumns(entityName) {
  const def = getEntityDef(entityName);
  return Object.entries(def.columns)
    .filter(([col, spec]) => spec.writable && col !== 'id')
    .map(([col]) => col);
}

function getSortableColumns(entityName) {
  const def = getEntityDef(entityName);
  const cols = Object.keys(def.columns).filter((c) => c !== 'id');
  if (def.configEntity && !cols.includes('sort_order')) {
    cols.push('sort_order');
  }
  return cols;
}

function resolveSortField(entityName, sortField) {
  if (!sortField) return 'created_date';
  const dbField = apiToDbField(entityName, sortField);
  const allowed = getSortableColumns(entityName);
  if (allowed.includes(dbField)) return dbField;
  return 'created_date';
}

function parseSort(entityName, sort) {
  if (!sort) return { field: 'created_date', desc: true };
  const desc = sort.startsWith('-');
  const rawField = desc ? sort.slice(1) : sort;
  return { field: resolveSortField(entityName, rawField), desc };
}

function coerceValue(spec, value) {
  if (value === undefined) return undefined;
  if (value === null || value === '') {
    return spec.optional !== false ? null : undefined;
  }

  switch (spec.type) {
    case 'int': {
      const n = parseInt(value, 10);
      return Number.isNaN(n) ? null : n;
    }
    case 'decimal': {
      const n = parseFloat(value);
      return Number.isNaN(n) ? null : n;
    }
    case 'bool':
      return value === true || value === 1 || value === '1' || value === 'true' ? 1 : 0;
    case 'string':
    case 'text':
      return String(value);
    default:
      return value;
  }
}

function rowToEntity(entityName, row) {
  if (!row) return null;
  const def = getEntityDef(entityName);
  const result = { id: row.id };

  for (const [col, spec] of Object.entries(def.columns)) {
    if (col === 'id') continue;
    const apiField = dbToApiField(entityName, col);
    let value = row[col];

    if (spec.type === 'bool') {
      value = Boolean(value);
    } else if (spec.type === 'datetime') {
      value = toIsoDate(value);
    } else if (spec.type === 'decimal' && value != null) {
      value = Number(value);
    } else if (spec.type === 'int' && value != null) {
      value = Number(value);
    }

    result[apiField] = value;
  }

  return result;
}

function normalizeInput(entityName, data) {
  const def = getEntityDef(entityName);
  const normalized = {};

  for (const [key, value] of Object.entries(data)) {
    if (key === 'id' || key === 'created_date' || key === 'updated_date') continue;
    const dbField = apiToDbField(entityName, key);
    const spec = def.columns[dbField];
    if (!spec) continue;
    normalized[dbField] = coerceValue(spec, value);
  }

  return normalized;
}

function validateRequired(entityName, data) {
  const def = getEntityDef(entityName);
  const missing = [];

  for (const [col, spec] of Object.entries(def.columns)) {
    if (!spec.required || col === 'id') continue;
    const val = data[col];
    if (val === undefined || val === null || val === '') {
      missing.push(dbToApiField(entityName, col));
    }
  }

  if (missing.length > 0) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

function pickWritable(entityName, data, { forCreate = false } = {}) {
  const def = getEntityDef(entityName);
  const writable = getWritableColumns(entityName);
  const picked = {};

  for (const col of writable) {
    if (data[col] === undefined) {
      if (forCreate && def.columns[col]?.default !== undefined) {
        picked[col] = coerceValue(def.columns[col], def.columns[col].default);
      }
      continue;
    }
    picked[col] = data[col];
  }

  return picked;
}

function buildFilterClause(entityName, filterQuery) {
  const def = getEntityDef(entityName);
  const conditions = ['1=1'];
  const params = [];

  for (const [key, value] of Object.entries(filterQuery)) {
    if (value === undefined || value === null) continue;

    const dbField = apiToDbField(entityName, key);
    if (!def.columns[dbField] && dbField !== key) continue;
    if (!def.columns[dbField]) continue;

    if (value && typeof value === 'object' && Array.isArray(value.$in)) {
      if (value.$in.length === 0) {
        conditions.push('0=1');
        continue;
      }
      const placeholders = value.$in.map(() => '?').join(', ');
      conditions.push(`\`${dbField}\` IN (${placeholders})`);
      params.push(...value.$in);
      continue;
    }

    conditions.push(`\`${dbField}\` = ?`);
    params.push(coerceValue(def.columns[dbField], value));
  }

  return { where: conditions.join(' AND '), params };
}

export async function listEntities(entityName, sort, limit) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const { field, desc } = parseSort(entityName, sort);
  const dir = desc ? 'DESC' : 'ASC';
  const limitClause = limit != null && limit !== '' ? `LIMIT ${clampLimit(limit)}` : '';

  const rows = await query(
    `SELECT * FROM \`${def.table}\` ORDER BY \`${field}\` ${dir} ${limitClause}`
      .replace(/\s+/g, ' ')
      .trim()
  );
  return rows.map((row) => rowToEntity(entityName, row));
}

export async function getEntity(entityName, id) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const row = await queryOne(`SELECT * FROM \`${def.table}\` WHERE id = ?`, [id]);
  if (!row) {
    const err = new Error(`${entityName} not found`);
    err.status = 404;
    throw err;
  }
  return rowToEntity(entityName, row);
}

export async function filterEntities(entityName, filterQuery = {}, sort) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const { where, params } = buildFilterClause(entityName, filterQuery);
  const { field, desc } = parseSort(entityName, sort);
  const dir = desc ? 'DESC' : 'ASC';

  const rows = await query(
    `SELECT * FROM \`${def.table}\` WHERE ${where} ORDER BY \`${field}\` ${dir}`,
    params
  );
  return rows.map((row) => rowToEntity(entityName, row));
}

export async function createEntity(entityName, data) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const id = data.id || uuidv4();
  const normalized = normalizeInput(entityName, data);
  validateRequired(entityName, normalized);
  const values = pickWritable(entityName, normalized, { forCreate: true });

  const cols = ['id', ...Object.keys(values)];
  const placeholders = cols.map(() => '?').join(', ');
  const sqlValues = [id, ...Object.values(values)];

  await execute(
    `INSERT INTO \`${def.table}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`,
    sqlValues
  );

  const record = await getEntity(entityName, id);
  notifyEntityChange(entityName, record);
  return record;
}

export async function updateEntity(entityName, id, data) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const oldRecord = await getEntity(entityName, id);

  const normalized = normalizeInput(entityName, data);
  const values = pickWritable(entityName, normalized);
  const keys = Object.keys(values);
  if (keys.length === 0) return oldRecord;

  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  await execute(`UPDATE \`${def.table}\` SET ${setClause}, updated_date = NOW() WHERE id = ?`, [
    ...Object.values(values),
    id,
  ]);

  const record = await getEntity(entityName, id);
  notifyEntityChange(entityName, record, oldRecord);
  return record;
}

export async function deleteEntity(entityName, id) {
  assertSaasEntity(entityName);
  const def = getEntityDef(entityName);
  const oldRecord = await getEntity(entityName, id);
  await execute(`DELETE FROM \`${def.table}\` WHERE id = ?`, [id]);
  notifyEntityChange(entityName, null, oldRecord);
  return { success: true };
}

export async function bulkCreateEntities(entityName, items) {
  const results = [];
  for (const item of items) {
    results.push(await createEntity(entityName, item));
  }
  return results;
}
