import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { attachPermissions } from '../middleware/permissions.js';
import { canReadEntity } from '../services/permissions.js';
import { canViewTickets } from '../services/ticketPermissions.js';
import { addEntitySubscriber, removeEntitySubscriber } from '../services/entityEvents.js';

const router = Router();

function canSubscribeToEntity(user, permissions, entityName) {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (entityName === 'Ticket' || entityName === 'TicketComment') {
    return canViewTickets(permissions);
  }
  return canReadEntity(user, permissions, entityName);
}

router.get('/entities/:entityName/subscribe', requireAuth, attachPermissions, (req, res) => {
  const { entityName } = req.params;
  if (!canSubscribeToEntity(req.user, req.permissions, entityName)) {
    return res
      .status(403)
      .json({ message: 'You do not have permission to subscribe to this data' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  addEntitySubscriber(entityName, res);

  const heartbeat = setInterval(() => res.write(': heartbeat\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    removeEntitySubscriber(entityName, res);
  });
});

export default router;
