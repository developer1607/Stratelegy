import { attachPermissions } from './permissions.js';
import { isPbxDomainReadOnly } from '../../shared/pbxDomainAccess.js';

export function requirePbxPermission(permissionKey) {
  return async (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    if (!req.permissions) {
      await attachPermissions(req, res, () => {});
    }
    const perms = req.permissions || {};
    if (perms.isAdmin || perms.can_access_pbx) return next();
    if (permissionKey && perms[permissionKey]) return next();
    return res.status(403).json({ message: 'No PBX access' });
  };
}

export function requireAnyPbxPermission(...permissionKeys) {
  return async (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    if (!req.permissions) {
      await attachPermissions(req, res, () => {});
    }
    const perms = req.permissions || {};
    if (perms.isAdmin || perms.can_access_pbx) return next();
    if (permissionKeys.some((key) => perms[key])) return next();
    return res.status(403).json({ message: 'No PBX access' });
  };
}

/** Block POST/PUT/PATCH/DELETE for domain-scoped (read-only) PBX users. */
export async function blockPbxDomainScopedWrite(req, res, next) {
  if (req.user?.role === 'admin') return next();
  if (!req.permissions) {
    await attachPermissions(req, res, () => {});
  }
  if (isPbxDomainReadOnly(req.permissions)) {
    return res.status(403).json({
      message: 'Domain-scoped PBX access is read-only. Contact an admin to make changes.',
    });
  }
  return next();
}
