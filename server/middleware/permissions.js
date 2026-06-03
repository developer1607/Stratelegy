import { getPermissionsForUser } from '../services/permissions.js';

export async function attachPermissions(req, res, next) {
  if (!req.user) {
    req.permissions = null;
    return next();
  }
  try {
    req.permissions = await getPermissionsForUser(req.user);
    next();
  } catch (e) {
    next(e);
  }
}

export function requireEntityRead(entityName) {
  return async (req, res, next) => {
    const name = req.params.entityName || entityName;
    if (req.user?.role === 'admin') return next();
    if (!req.permissions) {
      await attachPermissions(req, res, () => {});
    }
    const { canReadEntity } = await import('../services/permissions.js');
    if (!canReadEntity(req.user, req.permissions, name)) {
      return res.status(403).json({ message: 'You do not have permission to view this data' });
    }
    next();
  };
}

export function requireEntityWrite(entityName) {
  return async (req, res, next) => {
    const name = req.params.entityName || entityName;
    if (req.user?.role === 'admin') return next();
    if (!req.permissions) {
      await attachPermissions(req, res, () => {});
    }
    const { canWriteEntity } = await import('../services/permissions.js');
    if (!canWriteEntity(req.user, req.permissions, name)) {
      return res.status(403).json({ message: 'You do not have permission to modify this data' });
    }
    next();
  };
}
