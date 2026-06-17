import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config.js';
import { queryOne, execute } from '../../db/query.js';
import { escapeHtml, renderLayout } from './templates/base.js';
import {
  getEditableDefault,
  EMAIL_TEMPLATE_VARIABLES,
} from './editableDefaults.js';

function flattenTemplateData(data = {}) {
  const flat = {
    appName: config.appName,
    appBaseUrl: config.appBaseUrl,
    ...data,
  };

  if (data.ticket?.id) {
    flat.ticketUrl = `${config.appBaseUrl}/SupportTicketDetail?id=${encodeURIComponent(data.ticket.id)}`;
  }

  if (data.ticket && typeof data.ticket === 'object') {
    for (const [key, value] of Object.entries(data.ticket)) {
      flat[`ticket.${key}`] = value;
    }
  }

  if (data.comment && typeof data.comment === 'object') {
    for (const [key, value] of Object.entries(data.comment)) {
      flat[`comment.${key}`] = value;
    }
  }

  if (data.loginUrl == null && !flat.loginUrl) {
    flat.loginUrl = `${config.appBaseUrl}/login`;
  }

  return flat;
}

function interpolate(template, flat, { html = false } = {}) {
  if (template == null) return '';
  return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = flat[key];
    if (value == null || value === '') return '';
    const text = String(value);
    return html ? escapeHtml(text) : text;
  });
}

function rowToContent(row) {
  if (!row) return null;
  return {
    subject: row.subject,
    use_layout: Boolean(row.use_layout),
    layout_title: row.layout_title || '',
    layout_preheader: row.layout_preheader || '',
    layout_cta_url: row.layout_cta_url || '',
    layout_cta_label: row.layout_cta_label || '',
    html_body: row.html_body || '',
    text: row.text_body || '',
    is_customized: true,
    updated_date: row.updated_date,
  };
}

export function mergeTemplateContent(templateId, overrideRow) {
  const defaults = getEditableDefault(templateId);
  if (!defaults) return null;

  const override = rowToContent(overrideRow);
  if (!override) {
    return {
      ...defaults,
      is_customized: false,
      variables: EMAIL_TEMPLATE_VARIABLES[templateId] || [],
    };
  }

  return {
    ...defaults,
    ...override,
    is_customized: true,
    variables: EMAIL_TEMPLATE_VARIABLES[templateId] || [],
  };
}

export async function getTemplateOverrideRow(templateId) {
  return queryOne('SELECT * FROM email_template_overrides WHERE template_id = ?', [templateId]);
}

export async function getTemplateContent(templateId) {
  const defaults = getEditableDefault(templateId);
  if (!defaults) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }
  const row = await getTemplateOverrideRow(templateId);
  return mergeTemplateContent(templateId, row);
}

export async function saveTemplateOverride(templateId, content, updatedByUserId) {
  const defaults = getEditableDefault(templateId);
  if (!defaults) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }

  const subject = String(content.subject ?? defaults.subject).trim();
  if (!subject) {
    const err = new Error('Subject is required');
    err.status = 400;
    throw err;
  }

  const payload = {
    subject,
    use_layout: content.use_layout !== false,
    layout_title: content.layout_title ?? defaults.layout_title ?? '',
    layout_preheader: content.layout_preheader ?? defaults.layout_preheader ?? '',
    layout_cta_url: content.layout_cta_url ?? defaults.layout_cta_url ?? '',
    layout_cta_label: content.layout_cta_label ?? defaults.layout_cta_label ?? '',
    html_body: content.html_body ?? defaults.html_body ?? '',
    text_body: content.text ?? defaults.text ?? '',
  };

  const existing = await getTemplateOverrideRow(templateId);
  if (existing) {
    await execute(
      `UPDATE email_template_overrides
       SET subject = ?, use_layout = ?, layout_title = ?, layout_preheader = ?,
           layout_cta_url = ?, layout_cta_label = ?, html_body = ?, text_body = ?,
           updated_by = ?, updated_date = NOW()
       WHERE template_id = ?`,
      [
        payload.subject,
        payload.use_layout ? 1 : 0,
        payload.layout_title,
        payload.layout_preheader,
        payload.layout_cta_url,
        payload.layout_cta_label,
        payload.html_body,
        payload.text_body,
        updatedByUserId || null,
        templateId,
      ]
    );
  } else {
    await execute(
      `INSERT INTO email_template_overrides
        (id, template_id, subject, use_layout, layout_title, layout_preheader,
         layout_cta_url, layout_cta_label, html_body, text_body, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        uuidv4(),
        templateId,
        payload.subject,
        payload.use_layout ? 1 : 0,
        payload.layout_title,
        payload.layout_preheader,
        payload.layout_cta_url,
        payload.layout_cta_label,
        payload.html_body,
        payload.text_body,
        updatedByUserId || null,
      ]
    );
  }

  return getTemplateContent(templateId);
}

export async function resetTemplateOverride(templateId) {
  await execute('DELETE FROM email_template_overrides WHERE template_id = ?', [templateId]);
  return getTemplateContent(templateId);
}

export function renderTemplateContent(content, data) {
  const flat = flattenTemplateData(data);
  const subject = interpolate(content.subject, flat);
  const text = interpolate(content.text, flat);

  let html;
  if (content.use_layout) {
    const bodyHtml = interpolate(content.html_body, flat, { html: true });
    html = renderLayout({
      title: interpolate(content.layout_title, flat),
      preheader: interpolate(content.layout_preheader, flat),
      bodyHtml,
      ctaUrl: interpolate(content.layout_cta_url, flat) || undefined,
      ctaLabel: interpolate(content.layout_cta_label, flat) || undefined,
    });
  } else {
    html = interpolate(content.html_body, flat, { html: true });
  }

  return { subject, text, html };
}

export async function renderTemplateWithOverrides(templateId, data) {
  const content = await getTemplateContent(templateId);
  return renderTemplateContent(content, data);
}
