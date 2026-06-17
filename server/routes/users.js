import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  createUser,
  inviteUser,
  getUserById,
  deleteUser,
  setUserPasswordAdmin,
  updateUserSupportRouting,
  setUserMfaEmailSettings,
  disableMfaEmailForUser,
} from '../services/users.js';
import { auditLog } from '../services/auditLog.js';
import {
  assignPortalRole,
  setUserPermissionFlags,
  getUserPermissionsAdminView,
  setUserPbxDomains,
} from '../services/permissions.js';
import { PERMISSION_KEYS } from '../constants/permissions.js';

const router = Router();

router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const {
      email,
      password,
      full_name,
      fullName,
      role = 'user',
      grant_crm_access,
      permissions,
      portal_role_id,
      portalRoleId,
    } = req.body || {};
    const user = await createUser({
      email,
      password,
      fullName: full_name ?? fullName,
      role,
      grantCrmAccess: Boolean(grant_crm_access),
      permissions,
      portalRoleId: portal_role_id ?? portalRoleId,
      createdByUserId: req.user.id,
    });
    await auditLog(req, 'user_created', {
      resourceType: 'user',
      resourceId: user.id,
      metadata: { email: user.email, role: user.role },
    });
    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
});

router.post('/invite', requireAdmin, async (req, res, next) => {
  try {
    const { email, role = 'user', portal_role_id, portalRoleId } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const result = await inviteUser(
      email,
      role,
      req.user.id,
      portal_role_id ?? portalRoleId ?? null
    );
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/:id/permissions', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(await getUserPermissionsAdminView(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post('/:id/portal-role', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res
        .status(400)
        .json({ message: 'Admin users have full access and do not use portal roles' });
    }
    const roleId = req.body?.role_id ?? req.body?.roleId;
    if (!roleId) return res.status(400).json({ message: 'role_id is required' });

    const result = await assignPortalRole({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      roleId,
    });
    res.json({ permission: result });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/support-routing', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { departments, categories } = req.body || {};
    const updated = await updateUserSupportRouting(user.id, { departments, categories });
    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/password', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const password = req.body?.password ?? req.body?.new_password;
    if (!password) return res.status(400).json({ message: 'password is required' });
    const updated = await setUserPasswordAdmin(user.id, password);
    await auditLog(req, 'user_password_reset', {
      resourceType: 'user',
      resourceId: user.id,
    });
    res.json({ user: updated, message: 'Password updated' });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/pbx-domains', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Admin users are not domain-scoped' });
    }
    const { domains, pbx_domains } = req.body || {};
    const list = domains ?? pbx_domains;
    if (list == null) {
      return res.status(400).json({ message: 'domains array is required' });
    }
    const permission = await setUserPbxDomains({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      domains: list,
    });
    res.json({ permission });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/permissions', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') {
      return res
        .status(400)
        .json({ message: 'Admin users have full access and do not use portal roles' });
    }

    const updates = {};
    for (const key of PERMISSION_KEYS) {
      if (req.body?.[key] !== undefined) updates[key] = Boolean(req.body[key]);
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No permission fields provided' });
    }

    const permission = await setUserPermissionFlags({
      userId: user.id,
      userEmail: user.email,
      userName: user.full_name,
      updates,
      useCustomPermissions: true,
    });
    await auditLog(req, 'user_permissions_updated', {
      resourceType: 'user',
      resourceId: user.id,
      metadata: { keys: Object.keys(updates) },
    });
    res.json({ permission });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/mfa', requireAdmin, async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const enabled = req.body?.enabled ?? req.body?.mfa_email_enabled;
    const forced = req.body?.forced ?? req.body?.mfa_email_forced;

    if (enabled === false) {
      const updated = await disableMfaEmailForUser(user.id, { admin: true });
      await auditLog(req, 'mfa_email_disabled_admin', {
        resourceType: 'user',
        resourceId: user.id,
      });
      return res.json({ user: updated });
    }

    const updated = await setUserMfaEmailSettings(user.id, {
      enabled: enabled !== undefined ? Boolean(enabled) : undefined,
      forced: forced !== undefined ? Boolean(forced) : undefined,
    });
    await auditLog(req, 'mfa_email_updated_admin', {
      resourceType: 'user',
      resourceId: user.id,
      metadata: {
        enabled: updated.mfa_email_enabled,
        forced: updated.mfa_email_forced,
      },
    });
    res.json({ user: updated });
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await deleteUser(req.params.id, { deletedByUserId: req.user.id });
    await auditLog(req, 'user_deleted', {
      resourceType: 'user',
      resourceId: result.id,
      metadata: { email: result.email },
    });
    res.json({ ...result, message: 'User deleted' });
  } catch (e) {
    next(e);
  }
});

export default router;
