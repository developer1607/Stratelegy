import { Router } from "express";
import rateLimit from "express-rate-limit";
import { optionalAuth, requireAuth, signToken } from "../middleware/auth.js";
import { config } from "../config.js";
import {
  authenticateUser,
  updateUser,
  changeUserPassword,
  getUserById,
  getUserTokenVersion,
  registerFromInvite,
  incrementUserTokenVersion,
  disableMfaEmailForUser,
  enableMfaEmailForUser,
  rowToUser,
} from "../services/users.js";
import { assertPasswordValid } from "../utils/passwordValidation.js";
import {
  clearFailedLogins,
  getClientIp,
  getLockoutRemainingMs,
  isLoginLocked,
  normalizeLoginEmail,
  recordFailedLogin,
  validateLoginInput,
} from "../services/loginProtection.js";
import {
  createMfaEmailChallenge,
  verifyMfaEmailChallenge,
  userRequiresMfaEmail,
} from "../services/mfaEmail.js";
import { isEmailOperational } from "../services/email/mailer.js";
import { auditLog } from "../services/auditLog.js";
import { queryOne } from "../db/query.js";

const router = Router();

const mfaRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isProduction ? 15 : 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification attempts. Try again later." },
});

router.post("/login", async (req, res, next) => {
  try {
    const ip = getClientIp(req);
    const { email, password } = req.body || {};
    const input = validateLoginInput(email, password);
    if (!input.ok) {
      return res.status(400).json({ message: input.message });
    }

    if (await isLoginLocked(ip, input.email)) {
      const mins = Math.max(
        1,
        Math.ceil((await getLockoutRemainingMs(ip, input.email)) / 60000),
      );
      return res.status(429).json({
        message: `Too many failed attempts. Try again in ${mins} minute(s).`,
      });
    }

    const authResult = await authenticateUser(input.email, password);
    if (!authResult) {
      await recordFailedLogin(ip, input.email);
      await auditLog(req, "login_failed", {
        metadata: { email: input.email },
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { user, tokenVersion } = authResult;

    const userRow = await queryOne("SELECT * FROM users WHERE id = ?", [user.id]);
    if (userRequiresMfaEmail(userRow)) {
      if (!(await isEmailOperational())) {
        return res.status(503).json({
          message:
            'Email MFA is enabled for your account but outbound mail is not working. Contact an administrator to fix SMTP settings.',
        });
      }
      const challenge = await createMfaEmailChallenge(user.id, "login");
      await auditLog(req, "login_mfa_challenge", {
        actorUserId: user.id,
        resourceType: "user",
        resourceId: user.id,
      });
      return res.json({
        mfa_required: true,
        mfa_token: challenge.challengeToken,
        email_hint: challenge.emailHint,
        expires_in: challenge.expiresInSeconds,
      });
    }

    await clearFailedLogins(ip, input.email);
    const token = signToken(user, tokenVersion);
    await auditLog(req, "login_success", {
      actorUserId: user.id,
      resourceType: "user",
      resourceId: user.id,
    });
    res.json({ token, user });
  } catch (e) {
    next(e);
  }
});

router.post("/mfa/verify", mfaRateLimiter, async (req, res, next) => {
  try {
    const { mfa_token, code, mfaToken } = req.body || {};
    const challengeToken = mfa_token ?? mfaToken;
    const verificationCode = code ?? req.body?.verification_code;

    if (!challengeToken || !verificationCode) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const { user, purpose } = await verifyMfaEmailChallenge(
      challengeToken,
      verificationCode,
      { purpose: "login" },
    );

    if (purpose !== "login") {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const ip = getClientIp(req);
    await clearFailedLogins(ip, normalizeLoginEmail(user.email));

    const tokenVersion = await getUserTokenVersion(user.id);
    const token = signToken(rowToUser(user), tokenVersion ?? 0);

    await auditLog(req, "login_success", {
      actorUserId: user.id,
      resourceType: "user",
      resourceId: user.id,
      metadata: { mfa: true },
    });

    res.json({ token, user: rowToUser(user) });
  } catch (e) {
    next(e);
  }
});

router.post("/mfa/resend", mfaRateLimiter, async (req, res, next) => {
  try {
    const { mfa_token, mfaToken } = req.body || {};
    const challengeToken = mfa_token ?? mfaToken;
    if (!challengeToken) {
      return res.status(400).json({ message: "mfa_token is required" });
    }

    const challenge = await queryOne(
      "SELECT user_id, purpose FROM mfa_email_challenges WHERE challenge_token = ?",
      [challengeToken],
    );
    if (!challenge || challenge.purpose !== "login") {
      return res.status(400).json({ message: "Invalid or expired verification session" });
    }

    const result = await createMfaEmailChallenge(challenge.user_id, "login", { resend: true });
    res.json({
      mfa_required: true,
      mfa_token: result.challengeToken,
      email_hint: result.emailHint,
      expires_in: result.expiresInSeconds,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/mfa/enable/start", requireAuth, mfaRateLimiter, async (req, res, next) => {
  try {
    if (!(await isEmailOperational())) {
      return res.status(503).json({
        message: "Email is not configured. Contact an administrator to enable email MFA.",
      });
    }

    const challenge = await createMfaEmailChallenge(req.user.id, "enable");
    res.json({
      mfa_token: challenge.challengeToken,
      email_hint: challenge.emailHint,
      expires_in: challenge.expiresInSeconds,
    });
  } catch (e) {
    next(e);
  }
});

router.post("/mfa/enable/confirm", requireAuth, mfaRateLimiter, async (req, res, next) => {
  try {
    const { mfa_token, code, mfaToken } = req.body || {};
    const challengeToken = mfa_token ?? mfaToken;
    const verificationCode = code ?? req.body?.verification_code;

    if (!challengeToken || !verificationCode) {
      return res.status(400).json({ message: "Verification code is required" });
    }

    const { user, purpose } = await verifyMfaEmailChallenge(
      challengeToken,
      verificationCode,
      { purpose: "enable" },
    );

    if (user.id !== req.user.id || purpose !== "enable") {
      return res.status(400).json({ message: "Invalid verification session" });
    }

    const updated = await enableMfaEmailForUser(req.user.id);
    await auditLog(req, "mfa_email_enabled", {
      resourceType: "user",
      resourceId: req.user.id,
    });
    res.json({ user: updated, message: "Email MFA enabled" });
  } catch (e) {
    next(e);
  }
});

router.post("/mfa/disable", requireAuth, async (req, res, next) => {
  try {
    const row = await queryOne("SELECT mfa_email_forced FROM users WHERE id = ?", [req.user.id]);
    if (row?.mfa_email_forced) {
      return res.status(400).json({
        message: "Email MFA is required by an administrator and cannot be disabled",
      });
    }

    const currentPassword = req.body?.current_password ?? req.body?.currentPassword;
    if (!currentPassword) {
      return res.status(400).json({ message: "Current password is required" });
    }

    const authResult = await authenticateUser(req.user.email, currentPassword);
    if (!authResult || authResult.user.id !== req.user.id) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const updated = await disableMfaEmailForUser(req.user.id);
    await auditLog(req, "mfa_email_disabled", {
      resourceType: "user",
      resourceId: req.user.id,
    });
    res.json({ user: updated, message: "Email MFA disabled" });
  } catch (e) {
    next(e);
  }
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    res.json({
      ...req.user,
      email_mfa_available: await isEmailOperational(),
    });
  } catch (e) {
    next(e);
  }
});

router.patch("/me", requireAuth, async (req, res, next) => {
  try {
    const body = { ...(req.body || {}) };
    const newPassword = body.new_password ?? body.newPassword ?? body.password;

    let passwordChanged = false;
    if (newPassword !== undefined && newPassword !== "") {
      await changeUserPassword(req.user.id, {
        currentPassword: body.current_password ?? body.currentPassword,
        newPassword,
      });
      passwordChanged = true;
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

    res.json({
      ...updated,
      password_changed: passwordChanged,
      email_mfa_available: await isEmailOperational(),
    });
  } catch (e) {
    next(e);
  }
});

router.post("/logout", optionalAuth, async (req, res, next) => {
  try {
    if (req.user?.id) {
      await incrementUserTokenVersion(req.user.id);
      await auditLog(req, "logout", {
        resourceType: "user",
        resourceId: req.user.id,
      });
    }
    res.json({ success: true });
  } catch (e) {
    next(e);
  }
});

router.post("/register-invite", async (req, res, next) => {
  try {
    const { token, email, password, full_name, fullName } = req.body || {};

    if (!token || !email || !password) {
      return res
        .status(400)
        .json({ message: "token, email, and password are required" });
    }

    const normalizedEmail = normalizeLoginEmail(email);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ message: "A valid email is required" });
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

    const tokenVersion = await getUserTokenVersion(user.id);
    const jwt = signToken(user, tokenVersion ?? 0);
    res.status(201).json({ token: jwt, user });
  } catch (e) {
    next(e);
  }
});

export default router;
