import { listUsers } from "./users.js";
import { getAllPermissions } from "./permissions.js";
import { hasPermission } from "../constants/permissions.js";
import { filterAssigneesForTicket } from "../constants/ticketRouting.js";

function toAssigneeRecord(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.full_name || user.email,
    departments: user.departments || "",
    categories: user.categories || "",
    source: "portal_user",
  };
}

function canBeTicketAssignee(user, permissions) {
  if (user.role === "admin") return true;
  if (!permissions) return false;
  return (
    hasPermission(permissions, "can_assign_tickets") ||
    hasPermission(permissions, "can_edit_tickets")
  );
}

/**
 * Portal users who can receive ticket assignments.
 * Every support-capable portal user is an assignee — no separate agents roster.
 */
export async function listTicketAssignees({ department, category } = {}) {
  const [users, permRows] = await Promise.all([
    listUsers(),
    getAllPermissions(),
  ]);
  const permByUser = new Map(permRows.map((r) => [r.user_id, r]));

  let assignees = users
    .filter((u) => u.is_active)
    .filter((u) => canBeTicketAssignee(u, permByUser.get(u.id)))
    .map(toAssigneeRecord);

  assignees = filterAssigneesForTicket(assignees, { department, category });
  assignees.sort((a, b) => String(a.name).localeCompare(String(b.name)));

  return assignees;
}
