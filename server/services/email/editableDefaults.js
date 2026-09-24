/** Default editable template strings — placeholders use {{name}} or {{ticket.title}} syntax. */

export const EMAIL_TEMPLATE_VARIABLES = {
  portal_invite: [
    { key: 'appName', label: 'Application name' },
    { key: 'inviteeEmail', label: 'Invitee email' },
    { key: 'inviteUrl', label: 'Invite link URL' },
    { key: 'invitedByName', label: 'Inviter name' },
    { key: 'role', label: 'Portal role' },
  ],
  portal_welcome: [
    { key: 'appName', label: 'Application name' },
    { key: 'fullName', label: 'User full name' },
    { key: 'email', label: 'User email' },
    { key: 'loginUrl', label: 'Sign-in URL' },
    { key: 'createdByName', label: 'Created by (admin)' },
  ],
  mfa_email_code: [
    { key: 'appName', label: 'Application name' },
    { key: 'code', label: '6-digit verification code' },
  ],
  ticket_created_requester: [
    { key: 'appName', label: 'Application name' },
    { key: 'requesterName', label: 'Requester name' },
    { key: 'ticket.id', label: 'Ticket ID' },
    { key: 'ticket.ticket_number', label: 'Ticket number' },
    { key: 'ticket.title', label: 'Ticket title' },
    { key: 'ticket.status', label: 'Status' },
    { key: 'ticket.priority', label: 'Priority' },
    { key: 'ticket.category', label: 'Category' },
    { key: 'ticketUrl', label: 'Ticket detail URL' },
  ],
  ticket_assigned: [
    { key: 'appName', label: 'Application name' },
    { key: 'assigneeName', label: 'Assignee name' },
    { key: 'ticket.ticket_number', label: 'Ticket number' },
    { key: 'ticket.title', label: 'Ticket title' },
    { key: 'ticket.priority', label: 'Priority' },
    { key: 'ticket.status', label: 'Status' },
    { key: 'ticket.requester', label: 'Requester name' },
    { key: 'ticket.requester_email', label: 'Requester email' },
    { key: 'ticketUrl', label: 'Ticket detail URL' },
  ],
  ticket_updated: [
    { key: 'appName', label: 'Application name' },
    { key: 'requesterName', label: 'Recipient name' },
    { key: 'ticket.ticket_number', label: 'Ticket number' },
    { key: 'ticket.title', label: 'Ticket title' },
    { key: 'ticket.status', label: 'Status' },
    { key: 'ticket.priority', label: 'Priority' },
    { key: 'changesSummary', label: 'Change summary (plain text)' },
    { key: 'ticketUrl', label: 'Ticket detail URL' },
  ],
  ticket_comment: [
    { key: 'appName', label: 'Application name' },
    { key: 'recipientName', label: 'Recipient name' },
    { key: 'isInternalNote', label: 'Internal note (true/false)' },
    { key: 'ticket.ticket_number', label: 'Ticket number' },
    { key: 'ticket.title', label: 'Ticket title' },
    { key: 'comment.author', label: 'Comment author' },
    { key: 'comment.author_email', label: 'Comment author email' },
    { key: 'comment.message', label: 'Comment body' },
    { key: 'ticketUrl', label: 'Ticket detail URL' },
  ],
  pbx_offline_daily: [
    { key: 'appName', label: 'Application name' },
    { key: 'generatedAt', label: 'Generated timestamp' },
    { key: 'domainsScanned', label: 'Domains scanned' },
    { key: 'domainsFailed', label: 'Domain scan errors' },
    { key: 'rowCount', label: 'Matching offline count' },
    { key: 'minDowntime', label: 'Min downtime filter' },
    { key: 'scanTime', label: 'Scan duration (e.g. 1s)' },
    { key: 'tableHtml', label: 'Result table HTML (use {{{tableHtml}}})' },
    { key: 'reportUrl', label: 'Open-in-Insight URL' },
  ],
  pbx_domain_export: [
    { key: 'appName', label: 'Application name' },
    { key: 'domain', label: 'Domain name' },
    { key: 'reportType', label: 'Export report type' },
    { key: 'status', label: 'Export status' },
    { key: 'generatedAt', label: 'Generated timestamp' },
    { key: 'sourceLabel', label: 'Source label (Daily schedule / Immediate)' },
    { key: 'introLine', label: 'Intro line (Scheduled/Immediate Report)' },
    { key: 'downloadUrl', label: 'Download URL (optional)' },
    { key: 'reportsUrl', label: 'Portal Domain Export URL' },
    { key: 'ctaUrl', label: 'CTA URL (download or portal)' },
    { key: 'ctaLabel', label: 'CTA button label' },
  ],
};

