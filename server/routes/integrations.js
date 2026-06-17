import { Router } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { requireAuth } from '../middleware/auth.js';
import {
  saveUploadedFile,
  resolveUploadPath,
  extractDataFromFile,
  getUploadRecord,
  canAccessUpload,
} from '../services/files.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });
const router = Router();

router.post('/upload', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file provided' });
    const result = await saveUploadedFile(req.file, req.user.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/files/:filename', requireAuth, async (req, res, next) => {
  try {
    const filename = path.basename(req.params.filename);
    const uploadRecord = await getUploadRecord(filename);

    if (!canAccessUpload(uploadRecord, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this file' });
    }

    const filePath = resolveUploadPath(filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    const mime = uploadRecord?.mime_type || 'application/octet-stream';
    res.setHeader('Content-Type', mime);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.sendFile(filePath);
  } catch (e) {
    next(e);
  }
});

router.post('/extract', requireAuth, async (req, res, next) => {
  try {
    const { file_url, json_schema } = req.body || {};
    if (!file_url) return res.status(400).json({ message: 'file_url is required' });

    const filename = path.basename(
      String(file_url).replace(/^\/api\/integrations\/files\//, '').replace(/^\/uploads\//, '')
    );
    const uploadRecord = await getUploadRecord(filename);
    if (!canAccessUpload(uploadRecord, req.user)) {
      return res.status(403).json({ message: 'You do not have access to this file' });
    }

    const filePath = resolveUploadPath(file_url);
    const result = extractDataFromFile(filePath, json_schema);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
