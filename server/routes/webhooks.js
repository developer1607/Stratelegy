import { Router } from 'express';
import { config } from '../config.js';
import { createTicketFromEmail } from '../services/tickets.js';

const router = Router();

router.get('/email', (_req, res) => {
  res.json({ status: 'Email webhook active' });
});

router.post('/email', async (req, res, next) => {
  try {
    if (!config.emailWebhookSecret) {
      return res.status(503).json({ error: 'Email webhook is not configured' });
    }
    const secret =
      req.get('x-webhook-secret') ||
      (req.get('authorization') || '').replace(/^Bearer\s+/i, '') ||
      req.query.secret;
    if (secret !== config.emailWebhookSecret) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const contentType = req.headers['content-type'] || '';
    let subject = 'No Subject';
    let body = '';
    let fromEmail = '';

    if (contentType.includes('application/json')) {
      const data = req.body;
      subject = data.subject || data.Subject || 'No Subject';
      body = data.body || data.Body || data.text || data.Text || data.html || data.Html || '';
      fromEmail = data.from_email || data.fromEmail || data.from || data.From || '';
    } else {
      subject = 'Email received';
      body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const ticket = await createTicketFromEmail({ subject, body, fromEmail });
    res.json({ success: true, ticket_id: ticket.id });
  } catch (e) {
    next(e);
  }
});

export default router;
