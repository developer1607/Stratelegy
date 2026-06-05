import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config, assertProductionConfig } from "./config.js";
import { initDatabase } from "./db/index.js";
import { closePool } from "./db/query.js";
import { formatHttpError } from "./utils/errors.js";
import {
  isSkySwitchNetworkError,
  toSkySwitchNetworkError,
} from "./services/skyswitch/networkError.js";
import {
  DEVELOPMENT_CSP_DIRECTIVES,
  PRODUCTION_CSP_DIRECTIVES,
} from "./utils/csp.js";
import { queryOne } from "./db/query.js";
import { closeAllSubscribers } from "./services/entityEvents.js";

import authRoutes from "./routes/auth.js";
import appsRoutes from "./routes/apps.js";
import entityRoutes from "./routes/entities.js";
import functionRoutes from "./routes/functions.js";
import integrationRoutes from "./routes/integrations.js";
import userRoutes from "./routes/users.js";
import roleRoutes from "./routes/roles.js";
import permissionRoutes from "./routes/permissions.js";
import ticketRoutes from "./routes/tickets.js";
import webhookRoutes from "./routes/webhooks.js";
import logRoutes from "./routes/logs.js";
import realtimeRoutes from "./routes/realtime.js";
import pbxRoutes from "./routes/pbx.js";
import notificationRoutes from "./routes/notifications.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

assertProductionConfig();

await initDatabase();

const app = express();
app.set("trust proxy", 1);

const useHsts = config.isProduction && config.appBaseUrl.startsWith("https://");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: config.isProduction
        ? PRODUCTION_CSP_DIRECTIVES
        : DEVELOPMENT_CSP_DIRECTIVES,
    },
    crossOriginEmbedderPolicy: false,
    hsts: useHsts
      ? { maxAge: 31536000, includeSubDomains: true, preload: false }
      : false,
  }),
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
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 20 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts. Please try again later." },
});

const inviteRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.isProduction ? 10 : 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many registration attempts. Please try again later.",
  },
});

const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 600 : 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." },
});

app.use("/api", (req, res, next) => {
  if (req.path === "/health") return next();
  apiRateLimiter(req, res, next);
});

app.get("/api/health", async (_req, res) => {
  try {
    await queryOne("SELECT 1 AS ok");
    res.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res
      .status(503)
      .json({
        status: "degraded",
        database: "unavailable",
        timestamp: new Date().toISOString(),
      });
  }
});

app.use("/uploads", express.static(config.uploadsDir));

app.use("/api/auth/login", authRateLimiter);
app.use("/api/auth/register-invite", inviteRateLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/apps/public", appsRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/functions", functionRoutes);
app.use("/api/integrations", integrationRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/realtime", realtimeRoutes);
app.use("/api/pbx", pbxRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "Not found" });
});

async function setupFrontend() {
  if (config.isProduction) {
    const distPath = path.join(config.rootDir, "dist");
    const indexPath = path.join(distPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      throw new Error(
        "[server] Production build missing. Run `npm run build` before `npm start`.",
      );
    }
    app.use(
      express.static(distPath, {
        index: false,
        maxAge: "1d",
        immutable: false,
      }),
    );
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/uploads"))
        return next();
      res.sendFile(indexPath);
    });
    return;
  }

  const { createServer } = await import("vite");
  const vite = await createServer({
    root: config.rootDir,
    server: {
      middlewareMode: true,
      // API is served by this Express app — do not proxy /api back to ourselves.
      proxy: {},
    },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

await setupFrontend();

app.use((err, _req, res, _next) => {
  if (isSkySwitchNetworkError(err)) {
    err = toSkySwitchNetworkError();
  }
  const { status, message, extra_data } = formatHttpError(err);
  const logMessage = message || err?.message || String(err);
  if (config.isProduction || err?.expose) {
    console.error(`[server] Request error (${status}):`, logMessage);
  } else {
    console.error(`[server] Request error (${status}):`, logMessage);
    console.error(err);
  }
  res.status(status).json({
    message,
    ...(extra_data ? { extra_data } : {}),
  });
});

const { host, port, mysql } = config;
const server = app.listen(port, host, () => {
  console.log(
    `[server] Stratelegy Insight running at http://${host === "0.0.0.0" ? "localhost" : host}:${port}`,
  );
  console.log(
    `[server] Environment: ${config.isProduction ? "production" : "development"}`,
  );
  console.log(
    `[server] Database: MySQL ${mysql.database}@${mysql.host}:${mysql.port}`,
  );
  if (!config.skyswitch.enabled) {
    console.log("[server] SkySwitch PBX disabled (SKYSWITCH_ENABLED=false)");
  } else if (!config.isProduction) {
    console.log(
      `[server] SkySwitch PBX enabled — requires DNS/network access to ${config.skyswitch.apiBaseUrl}`,
    );
  }
});

server.on("error", (err) => {
  console.error("[server] Failed to start:", err.message);
  process.exit(1);
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`[server] ${signal} received — shutting down`);

  closeAllSubscribers();

  const forceExit = setTimeout(() => {
    console.error("[server] Forced shutdown after timeout");
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  server.close(async () => {
    try {
      await closePool();
      console.log("[server] Shutdown complete");
      process.exit(0);
    } catch (err) {
      console.error("[server] Shutdown error:", err?.message || err);
      process.exit(1);
    }
  });
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
