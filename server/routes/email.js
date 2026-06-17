import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  listEmailTemplatesAdminWithStatus,
  getEmailTemplateForEdit,
  previewEmailTemplate,
  getEmailSystemStatus,
  saveTemplateOverride,
  resetTemplateOverride,
  sendTestTemplateEmail,
} from '../services/email/templateCatalog.js';

const router = Router();

router.use(requireAdmin);

router.get('/status', (_req, res) => {
  res.json(getEmailSystemStatus());
});

router.get('/templates', async (_req, res, next) => {
  try {
    res.json({
      templates: await listEmailTemplatesAdminWithStatus(),
      status: getEmailSystemStatus(),
    });
  } catch (e) {
    next(e);
  }
});

router.get('/templates/:id', async (req, res, next) => {
  try {
    res.json(await getEmailTemplateForEdit(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.get('/templates/:id/preview', async (req, res, next) => {
  try {
    res.json(await previewEmailTemplate(req.params.id));
  } catch (e) {
    next(e);
  }
});

router.post('/templates/:id/preview', async (req, res, next) => {
  try {
    res.json(await previewEmailTemplate(req.params.id, req.body?.content || req.body));
  } catch (e) {
    next(e);
  }
});

router.put('/templates/:id', async (req, res, next) => {
  try {
    const content = await saveTemplateOverride(
      req.params.id,
      req.body?.content || req.body,
      req.user?.id
    );
    res.json({ content });
  } catch (e) {
    next(e);
  }
});

router.post('/templates/:id/test', async (req, res, next) => {
  try {
    const result = await sendTestTemplateEmail(req.params.id, {
      to: req.body?.to ?? req.body?.email,
      content: req.body?.content,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.delete('/templates/:id/customization', async (req, res, next) => {
  try {
    const content = await resetTemplateOverride(req.params.id);
    res.json({ content });
  } catch (e) {
    next(e);
  }
});

export default router;
