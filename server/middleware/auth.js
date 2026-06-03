import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { getUserById } from '../services/users.js';

const JWT_VERIFY_OPTIONS = {
  issuer: 'stratelegy-insight',
  audience: 'stratelegy-portal',
};

export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret, JWT_VERIFY_OPTIONS);
    req.user = await getUserById(payload.sub);
    if (!req.user?.is_active) req.user = null;
  } catch {
    req.user = null;
  }
  next();
}

export function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required',
        extra_data: { reason: 'auth_required' },
      });
    }
    next();
  }).catch(next);
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
  });
}

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    {
      expiresIn: config.isProduction ? '24h' : '7d',
      issuer: 'stratelegy-insight',
      audience: 'stratelegy-portal',
    }
  );
}

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  return req.headers['x-access-token'] || null;
}
