import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { execute } from '../db/query.js';

const router = Router();

router.post('/in-app', requireAuth, async (req, res, next) => {
  try {
    const { page_name: pageName } = req.body || {};
    if (pageName) {
      await execute('INSERT INTO app_logs (user_id, page_name) VALUES (?, ?)', [
        req.user.id,
        pageName,
      ]);
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

export default router;
