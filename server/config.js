import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getSkySwitchScopeStatus } from './services/skyswitch/scopes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Must load before reading process.env — ESM import order is not guaranteed for dotenv/config in index.js
dotenv.config({ path: path.join(rootDir, '.env') });

const DEV_JWT_SECRET = 'stratelegy-dev-secret-change-in-production';

export const config = {
  port: Number(process.env.PORT) || 3000,
  host: process.env.HOST || '0.0.0.0',
  jwtSecret: process.env.JWT_SECRET || DEV_JWT_SECRET,
  appId: process.env.APP_ID || 'stratelegy-insight',
  uploadsDir: process.env.UPLOADS_DIR || path.join(rootDir, 'data', 'uploads'),
  emailWebhookSecret: process.env.EMAIL_WEBHOOK_SECRET || '',
  appName: process.env.APP_NAME || 'Stratelegy Insight',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:3000',
  supportEmail: process.env.SUPPORT_EMAIL || '',
  mail: {
    enabled: process.env.MAIL_ENABLED === 'true',
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@localhost',
    replyTo: process.env.SMTP_REPLY_TO || process.env.SUPPORT_EMAIL || '',
  },
  rootDir,
  isProduction: process.env.NODE_ENV === 'production',
  /** Set TRUST_PROXY=1 when the app sits behind a reverse proxy (nginx, load balancer). */
  trustProxy: process.env.TRUST_PROXY === '1' || process.env.TRUST_PROXY === 'true',
  /** Dev-only demo accounts — blocked in production regardless of env value. */
  seedDemoUsers: process.env.SEED_DEMO_USERS === 'true' && process.env.NODE_ENV !== 'production',
  demoUserPassword: process.env.DEMO_USER_PASSWORD || 'Demo123!',
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: Number(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'stratelegy',
  },
  skyswitch: {
    enabled: process.env.SKYSWITCH_ENABLED !== 'false',
    apiBaseUrl: process.env.SKYSWITCH_API_URL || 'https://api.skyswitch.com',
    accountId: process.env.SKYSWITCH_ACCOUNT_ID || '',
    clientId: process.env.SKYSWITCH_CLIENT_ID || '',
    clientSecret: process.env.SKYSWITCH_CLIENT_SECRET || '',
    username: process.env.SKYSWITCH_USERNAME || '',
    password: process.env.SKYSWITCH_PASSWORD || '',
    defaultDomain: process.env.SKYSWITCH_DEFAULT_DOMAIN || '',
    scope: process.env.SKYSWITCH_SCOPE || '*',
  },
  pbx: {
    enabled: process.env.PBX_ENABLED !== 'false',
    apiBaseUrl: process.env.PBX_API_URL || '',
    clientId: process.env.PBX_CLIENT_ID || '',
    clientSecret: process.env.PBX_CLIENT_SECRET || '',
    username: process.env.PBX_USERNAME || '',
    password: process.env.PBX_PASSWORD || '',
  },
};

function isLocalhostUrl(url) {
  try {
    const { hostname } = new URL(url);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return true;
  }
}

/** Fail fast when production is misconfigured. */
export function assertProductionConfig() {
  if (!config.isProduction) return;

  if (!process.env.JWT_SECRET || config.jwtSecret === DEV_JWT_SECRET) {
    throw new Error('[config] JWT_SECRET must be set to a strong value in production');
  }
  if (!process.env.APP_BASE_URL || isLocalhostUrl(config.appBaseUrl)) {
    throw new Error(
      '[config] APP_BASE_URL must be set to your public site URL in production (e.g. https://app.example.com)'
    );
  }
  if (!process.env.MYSQL_PASSWORD) {
    console.warn('[config] MYSQL_PASSWORD is not set — using empty password');
  }
  if (!config.mail.enabled) {
    console.warn('[config] MAIL_ENABLED is false — outbound email (invites, notifications) is disabled');
  }
  if (config.skyswitch.enabled) {
    const missing = [];
    if (!config.skyswitch.clientId) missing.push('SKYSWITCH_CLIENT_ID');
    if (!config.skyswitch.clientSecret) missing.push('SKYSWITCH_CLIENT_SECRET');
    if (!config.skyswitch.username) missing.push('SKYSWITCH_USERNAME');
    if (!config.skyswitch.password) missing.push('SKYSWITCH_PASSWORD');
    if (missing.length) {
      console.warn(`[config] SkySwitch enabled but missing: ${missing.join(', ')}`);
    }
    const scopeStatus = getSkySwitchScopeStatus(config.skyswitch.scope);
    if (scopeStatus.missing.length) {
      console.warn(
        `[config] SKYSWITCH_SCOPE is missing: ${scopeStatus.missing.join(', ')} — Call Logs and E911 Reports may return 403`
      );
    }
  }
  if (config.pbx.enabled) {
    const missing = [];
    if (!config.pbx.apiBaseUrl) missing.push('PBX_API_URL');
    if (!config.pbx.clientId) missing.push('PBX_CLIENT_ID');
    if (!config.pbx.clientSecret) missing.push('PBX_CLIENT_SECRET');
    if (!config.pbx.username) missing.push('PBX_USERNAME');
    if (!config.pbx.password) missing.push('PBX_PASSWORD');
    if (missing.length) {
      console.warn(`[config] PBX enabled but missing: ${missing.join(', ')}`);
    }
  }
  if (!config.emailWebhookSecret) {
    console.warn('[config] EMAIL_WEBHOOK_SECRET is not set — inbound email webhooks are disabled');
  }
  if (!process.env.ADMIN_PASSWORD) {
    console.warn(
      '[config] ADMIN_PASSWORD is not set — first admin will not be created until you set it'
    );
  }
}

function parseCorsOrigins() {
  const raw = process.env.CORS_ORIGINS;
  if (raw) {
    return raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (config.isProduction) {
    return [config.appBaseUrl].filter(Boolean);
  }
  return [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    config.appBaseUrl,
  ].filter(Boolean);
}

config.corsOrigins = parseCorsOrigins();
