import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config.js';

export function saveUploadedFile(file) {
  const ext = path.extname(file.originalname || '') || '';
  const filename = `${uuidv4()}${ext}`;
  const dest = path.join(config.uploadsDir, filename);
  fs.writeFileSync(dest, file.buffer);
  const fileUrl = `/uploads/${filename}`;
  return { file_url: fileUrl, filename };
}

export function resolveUploadPath(fileUrl) {
  const name = path.basename(fileUrl);
  return path.join(config.uploadsDir, name);
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
      continue;
    }
    current += ch;
  }
  result.push(current.trim());
  return result;
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/\s+/g, '_'));
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    const name =
      row.name || row.full_name || `${row.first_name || ''} ${row.last_name || ''}`.trim();
    return {
      name,
      email: row.email || row.email_address || '',
      phone: row.phone || row.phone_number || row.mobile || '',
      company: row.company || row.organization || '',
      position: row.position || row.title || row.job_title || '',
      source: row.source || 'import',
    };
  });
}

export function extractDataFromFile(filePath, jsonSchema) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, 'utf8');

  if (ext === '.csv' || content.includes(',')) {
    const rows = parseCsv(content).filter((r) => r.name || r.email);
    const isArray = jsonSchema?.type === 'array';
    return {
      status: 'success',
      output: isArray ? rows : rows[0] || null,
    };
  }

  if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
    return {
      status: 'success',
      output: {
        name: '',
        email: '',
        phone: '',
        company: '',
        position: '',
      },
    };
  }

  try {
    const parsed = JSON.parse(content);
    return { status: 'success', output: parsed };
  } catch {
    return { status: 'error', message: 'Unsupported file format for extraction' };
  }
}
