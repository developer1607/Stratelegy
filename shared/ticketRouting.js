/** Ticket routing — category defaults and assignee matching. */

export { CATEGORY_DEFAULT_DEPARTMENT } from "./ticketConstants.js";

export const ROLE_DEFAULT_DEPARTMENTS = {
  support: ["support", "billing"],
  support_viewer: ["support"],
  full_portal: ["support", "sales", "billing", "number_porting_team"],
};

export function parseCsvField(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function parseAssigneeDepartments(record) {
  const fromField = parseCsvField(record?.departments);
  if (fromField.length > 0) return fromField;
  return [];
}

export function parseAssigneeCategories(record) {
  return parseCsvField(record?.categories);
}

/**
 * Whether an assignee can handle a ticket with the given department/category.
 * Empty department/category lists = general pool (matches any ticket).
 */
export function assigneeMatchesTicket(assignee, { department, category } = {}) {
  const dept = department ? String(department).toLowerCase() : "";
  const cat = category ? String(category).toLowerCase() : "";
  const assigneeDepts = parseAssigneeDepartments(assignee);
  const assigneeCats = parseAssigneeCategories(assignee);

  const deptOk =
    !dept || assigneeDepts.length === 0 || assigneeDepts.includes(dept);
  const catOk = !cat || assigneeCats.length === 0 || assigneeCats.includes(cat);

  if (dept && cat) return deptOk && catOk;
  if (dept) return deptOk;
  if (cat) return catOk;
  return true;
}

export function filterAssigneesForTicket(
  assignees,
  { department, category } = {},
) {
  if (!department && !category) return assignees;
  const matched = assignees.filter((a) =>
    assigneeMatchesTicket(a, { department, category }),
  );
  return matched.length > 0 ? matched : assignees;
}
