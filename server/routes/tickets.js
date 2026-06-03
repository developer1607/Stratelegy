import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { attachPermissions } from '../middleware/permissions.js';
import {
  canViewTickets,
  canAssignTickets,
  assertTicketCreateAllowed,
  assertTicketUpdateAllowed,
  assertTicketDeleteAllowed,
  assertTicketCommentAllowed,
  filterCommentsForViewer,
  canViewInternalTicketNotes,
} from '../services/ticketPermissions.js';
import { listTicketAssignees } from '../services/ticketAssignees.js';
import {
  listTicketsFiltered,
  listTicketsFilteredPage,
  getTicketStatusCounts,
  listDistinctAssignees,
  getTicketDetail,
  getTicket,
  updateTicket,
  deleteTicket,
  createComment,
} from '../services/ticketStore.js';
import { isValidEmail, normalizeEmail } from '../validators/ticket.js';
import { createEntity } from '../services/entities.js';

const router = Router();

router.use(requireAuth, attachPermissions);

function assertCanViewTickets(req, res) {
  const isAdmin = req.user.role === 'admin';
  if (isAdmin || canViewTickets(req.permissions)) return true;
  res.status(403).json({ message: 'You do not have permission to view tickets' });
  return false;
}

/** Filtered ticket list for support UI (server-side search & filters). */
router.get('/', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;

    const {
      search,
      status,
      priority,
      category,
      department,
      assigned_to: assignedTo,
      unassigned,
      sort = '-created_date',
      limit,
      offset,
      paginate,
    } = req.query;

    const filterOptions = {
      search,
      status,
      priority,
      category,
      department,
      assignedTo,
      unassignedOnly: unassigned === '1' || unassigned === 'true',
      sort,
      limit,
      offset,
    };

    if (paginate === '1' || paginate === 'true' || offset != null) {
      return res.json(await listTicketsFilteredPage(filterOptions));
    }

    res.json(await listTicketsFiltered(filterOptions));
  } catch (e) {
    next(e);
  }
});

/** Status counts for support dashboard tiles. */
router.get('/stats', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;
    res.json(await getTicketStatusCounts());
  } catch (e) {
    next(e);
  }
});

/** Distinct assignee values for filter dropdowns. */
router.get('/assignee-options', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;
    res.json(await listDistinctAssignees());
  } catch (e) {
    next(e);
  }
});

/** Assignee roster for ticket UI — not gated on admin-only Agent entity reads. */
router.get('/assignees', async (req, res, next) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const canView = isAdmin || canViewTickets(req.permissions);
    const canAssign = isAdmin || canAssignTickets(req.permissions);

    if (!canView && !canAssign) {
      return res.status(403).json({ message: 'You do not have permission to view assignees' });
    }

    const { department, category } = req.query;
    res.json(
      await listTicketAssignees({
        department: department || undefined,
        category: category || undefined,
      })
    );
  } catch (e) {
    next(e);
  }
});

/** Create ticket — same hooks as entity API, single fast path. */
router.post('/', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;
    assertTicketCreateAllowed(req.permissions);

    let body = { ...(req.body || {}), created_by: req.body?.created_by || req.user?.id };
    const requesterEmail = normalizeEmail(body.requester_email);
    if (isValidEmail(requesterEmail)) {
      body.requester_email = requesterEmail.toLowerCase();
    } else if (isValidEmail(req.user?.email)) {
      body.requester_email = req.user.email.toLowerCase();
    } else {
      body.requester_email = null;
    }

    const created = await createEntity('Ticket', body, { actorEmail: req.user?.email });
    res.status(201).json(created);
  } catch (e) {
    next(e);
  }
});

/** Add comment to a ticket. */
router.post('/:id/comments', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;
    assertTicketCommentAllowed(req.permissions);

    const ticket = await getTicket(req.params.id);
    let body = {
      ...(req.body || {}),
      ticket_id: ticket.id,
      author: req.body?.author || req.user?.full_name || req.user?.email,
      author_email: req.body?.author_email || req.user?.email,
    };
    if (!canViewInternalTicketNotes(req.user, req.permissions)) {
      body = { ...body, is_internal: false };
    }

    const comment = await createComment(body, { actorEmail: req.user?.email });
    res.status(201).json(comment);
  } catch (e) {
    next(e);
  }
});

/** Update ticket fields — one read for permission check, one after write. */
router.patch('/:id', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;

    const existing = await getTicket(req.params.id);
    assertTicketUpdateAllowed(req.permissions, existing, req.body || {});
    const ticket = await updateTicket(req.params.id, req.body || {}, {
      actorEmail: req.user?.email,
    });
    res.json(ticket);
  } catch (e) {
    next(e);
  }
});

/** Delete ticket and its comments. */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;

    const existing = await getTicket(req.params.id);
    assertTicketDeleteAllowed(req.permissions);
    res.json(await deleteTicket(req.params.id, { existingTicket: existing }));
  } catch (e) {
    next(e);
  }
});

/** Ticket + comments (+ assignees when allowed) in one response for the detail page. */
router.get('/:id', async (req, res, next) => {
  try {
    if (!assertCanViewTickets(req, res)) return;

    const { ticket, comments: rawComments } = await getTicketDetail(req.params.id);
    const comments = filterCommentsForViewer(rawComments, req.user, req.permissions);

    const isAdmin = req.user.role === 'admin';
    const canAssign = isAdmin || canAssignTickets(req.permissions);

    const payload = { ticket, comments };
    if (canAssign) {
      payload.assignees = await listTicketAssignees({
        department: ticket.department || undefined,
        category: ticket.category || undefined,
      });
    }

    res.json(payload);
  } catch (e) {
    next(e);
  }
});

export default router;
