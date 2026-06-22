import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { attachPermissions } from "../middleware/permissions.js";
import { canReadEntity, canWriteEntity } from "../services/permissions.js";
import {
  assertTicketCreateAllowed,
  assertTicketUpdateAllowed,
  assertTicketDeleteAllowed,
  assertTicketCommentAllowed,
  canViewTickets,
  canViewInternalTicketNotes,
  filterCommentsForViewer,
} from "../services/ticketPermissions.js";
import {
  listEntities,
  listEntitiesPage,
  getEntity,
  filterEntities,
  createEntity,
  updateEntity,
  deleteEntity,
  bulkCreateEntities,
} from "../services/entities.js";

const router = Router();

const CRM_CREATED_BY_ENTITIES = new Set([
  "Account",
  "Contact",
  "Lead",
  "Opportunity",
  "Activity",
  "CalendarEvent",
  "KBArticle",
]);

router.use(requireAuth, attachPermissions);

function checkRead(req, entityName) {
  if (entityName === "User" && req.user.role !== "admin") return false;
  if (entityName === "Ticket" || entityName === "TicketComment") {
    return req.user.role === "admin" || canViewTickets(req.permissions);
  }
  return canReadEntity(req.user, req.permissions, entityName);
}

function checkWrite(req, entityName) {
  if (entityName === "Ticket" || entityName === "TicketComment") {
    return req.user.role === "admin";
  }
  return canWriteEntity(req.user, req.permissions, entityName);
}

function sanitizeCommentBody(user, permissions, body) {
  if (canViewInternalTicketNotes(user, permissions)) return body;
  return { ...body, is_internal: false };
}

function sanitizeCommentRecord(user, permissions, record) {
  if (!record) return record;
  if (canViewInternalTicketNotes(user, permissions)) return record;
  if (record.is_internal) return null;
  return record;
}

router.get("/:entityName", async (req, res, next) => {
  try {
    const { entityName } = req.params;
    if (!checkRead(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this data" });
    }
    const { sort, limit, offset } = req.query;
    if (offset !== undefined) {
      const result = await listEntitiesPage(
        entityName,
        sort,
        limit,
        offset,
      );
      if (entityName === 'TicketComment') {
        result.items = filterCommentsForViewer(
          result.items,
          req.user,
          req.permissions,
        );
      }
      return res.json(result);
    }
    let rows = await listEntities(entityName, sort, limit);
    if (entityName === "TicketComment") {
      rows = filterCommentsForViewer(rows, req.user, req.permissions);
    }
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/:entityName/filter", async (req, res, next) => {
  try {
    const { entityName } = req.params;
    if (!checkRead(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this data" });
    }
    const { query = {}, sort } = req.body;
    let rows = await filterEntities(entityName, query, sort);
    if (entityName === "TicketComment") {
      rows = filterCommentsForViewer(rows, req.user, req.permissions);
    }
    res.json(rows);
  } catch (e) {
    next(e);
  }
});

router.post("/:entityName/bulk", async (req, res, next) => {
  try {
    const { entityName } = req.params;
    if (!checkWrite(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this data" });
    }
    const items = req.body.items || req.body;
    res.json(await bulkCreateEntities(entityName, items));
  } catch (e) {
    next(e);
  }
});

router.get("/:entityName/:id", async (req, res, next) => {
  try {
    const { entityName, id } = req.params;
    if (!checkRead(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this data" });
    }
    const record = await getEntity(entityName, id);
    if (entityName === "TicketComment") {
      const visible = sanitizeCommentRecord(req.user, req.permissions, record);
      if (!visible) {
        return res.status(404).json({ message: "TicketComment not found" });
      }
      return res.json(visible);
    }
    res.json(record);
  } catch (e) {
    next(e);
  }
});

router.post("/:entityName", async (req, res, next) => {
  try {
    const { entityName } = req.params;
    if (entityName === "Ticket") {
      if (!checkRead(req, entityName)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to view this data" });
      }
      assertTicketCreateAllowed(req.permissions);
    } else if (entityName === "TicketComment") {
      if (!checkRead(req, "Ticket")) {
        return res
          .status(403)
          .json({ message: "You do not have permission to view this data" });
      }
      assertTicketCommentAllowed(req.permissions);
    } else if (!checkWrite(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this data" });
    }
    let body = req.body || {};
    if (CRM_CREATED_BY_ENTITIES.has(entityName)) {
      body = { ...body, created_by: body.created_by || req.user?.id };
    }
    if (entityName === "Account") {
      const owner = String(body.owner ?? "").trim();
      if (!owner && req.user) {
        body = { ...body, owner: req.user.full_name || req.user.email };
      }
    }
    if (entityName === "Ticket") {
      body = { ...body, created_by: body.created_by || req.user?.id };
    }
    if (entityName === "TicketComment") {
      body = sanitizeCommentBody(req.user, req.permissions, {
        ...body,
        author: body.author || req.user?.full_name || req.user?.email,
        author_email: body.author_email || req.user?.email,
      });
    }
    res
      .status(201)
      .json(
        await createEntity(entityName, body, { actorEmail: req.user?.email }),
      );
  } catch (e) {
    next(e);
  }
});

router.patch("/:entityName/:id", async (req, res, next) => {
  try {
    const { entityName, id } = req.params;
    if (entityName === "Ticket") {
      if (!checkRead(req, entityName)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to view this data" });
      }
      const existing = await getEntity(entityName, id);
      assertTicketUpdateAllowed(req.permissions, existing, req.body || {});
    } else if (!checkWrite(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this data" });
    }
    res.json(
      await updateEntity(entityName, id, req.body, {
        actorEmail: req.user?.email,
      }),
    );
  } catch (e) {
    next(e);
  }
});

router.delete("/:entityName/:id", async (req, res, next) => {
  try {
    const { entityName, id } = req.params;
    if (entityName === "Ticket") {
      if (!checkRead(req, entityName)) {
        return res
          .status(403)
          .json({ message: "You do not have permission to view this data" });
      }
      assertTicketDeleteAllowed(req.permissions);
    } else if (!checkWrite(req, entityName)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to modify this data" });
    }
    res.json(await deleteEntity(entityName, id));
  } catch (e) {
    next(e);
  }
});

export default router;
