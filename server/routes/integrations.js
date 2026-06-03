import { Router } from 'express';
import multer from 'multer';
import { requireAuth } from '../middleware/auth.js';
import { saveUploadedFile, resolveUploadPath, extractDataFromFile } from '../services/files.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router();

router.post('/upload', requireAuth, upload.single('file'), (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = saveUploadedFile(req.file);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/extract', requireAuth, (req, res, next) => {
  try {
    const { file_url, json_schema } = req.body || {};
    if (!file_url) return res.status(400).json({ message: 'file_url is required' });
    const filePath = resolveUploadPath(file_url);
    const result = extractDataFromFile(filePath, json_schema);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
