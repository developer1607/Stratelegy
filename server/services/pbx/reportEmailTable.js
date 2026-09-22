/** Shared HTML/text helpers for scheduled PBX report emails. */

export function escapeHtml(value) {
  return String(value ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildReportTableHtml(headers, rows, cellValues, { maxRows = 500 } = {}) {
  if (!rows?.length) {
    return '<p style="padding:12px;color:#64748b;margin:0;">No matching rows.</p>';
  }
  const header = `<tr>${headers
    .map(
      (h) =>
        `<th align="left" style="padding:8px;border-bottom:1px solid #e2e8f0;background:#f8fafc;font-size:11px;text-transform:uppercase;color:#64748b;">${escapeHtml(h)}</th>`,
    )
    .join('')}</tr>`;
  const body = rows
    .slice(0, maxRows)
    .map((row) => {
      const cells = cellValues(row)
        .map(
          (value) =>
            `<td style="padding:8px;border-bottom:1px solid #f1f5f9;font-size:13px;">${escapeHtml(value)}</td>`,
        )
        .join('');
      return `<tr>${cells}</tr>`;
    })
    .join('');
  const truncated =
    rows.length > maxRows
      ? `<p style="margin:8px 0 0;color:#64748b;font-size:12px;">Showing first ${maxRows} of ${rows.length} rows.</p>`
      : '';
  return `<table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${header}${body}</table>${truncated}`;
}
