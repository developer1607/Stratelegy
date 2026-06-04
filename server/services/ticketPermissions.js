import { CLOSED_TICKET_STATUSES } from '../constants/permissionRegistry.js';
import { hasPermission } from '../constants/permissions.js';

export function canViewTickets(permissions) {
  return (
    hasPermission(permissions, 'can_view_tickets') ||
    hasPermission(permissions, 'can_view_tickets_page')
  );
}

export function canCreateTickets(permissions) {
  return hasPermission(permissions, 'can_create_tickets');
}

export function canEditTickets(permissions) {
  return hasPermission(permissions, 'can_edit_tickets');
}

export function canAssignTickets(permissions) {
  return hasPermission(permissions, 'can_assign_tickets');
}

export function canCloseTickets(permissions) {
  return hasPermission(permissions, 'can_close_tickets');
}

export function canDeleteTickets(permissions) {
  return hasPermission(permissions, 'can_delete_tickets');
}

export function canCommentTickets(permissions) {
  return hasPermission(permissions, 'can_comment_tickets');
}

export function assertTicketCreateAllowed(permissions) {
  if (!canCreateTickets(permissions)) {
    const err = new Error('You do not have permission to create tickets');
    err.status = 403;
    throw err;
  }
}

export function assertTicketUpdateAllowed(permissions, existingTicket, updates) {
  if (!canViewTickets(permissions)) {
    const err = new Error('You do not have permission to view tickets');
    err.status = 403;
    throw err;
  }

  const keys = Object.keys(updates || {});
  if (keys.length === 0) return;

  const editFields = [
    'title',
    'description',
    'priority',
    'category',
    'department',
    'source',
    'requester',
    'requester_email',
  ];
  const needsEdit = keys.some((k) => editFields.includes(k) && updates[k] !== existingTicket?.[k]);
  const assigns =
    keys.includes('assigned_to') && updates.assigned_to !== existingTicket?.assigned_to;
  const statusChanging = keys.includes('status') && updates.status !== existingTicket?.status;
  const closes = statusChanging && CLOSED_TICKET_STATUSES.has(updates.status);
  const needsEditForStatus = statusChanging && !closes;

  if ((needsEdit || needsEditForStatus) && !canEditTickets(permissions)) {
    const err = new Error('You do not have permission to edit tickets');
    err.status = 403;
    throw err;
  }
  if (assigns && !canAssignTickets(permissions)) {
    const err = new Error('You do not have permission to assign tickets');
    err.status = 403;
    throw err;
  }
  if (closes && !canCloseTickets(permissions)) {
    const err = new Error('You do not have permission to close or resolve tickets');
    err.status = 403;
    throw err;
  }

  if (!needsEdit && !needsEditForStatus && !assigns && !closes && !canEditTickets(permissions)) {
    const err = new Error('You do not have permission to update tickets');
    err.status = 403;
    throw err;
  }
}

export function assertTicketDeleteAllowed(permissions) {
  if (!canDeleteTickets(permissions)) {
    const err = new Error('You do not have permission to delete tickets');
    err.status = 403;
    throw err;
  }
}

export function assertTicketCommentAllowed(permissions) {
  if (!canCommentTickets(permissions)) {
    const err = new Error('You do not have permission to comment on tickets');
    err.status = 403;
    throw err;
  }
}

/** Internal notes are visible to admins and agents who can edit or assign tickets. */
export function canViewInternalTicketNotes(user, permissions) {
  if (user?.role === 'admin') return true;
  return canEditTickets(permissions) || canAssignTickets(permissions);
}

export function filterCommentsForViewer(comments, user, permissions) {
  if (canViewInternalTicketNotes(user, permissions)) return comments;
  return comments.filter((c) => !c.is_internal);
}
