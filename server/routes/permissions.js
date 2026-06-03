import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { buildPermissionGroupsForUI, buildPagePermissionMap } from '../constants/permissionRegistry.js';
import { PERMISSION_KEYS } from '../constants/permissions.js';

const router = Router();

router.get('/definitions', requireAdmin, (_req, res) => {
  res.json({
    keys: PERMISSION_KEYS,
    groups: buildPermissionGroupsForUI(),
    pageMap: buildPagePermissionMap(),
  });
});

export default router;
