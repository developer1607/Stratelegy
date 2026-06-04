import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { config, assertProductionConfig } from './config.js';
import { initDatabase } from './db/index.js';
import { formatHttpError } from './utils/errors.js';
import { queryOne } from './db/query.js';

import authRoutes from './routes/auth.js';
import appsRoutes from './routes/apps.js';
import entityRoutes from './routes/entities.js';
import functionRoutes from './routes/functions.js';
import integrationRoutes from './routes/integrations.js';
import userRoutes from './routes/users.js';
import roleRoutes from './routes/roles.js';
import permissionRoutes from './routes/permissions.js';
import ticketRoutes from './routes/tickets.js';
import webhookRoutes from './routes/webhooks.js';
import logRoutes from './routes/logs.js';
import realtimeRoutes from './routes/realtime.js';
import pbxRoutes from './routes/pbx.js';
import emailRoutes from './routes/email.js';
import notificationRoutes from './routes/notifications.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

assertProductionConfig();

await initDatabase();

const app = express();
app.set('trust proxy', 1);

app.use(
  helmet({
    contentSecurityPolicy: config.isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || config.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again later.' },
});

const inviteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.isProduction ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many registration attempts. Please try again later.' },
});

app.get('/api/health', async (_req, res) => {
  try {
    await queryOne('SELECT 1 AS ok');
    res.json({ status: 'ok', database: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res
      .status(503)
      .json({ status: 'degraded', database: 'unavailable', timestamp: new Date().toISOString() });
  }
});

app.use('/uploads', express.static(config.uploadsDir));

app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register-invite', inviteRateLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/apps/public', appsRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/functions', functionRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/realtime', realtimeRoutes);
app.use('/api/pbx', pbxRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/notifications', notificationRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  const { status, message, extra_data } = formatHttpError(err);
  res.status(status).json({
    message,
    ...(extra_data ? { extra_data } : {}),
  });
});

async function setupFrontend() {
  if (config.isProduction) {
    const distPath = path.join(config.rootDir, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
      res.sendFile(path.join(distPath, 'index.html'));
    });
    return;
  }

  const { createServer } = await import('vite');
  const vite = await createServer({
    root: config.rootDir,
    server: {
      middlewareMode: true,
      // API is served by this Express app — do not proxy /api back to ourselves.
      proxy: {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
}

await setupFrontend();

const { host, port, mysql } = config;
app.listen(port, host, () => {
  console.log(
    `[server] Stratelegy Insight running at http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`
  );
  console.log(`[server] Environment: ${config.isProduction ? 'production' : 'development'}`);
  console.log(`[server] Database: MySQL ${mysql.database}@${mysql.host}:${mysql.port}`);
});
