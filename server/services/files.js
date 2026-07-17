import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "../config.js";
import { queryOne, execute } from "../db/query.js";

const ALLOWED_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".csv",
  ".json",
  ".txt",
  ".pdf",
]);

const ALLOWED_MIME_PREFIXES = [
  "image/",
  "text/",
  "application/json",
  "application/pdf",
];

function sanitizeExtension(originalName) {
  const ext = path.extname(originalName || "").toLowerCase();
  if (ext && ALLOWED_EXTENSIONS.has(ext)) return ext;
  return "";
}

function isAllowedMime(mime) {
  if (!mime) return true;
  return ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
}

export function fileApiPath(filename) {
  return `/api/integrations/files/${encodeURIComponent(filename)}`;
}

export async function saveUploadedFile(file, uploadedByUserId = null) {
  const ext = sanitizeExtension(file.originalname);
  const filename = `${uuidv4()}${ext}`;
  const dest = path.join(config.uploadsDir, filename);
  fs.writeFileSync(dest, file.buffer);

  const mime = file.mimetype || null;
  if (!isAllowedMime(mime)) {
    fs.unlinkSync(dest);
    const err = new Error("File type is not allowed");
    err.status = 400;
    throw err;
  }

  const id = uuidv4();
  await execute(
    `INSERT INTO file_uploads (id, filename, original_name, mime_type, size_bytes, uploaded_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      id,
      filename,
      file.originalname || null,
      mime,
      file.buffer?.length ?? file.size ?? null,
      uploadedByUserId || null,
    ],
  );

  return { file_url: fileApiPath(filename), filename, id };
}

export function resolveUploadPath(fileUrlOrFilename) {
  const raw = fileUrlOrFilename || "";
  const basename = path.basename(
    raw
      .replace(/^\/api\/integrations\/files\//, "")
      .replace(/^\/uploads\//, ""),
  );
  return path.join(config.uploadsDir, basename);
}

export async function getUploadRecord(filename) {
  const name = path.basename(filename);
  return queryOne("SELECT * FROM file_uploads WHERE filename = ?", [name]);
}

export function canAccessUpload(uploadRecord, user) {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!uploadRecord || !uploadRecord.uploaded_by) return false;
  return uploadRecord.uploaded_by === user.id;
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
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
  const headers = parseCsvLine(lines[0]).map((h) =>
    h.toLowerCase().replace(/\s+/g, "_"),
  );
  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || "";
    });
    const name =
      row.name ||
      row.full_name ||
      `${row.first_name || ""} ${row.last_name || ""}`.trim();
    return {
      name,
      email: row.email || row.email_address || "",
      phone: row.phone || row.phone_number || row.mobile || "",
      company: row.company || row.organization || "",
      position: row.position || row.title || row.job_title || "",
      source: row.source || "import",
    };
  });
}

export function extractDataFromFile(filePath, jsonSchema) {
  const ext = path.extname(filePath).toLowerCase();
  const content = fs.readFileSync(filePath, "utf8");

  if (ext === ".csv" || content.includes(",")) {
    const rows = parseCsv(content).filter((r) => r.name || r.email);
    const isArray = jsonSchema?.type === "array";
    return {
      status: "success",
      output: isArray ? rows : rows[0] || null,
    };
  }

  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
    return {
      status: "success",
      output: {
        name: "",
        email: "",
        phone: "",
        company: "",
        position: "",
      },
    };
  }

  try {
    const parsed = JSON.parse(content);
    return { status: "success", output: parsed };
  } catch {
    return {
      status: "error",
      message: "Unsupported file format for extraction",
    };
  }
}
