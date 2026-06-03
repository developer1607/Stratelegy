import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { config } from '../config.js';
import {
  getMailConfigStatus,
  verifySmtpConnection,
  sendTestEmail,
} from '../services/email/mailer.js';

const router = Router();

router.use(requireAdmin);

function devToolsOnly(_req, res, next) {
  if (config.isProduction) {
    return res.status(404).json({ message: 'Not found' });
  }
  next();
}

router.get('/status', (_req, res) => {
  res.json(getMailConfigStatus());
});

router.post('/verify', devToolsOnly, async (_req, res, next) => {
  try {
    const result = await verifySmtpConnection();
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/test', devToolsOnly, async (req, res, next) => {
  try {
    const to = String(req.body?.to || '').trim();
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return res.status(400).json({ message: 'Valid recipient email (to) is required' });
    }
    const result = await sendTestEmail({ to, sentBy: req.user?.email });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