const PBX_TABULAR_VARIABLES = [
  { key: 'appName', label: 'Application name' },
  { key: 'title', label: 'Report title' },
  { key: 'intro', label: 'Intro line (Scheduled … Report)' },
  { key: 'generatedAt', label: 'Generated timestamp' },
  { key: 'domain', label: 'Domain (optional)' },
  { key: 'domainsScanned', label: 'Domains scanned (optional)' },
  { key: 'rowCount', label: 'Matching row count' },
  { key: 'extraSummaryHtml', label: 'Extra summary rows HTML (use {{{extraSummaryHtml}}})' },
  { key: 'tableHtml', label: 'Result table HTML (use {{{tableHtml}}})' },
  { key: 'reportUrl', label: 'Open-in-Insight URL' },
  { key: 'ctaLabel', label: 'CTA button label' },
];

Object.assign(EMAIL_TEMPLATE_VARIABLES, {
  pbx_e911_empty_cid: PBX_TABULAR_VARIABLES,
  pbx_sip_alg_same_ip: PBX_TABULAR_VARIABLES,
  pbx_vulnerability_dial: PBX_TABULAR_VARIABLES,
});

const PBX_TABULAR_EDITABLE_DEFAULT = {
  use_layout: true,
  layout_title: '{{title}}',
  layout_preheader: '{{rowCount}} row(s)',
  layout_cta_url: '{{reportUrl}}',
  layout_cta_label: '{{ctaLabel}}',
  html_body: `<p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5;">
  {{intro}}
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:10px 14px;background:#f8fafc;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Summary</td></tr>
  <tr><td style="padding:14px;">
    <p style="margin:0 0 8px;"><strong>Generated:</strong> {{generatedAt}}</p>
    <p style="margin:0 0 8px;"><strong>Domain:</strong> {{domain}}</p>
    <p style="margin:0 0 8px;"><strong>Domains scanned:</strong> {{domainsScanned}}</p>
    <p style="margin:0 0 8px;"><strong>Matching rows:</strong> {{rowCount}}</p>
    {{{extraSummaryHtml}}}
  </td></tr>
</table>
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;">Report result</p>
<div style="overflow-x:auto;border:1px solid #e2e8f0;border-radius:8px;">{{{tableHtml}}}</div>`,
  text: `{{title}}
Generated: {{generatedAt}}
Domain: {{domain}}
Rows: {{rowCount}}
{{reportUrl}}`,
};

