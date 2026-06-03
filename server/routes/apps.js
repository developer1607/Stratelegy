import { Router } from 'express';
import { config } from '../config.js';

const router = Router();

router.get('/prod/public-settings/by-id/:appId', (req, res) => {
  if (req.params.appId !== config.appId) {
    return res.status(404).json({ message: 'App not found' });
  }
  res.json({
    id: config.appId,
    public_settings: {
      auth_required: true,
      app_name: 'Stratelegy Insight',
    },
  });
});

export default router;
