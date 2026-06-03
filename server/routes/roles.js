import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { listRolesWithPermissions } from '../services/roles.js';

const router = Router();

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await listRolesWithPermissions());
  } catch (e) {
    next(e);
  }
});

export default router;
