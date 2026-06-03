import { config } from '../../../config.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderLayout({ title, preheader, bodyHtml, ctaUrl, ctaLabel }) {
  const appName = escapeHtml(config.appName);
  const safeTitle = escapeHtml(title);
  const safePreheader = escapeHtml(preheader || title);
  const button =
    ctaUrl && ctaLabel
      ? `<p style="margin:24px 0;">
           <a href="${escapeHtml(ctaUrl)}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:600;">
             ${escapeHtml(ctaLabel)}
           </a>
         </p>
         <p style="font-size:12px;color:#64748b;word-break:break-all;">Or copy this link: ${escapeHtml(ctaUrl)}</p>`
      : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;color:#0f172a;">
  <span style="display:none;max-height:0;overflow:hidden;">${safePreheader}</span>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;background:#0f172a;color:#ffffff;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;">${appName}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h2 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#0f172a;">${safeTitle}</h2>
              ${bodyHtml}
              ${button}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;">
              This message was sent by ${appName}.
              ${config.supportEmail ? ` Need help? Contact <a href="mailto:${escapeHtml(config.supportEmail)}">${escapeHtml(config.supportEmail)}</a>.` : ''}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function infoRow(label, value) {
  if (value == null || value === '') return '';
  return `<p style="margin:0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`;
}
