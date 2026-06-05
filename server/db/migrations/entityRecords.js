import { query, queryOne, execute } from "../query.js";
import { parsePayload } from "../helpers.js";
import { ENTITY_REGISTRY, SAAS_ENTITY_NAMES } from "../entityDefinitions.js";
import { tableExists } from "../schemaHelpers.js";

/** One-time migration: legacy JSON entity_records → dedicated entity tables. */
export async function migrateEntitiesFromEntityRecords() {
  if (!(await tableExists("entity_records"))) {
    return {};
  }

  const counts = {};
  let anyMigrated = false;

  for (const entityName of SAAS_ENTITY_NAMES) {
    const def = ENTITY_REGISTRY[entityName];
    const existing = await queryOne(
      `SELECT COUNT(*) AS c FROM \`${def.table}\``,
    );
    if (Number(existing?.c ?? 0) > 0) {
      counts[entityName] = { migrated: 0, skipped: true };
      continue;
    }

    const legacyRows = await query(
      "SELECT * FROM entity_records WHERE entity_name = ?",
      [entityName],
    );

    let migrated = 0;
    for (const row of legacyRows) {
      const payload = parsePayload(row.payload);
      const id = row.id || payload.id;
      if (!id) continue;

      const colValues = { id };
      for (const [col, spec] of Object.entries(def.columns)) {
        if (col === "id" || col === "created_date" || col === "updated_date")
          continue;

        const apiField =
          spec.apiField ||
          (def.configEntity && col === "sort_order" ? "order" : col);
        let value = payload[apiField];
        if (value === undefined && col in payload) value = payload[col];

        if (value === undefined || value === null || value === "") {
          if (spec.default !== undefined) value = spec.default;
          else continue;
        }

        if (spec.type === "bool") {
          value =
            value === true || value === 1 || value === "1" || value === "true"
              ? 1
              : 0;
        } else if (spec.type === "int") {
          value = parseInt(value, 10);
          if (Number.isNaN(value)) continue;
        } else if (spec.type === "decimal") {
          value = parseFloat(value);
          if (Number.isNaN(value)) continue;
        }

        colValues[col] = value;
      }

      const cols = Object.keys(colValues);
      const placeholders = cols.map(() => "?").join(", ");
      const updateCols = cols.filter((c) => c !== "id");
      const updates =
        updateCols.length > 0
          ? `${updateCols.map((c) => `\`${c}\` = VALUES(\`${c}\`)`).join(", ")}, updated_date = VALUES(updated_date)`
          : "updated_date = VALUES(updated_date)";

      try {
        await execute(
          `INSERT INTO \`${def.table}\` (${cols.map((c) => `\`${c}\``).join(", ")}, created_date, updated_date)
           VALUES (${placeholders}, ?, ?)
           ON DUPLICATE KEY UPDATE ${updates}`,
          [...Object.values(colValues), row.created_date, row.updated_date],
        );
        migrated++;
      } catch (e) {
        console.error(`[migrate] ${entityName}`, id, e.message);
      }
    }

    counts[entityName] = { migrated, skipped: false };
    if (migrated > 0) {
      anyMigrated = true;
      console.log(
        `[db] Migrated ${migrated} ${entityName} records from entity_records to ${def.table}`,
      );
    }
  }

  const ticketCounts = await migrateTicketsIfEmpty();
  counts.Ticket = ticketCounts.tickets;
  counts.TicketComment = ticketCounts.comments;
  if (ticketCounts.tickets.migrated > 0 || ticketCounts.comments.migrated > 0) {
    anyMigrated = true;
  }

  if (anyMigrated) {
    await execute("DELETE FROM entity_records");
    console.log("[db] Cleared legacy entity_records after migration");
  }

  return counts;
}

async function migrateTicketsIfEmpty() {
  const result = {
    tickets: { migrated: 0, skipped: true },
    comments: { migrated: 0, skipped: true },
  };

  const ticketsExist = await queryOne("SELECT COUNT(*) AS c FROM tickets");
  if (Number(ticketsExist?.c ?? 0) > 0) {
    return result;
  }

  result.tickets.skipped = false;
  result.comments.skipped = false;

  const legacyTickets = await query(
    "SELECT * FROM entity_records WHERE entity_name = 'Ticket'",
  );
  const legacyComments = await query(
    "SELECT * FROM entity_records WHERE entity_name = 'TicketComment'",
  );

  for (const row of legacyTickets) {
    const p = parsePayload(row.payload);
    const id = row.id;
    try {
      await execute(
        `INSERT INTO tickets (
          id, ticket_number, title, description, status, priority, category, department, source,
          assigned_to, requester, requester_email, created_by, created_date, updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE updated_date = VALUES(updated_date)`,
        [
          id,
          p.ticket_number ?? null,
          p.title || "Untitled",
          p.description || "",
          p.status || "open",
          p.priority || "medium",
          p.category || "report_a_problem",
          p.department || null,
          p.source || "web",
          p.assigned_to || p.assignee || null,
          p.requester || null,
          p.requester_email || null,
          p.created_by || null,
          row.created_date,
          row.updated_date,
        ],
      );
      result.tickets.migrated++;
    } catch (e) {
      console.error("[migrate] ticket", id, e.message);
    }
  }

  for (const row of legacyComments) {
    const p = parsePayload(row.payload);
    if (!p.ticket_id) continue;
    try {
      await execute(
        `INSERT INTO ticket_comments (id, ticket_id, message, is_internal, author, author_email, created_date, updated_date)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE updated_date = VALUES(updated_date)`,
        [
          row.id,
          p.ticket_id,
          p.message || "",
          p.is_internal ? 1 : 0,
          p.author || null,
          p.author_email || null,
          row.created_date,
          row.updated_date,
        ],
      );
      result.comments.migrated++;
    } catch (e) {
      console.error("[migrate] comment", row.id, e.message);
    }
  }

  if (result.tickets.migrated > 0) {
    console.log(
      `[db] Migrated ${result.tickets.migrated} tickets from entity_records to tickets table`,
    );
  }
  if (result.comments.migrated > 0) {
    console.log(
      `[db] Migrated ${result.comments.migrated} TicketComment records from entity_records`,
    );
  }

  return result;
}
