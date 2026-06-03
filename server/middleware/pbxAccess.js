import { attachPermissions } from './permissions.js';

export function requirePbxPermission(permissionKey) {
  return async (req, res, next) => {
    if (req.user?.role === 'admin') return next();
    if (!req.permissions) {
      await attachPermissions(req, res, () => {});
    }
    const perms = req.permissions || {};
    if (perms.isAdmin || perms.can_access_pbx) return next();
    if (permissionKey && perms[permissionKey]) return next();
    return res.status(403).json({ message: 'You do not have permission to access PBX data' });
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
    return res.status(403).json({ message: 'You do not have permission to access PBX data' });
  };
}
