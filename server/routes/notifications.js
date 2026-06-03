import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  listNotifications,
  getUnreadCount,
  setNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  deleteAllReadNotifications,
} from '../services/notifications.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
  try {
    const unreadOnly = req.query.unread_only === '1' || req.query.unread_only === 'true';
    const limit = req.query.limit;
    const offset = req.query.offset;
    const result = await listNotifications(req.user.id, { unreadOnly, limit, offset });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/unread-count', async (req, res, next) => {
  try {
    const count = await getUnreadCount(req.user.id);
    res.json({ unread_count: count });
  } catch (e) {
    next(e);
  }
});

router.post('/mark-all-read', async (req, res, next) => {
  try {
    const result = await markAllNotificationsRead(req.user.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/read', async (req, res, next) => {
  try {
    const result = await deleteAllReadNotifications(req.user.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/read', async (req, res, next) => {
  try {
    const read = req.body?.read !== false;
    const notification = await setNotificationRead(req.params.id, req.user.id, read);
    const unread_count = await getUnreadCount(req.user.id);
    res.json({ notification, unread_count });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await deleteNotification(req.params.id, req.user.id);
    const unread_count = await getUnreadCount(req.user.id);
    res.json({ success: true, unread_count });
  } catch (e) {
    next(e);
  }
});

export default router;
