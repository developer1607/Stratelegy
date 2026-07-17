import { v4 as uuidv4 } from "uuid";
import { execute } from "../db/query.js";
import { getClientIp } from "./loginProtection.js";

/**
 * @param {import('express').Request} req
 * @param {string} action
 * @param {{ resourceType?: string, resourceId?: string, metadata?: object, actorUserId?: string }} [opts]
 */
export async function auditLog(req, action, opts = {}) {
  const actorUserId = opts.actorUserId ?? req?.user?.id ?? null;
  const ip = req ? getClientIp(req) : null;
  const metadata = opts.metadata ? JSON.stringify(opts.metadata) : null;

  try {
    await execute(
      `INSERT INTO audit_events (id, actor_user_id, action, resource_type, resource_id, metadata, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        actorUserId,
        action,
        opts.resourceType ?? null,
        opts.resourceId ?? null,
        metadata,
        ip,
      ],
    );
  } catch (e) {
    console.error("[audit] failed to write event:", action, e?.message || e);
  }
}
