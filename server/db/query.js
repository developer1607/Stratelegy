import mysql from 'mysql2/promise';
import { config } from '../config.js';

let pool;

export function getPool() {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function query(sql, params = []) {
  const [rows] = await getPool().execute(sql, params);
  return rows;
}

export async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql, params = []) {
  const [result] = await getPool().execute(sql, params);
  return result;
}

export async function createPoolConnection() {
  const { host, port, user, password, database } = config.mysql;

  const bootstrap = await mysql.createConnection({ host, port, user, password });
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await bootstrap.end();

  pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    dateStrings: false,
  });
}
