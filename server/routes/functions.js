import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { attachPermissions } from '../middleware/permissions.js';
import {
  getPermissionsForUser,
  getAllPermissions,
  updateUserPermissions,
  assignPortalRole,
} from '../services/permissions.js';
import { canAssignTickets } from '../services/ticketPermissions.js';
import { assignTicketNumber, autoAssignTicket } from '../services/tickets.js';

const router = Router();

router.post('/:name', requireAuth, attachPermissions, async (req, res, next) => {
  try {
    const { name } = req.params;
    const body = req.body || {};

    switch (name) {
      case 'getMyPermissions': {
        const permissions = await getPermissionsForUser(req.user);
        return res.json({ data: { permissions } });
      }
      case 'getUserPermissions': {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        return res.json({ data: { permissions: await getAllPermissions() } });
      }
      case 'updateUserPermissions': {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        const { userId, userEmail, userName, updates } = body;
        if (!userId || !updates) {
          return res.status(400).json({ error: 'Missing required fields: userId, updates' });
        }
        const permission = await updateUserPermissions({ userId, userEmail, userName, updates });
        return res.json({ data: { permission } });
      }
      case 'assignPortalRole': {
        if (req.user.role !== 'admin') {
          return res.status(403).json({ error: 'Forbidden: Admin access required' });
        }
        const { userId, userEmail, userName, roleId, role_id } = body;
        if (!userId || !(roleId || role_id)) {
          return res.status(400).json({ error: 'Missing required fields: userId, roleId' });
        }
        const permission = await assignPortalRole({
          userId,
          userEmail,
          userName,
          roleId: roleId || role_id,
        });
        return res.json({ data: { permission } });
      }
      case 'assignTicketNumber': {
        if (req.user.role !== 'admin' && !canAssignTickets(req.permissions)) {
          return res.status(403).json({ error: 'Forbidden: assign permission required' });
        }
        const ticketId = body?.event?.entity_id || body?.ticketId;
        if (!ticketId) return res.status(400).json({ error: 'No ticket ID provided' });
        const result = await assignTicketNumber(ticketId);
        return res.json({ data: result });
      }
      case 'autoAssignTicket': {
        if (req.user.role !== 'admin' && !canAssignTickets(req.permissions)) {
          return res.status(403).json({ error: 'Forbidden: assign permission required' });
        }
        const ticketId = body?.event?.entity_id || body?.ticketId;
        if (!ticketId) return res.status(400).json({ error: 'No ticket ID provided' });
        const result = await autoAssignTicket(ticketId);
        return res.json({ data: result });
      }
      default:
        return res.status(404).json({ error: `Unknown function: ${name}` });
    }
  } catch (e) {
    next(e);
  }
});

export default router;