export const EMAIL_EDITABLE_DEFAULTS = {
  portal_invite: {
    subject: 'Invite — {{appName}}',
    use_layout: true,
    layout_title: 'Portal invite',
    layout_preheader: '{{appName}} invite',
    layout_cta_url: '{{inviteUrl}}',
    layout_cta_label: 'Set password',
    html_body: `<p style="margin:0 0 16px;">Portal invite for <strong>{{appName}}</strong>.</p>
<p style="margin:0 0 8px;"><strong>Email:</strong> {{inviteeEmail}}</p>
<p style="margin:0 0 8px;"><strong>From:</strong> {{invitedByName}}</p>
<p style="margin:0 0 8px;"><strong>Role:</strong> {{role}}</p>`,
    text: `{{appName}} portal invite.
From: {{invitedByName}}
Role: {{role}}
{{inviteUrl}}`,
  },

  portal_welcome: {
    subject: '{{appName}} account',
    use_layout: true,
    layout_title: 'Account ready',
    layout_preheader: 'Sign in — {{appName}}',
    layout_cta_url: '{{loginUrl}}',
    layout_cta_label: 'Sign in',
    html_body: `<p style="margin:0 0 16px;">{{fullName}}, your portal account is ready.</p>
<p style="margin:0 0 8px;"><strong>Email:</strong> {{email}}</p>
<p style="margin:0 0 8px;"><strong>Created by:</strong> {{createdByName}}</p>`,
    text: `{{fullName}},
Portal account on {{appName}}.
Created by: {{createdByName}}
Sign in: {{loginUrl}}
Email: {{email}}`,
  },

  mfa_email_code: {
    subject: '{{appName}} sign-in code',
    use_layout: true,
    layout_title: 'Verification code',
    layout_preheader: 'Code: {{code}}',
    layout_cta_url: '',
    layout_cta_label: '',
    html_body: `<p style="margin:0 0 16px;">Use this code to complete sign-in to <strong>{{appName}}</strong>:</p>
<p style="margin:0 0 16px;font-size:28px;font-weight:700;letter-spacing:4px;">{{code}}</p>
<p style="margin:0;color:#64748b;font-size:14px;">This code expires in 10 minutes. If you did not request it, ignore this email.</p>`,
    text: `Your {{appName}} verification code is: {{code}}
This code expires in 10 minutes.
If you did not request this code, you can ignore this email.`,
  },

  ticket_created_requester: {
    subject: 'Ticket #{{ticket.ticket_number}}: {{ticket.title}}',
    use_layout: true,
    layout_title: 'Ticket opened',
    layout_preheader: '#{{ticket.ticket_number}} — {{ticket.title}}',
    layout_cta_url: '{{ticketUrl}}',
    layout_cta_label: 'View ticket',
    html_body: `<p style="margin:0 0 16px;">Ticket logged.</p>
<p style="margin:0 0 8px;"><strong>Ticket:</strong> #{{ticket.ticket_number}}</p>
<p style="margin:0 0 8px;"><strong>Subject:</strong> {{ticket.title}}</p>
<p style="margin:0 0 8px;"><strong>Status:</strong> {{ticket.status}}</p>
<p style="margin:0 0 8px;"><strong>Priority:</strong> {{ticket.priority}}</p>
<p style="margin:0 0 8px;"><strong>Category:</strong> {{ticket.category}}</p>`,
    text: `{{requesterName}},
Ticket #{{ticket.ticket_number}} — {{ticket.title}}
Status: {{ticket.status}}
Priority: {{ticket.priority}}
{{ticketUrl}}`,
  },

  ticket_assigned: {
    subject: 'Assigned #{{ticket.ticket_number}}: {{ticket.title}}',
    use_layout: true,
    layout_title: 'Ticket assigned',
    layout_preheader: '#{{ticket.ticket_number}} — {{ticket.title}}',
    layout_cta_url: '{{ticketUrl}}',
    layout_cta_label: 'Open ticket',
    html_body: `<p style="margin:0 0 16px;">Assigned to you.</p>
<p style="margin:0 0 8px;"><strong>Ticket:</strong> #{{ticket.ticket_number}}</p>
<p style="margin:0 0 8px;"><strong>Subject:</strong> {{ticket.title}}</p>
<p style="margin:0 0 8px;"><strong>Priority:</strong> {{ticket.priority}}</p>
<p style="margin:0 0 8px;"><strong>Status:</strong> {{ticket.status}}</p>
<p style="margin:0 0 8px;"><strong>Requester:</strong> {{ticket.requester}}</p>`,
    text: `{{assigneeName}},
#{{ticket.ticket_number}} — {{ticket.title}}
Priority: {{ticket.priority}}
{{ticketUrl}}`,
  },

  ticket_updated: {
    subject: 'Updated #{{ticket.ticket_number}}: {{ticket.title}}',
    use_layout: true,
    layout_title: 'Ticket updated',
    layout_preheader: '#{{ticket.ticket_number}} — {{ticket.title}}',
    layout_cta_url: '{{ticketUrl}}',
    layout_cta_label: 'View ticket',
    html_body: `<p style="margin:0 0 16px;">Ticket updated.</p>
<p style="margin:0 0 8px;"><strong>Ticket:</strong> #{{ticket.ticket_number}}</p>
<p style="margin:0 0 8px;"><strong>Subject:</strong> {{ticket.title}}</p>
<p style="margin:0 0 8px;"><strong>Status:</strong> {{ticket.status}}</p>
<p style="margin:0 0 8px;"><strong>Priority:</strong> {{ticket.priority}}</p>
<p style="margin:16px 0 0;white-space:pre-line;">{{changesSummary}}</p>`,
    text: `{{requesterName}},
#{{ticket.ticket_number}} updated.
{{changesSummary}}
{{ticketUrl}}`,
  },

  ticket_comment: {
    subject: 'Reply #{{ticket.ticket_number}}: {{ticket.title}}',
    use_layout: true,
    layout_title: 'New reply',
    layout_preheader: '#{{ticket.ticket_number}} — {{ticket.title}}',
    layout_cta_url: '{{ticketUrl}}',
    layout_cta_label: 'View ticket',
    html_body: `<p style="margin:0 0 16px;">New reply on your ticket.</p>
<p style="margin:0 0 8px;"><strong>Ticket:</strong> #{{ticket.ticket_number}}</p>
<p style="margin:0 0 8px;"><strong>Subject:</strong> {{ticket.title}}</p>
<p style="margin:0 0 8px;"><strong>From:</strong> {{comment.author}}</p>
<div style="margin:16px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;">{{comment.message}}</div>`,
    text: `{{recipientName}},
New reply.
#{{ticket.ticket_number}} — {{ticket.title}}
{{comment.author}}:
{{comment.message}}
{{ticketUrl}}`,
  },

  pbx_offline_daily: {
    subject: 'Offline Endpoints',
    use_layout: true,
    layout_title: 'Offline Endpoint report',
    layout_preheader: '{{rowCount}} offline endpoints',
    layout_cta_url: '{{reportUrl}}',
    layout_cta_label: 'Open in Insight',
    html_body: `<p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5;">
  Scheduled Offline Endpoint Report
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:10px 14px;background:#f8fafc;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Summary</td></tr>
  <tr><td style="padding:14px;">
    <p style="margin:0 0 8px;"><strong>Generated:</strong> {{generatedAt}}</p>
    <p style="margin:0 0 8px;"><strong>Domains scanned:</strong> {{domainsScanned}}</p>
    <p style="margin:0 0 8px;"><strong>Domain scan errors:</strong> {{domainsFailed}}</p>
    <p style="margin:0 0 8px;"><strong>Matching offline:</strong> {{rowCount}}</p>
    <p style="margin:0 0 8px;"><strong>Min downtime:</strong> {{minDowntime}}</p>
    <p style="margin:0 0 8px;"><strong>Scan time:</strong> {{scanTime}}</p>
  </td></tr>
</table>
<p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#0f172a;">Report result</p>
<div style="overflow-x:auto;border:1px solid #e2e8f0;border-radius:8px;">{{{tableHtml}}}</div>`,
    text: `Offline Endpoint report — {{appName}}
Generated: {{generatedAt}}
Domains scanned: {{domainsScanned}}
Matching offline: {{rowCount}}
{{reportUrl}}`,
  },

  pbx_domain_export: {
    subject: 'Domain Export — {{domain}}',
    use_layout: true,
    layout_title: 'Domain Export ready',
    layout_preheader: 'Domain Export — {{domain}}',
    layout_cta_url: '{{ctaUrl}}',
    layout_cta_label: '{{ctaLabel}}',
    html_body: `<p style="margin:0 0 16px;color:#475569;font-size:14px;line-height:1.5;">
  {{introLine}}
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 12px;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
  <tr><td style="padding:10px 14px;background:#f8fafc;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:.04em;">Report result</td></tr>
  <tr><td style="padding:14px;">
    <p style="margin:0 0 8px;"><strong>Domain:</strong> {{domain}}</p>
    <p style="margin:0 0 8px;"><strong>Export type:</strong> {{reportType}}</p>
    <p style="margin:0 0 8px;"><strong>Status:</strong> {{status}}</p>
    <p style="margin:0 0 8px;"><strong>Generated:</strong> {{generatedAt}}</p>
    <p style="margin:0 0 8px;"><strong>Source:</strong> {{sourceLabel}}</p>
  </td></tr>
</table>`,
    text: `Domain Export for {{domain}}
Type: {{reportType}}
Status: {{status}}
Generated: {{generatedAt}}
Source: {{sourceLabel}}
{{ctaUrl}}`,
  },

  pbx_e911_empty_cid: {
    ...PBX_TABULAR_EDITABLE_DEFAULT,
    subject: 'E911 empty / zero CID',
  },

  pbx_sip_alg_same_ip: {
    ...PBX_TABULAR_EDITABLE_DEFAULT,
    subject: 'SIP ALG — same internal/external IP',
  },

  pbx_vulnerability_dial: {
    ...PBX_TABULAR_EDITABLE_DEFAULT,
    subject: 'Vulnerability — dial permissions',
  },
};

export function getEditableDefault(templateId) {
  return EMAIL_EDITABLE_DEFAULTS[templateId] || null;
}

export function listEditableTemplateIds() {
  return Object.keys(EMAIL_EDITABLE_DEFAULTS);
}
