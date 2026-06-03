import { Router } from 'express';
import { optionalAuth, requireAuth, signToken } from '../middleware/auth.js';
import {
  authenticateUser,
  updateUser,
  changeUserPassword,
  getUserById,
  registerFromInvite,
} from '../services/users.js';
import { assertPasswordValid } from '../utils/passwordValidation.js';
import {
  clearFailedLogins,
  getClientIp,
  getLockoutRemainingMs,
  isLoginLocked,
  normalizeLoginEmail,
  recordFailedLogin,
  validateLoginInput,
} from '../services/loginProtection.js';

const router = Router();

router.post('/login', async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const { email, password } = req.body || {};
    const input = validateLoginInput(email, password);
    if (!input.ok) {
      return res.status(400).json({ message: input.message });
    }

    if (isLoginLocked(ip, input.email)) {
      const mins = Math.max(1, Math.ceil(getLockoutRemainingMs(ip, input.email) / 60000));
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${mins} minute(s).`,
      });
    }

    const user = await authenticateUser(input.email, password);
    if (!user) {
      recordFailedLogin(ip, input.email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    clearFailedLogins(ip, input.email);
    const token = signToken(user);
    res.json({ token, user });
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

router.patch('/me', requireAuth, async (req, res, next) => {
  try {
    const body = { ...(req.body || {}) };
    const newPassword = body.new_password ?? body.newPassword ?? body.password;

    if (newPassword !== undefined && newPassword !== '') {
      await changeUserPassword(req.user.id, {
        currentPassword: body.current_password ?? body.currentPassword,
        newPassword,
      });
      delete body.new_password;
      delete body.newPassword;
      delete body.password;
      delete body.current_password;
      delete body.currentPassword;
    }

    const { full_name, display_name, avatar_url, profile_picture } = body;
    const hasProfileUpdate =
      full_name !== undefined ||
      display_name !== undefined ||
      avatar_url !== undefined ||
      profile_picture !== undefined;

    const updated = hasProfileUpdate
      ? await updateUser(req.user.id, body)
      : await getUserById(req.user.id);

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.post('/logout', optionalAuth, (_req, res) => {
  res.json({ success: true });
});

router.post('/register-invite', async (req, res, next) => {
  try {
    const { token, email, password, full_name, fullName } = req.body || {};
    if (!token || !email || !password) {
      return res.status(400).json({ message: 'token, email, and password are required' });
    }
    const normalizedEmail = normalizeLoginEmail(email);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: 'A valid email is required' });
    }
    try {
      assertPasswordValid(password);
    } catch (e) {
      return res.status(e.status || 400).json({ message: e.message });
    }
    const user = await registerFromInvite({
      token,
      email: normalizedEmail,
      password,
      fullName: full_name ?? fullName,
    });
    const jwt = signToken(user);
    res.status(201).json({ token: jwt, user });
  } catch (e) {
    next(e);
  }
});

export default router;
