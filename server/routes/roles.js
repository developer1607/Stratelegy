import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  listRolesWithPermissions,
  createPortalRole,
  updatePortalRole,
  deletePortalRole,
} from '../services/roles.js';

const router = Router();

router.get('/', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await listRolesWithPermissions());
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body || {};
    res.status(201).json(await createPortalRole({ name, description, permissions }));
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, permissions } = req.body || {};
    res.json(
      await updatePortalRole(req.params.id, {
        name,
        description,
        permissions,
      })
    );
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await deletePortalRole(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
