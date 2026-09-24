import { config } from '../../config.js';
import { EMAIL_TEMPLATES } from './templates/index.js';
import { isEmailEnvConfigured, sendRenderedEmail, getEmailOperationalStatus } from './mailer.js';
import {
  getTemplateContent,
  renderTemplateContent,
  saveTemplateOverride,
  resetTemplateOverride,
} from './templateOverrides.js';
import { getTemplateOverrideRow } from './templateOverrides.js';
import { escapeHtml } from './templates/base.js';

/** Enrich sample/live data the same way customized report templates expect. */
function enrichPreviewData(data = {}) {
  const enriched = { ...data };
  if (data.elapsedMs != null && enriched.scanTime == null) {
    enriched.scanTime = `${Math.round(Number(data.elapsedMs) / 1000)}s`;
  }
  if (Array.isArray(data.extraRows) && enriched.extraSummaryHtml == null) {
    enriched.extraSummaryHtml = data.extraRows
      .map(([label, value]) => {
        if (value == null || value === '') return '';
        return `<p style="margin:0 0 8px;"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</p>`;
      })
      .join('');
  }
  if (enriched.introLine == null && data.scheduled != null) {
    enriched.introLine = data.scheduled
      ? 'Scheduled Domain Export Report'
      : 'Immediate Domain Export Report';
  }
  if (enriched.sourceLabel == null && data.scheduled != null) {
    enriched.sourceLabel = data.scheduled ? 'Daily schedule' : 'Immediate request';
  }
  if (enriched.ctaUrl == null) {
    enriched.ctaUrl = data.downloadUrl || data.reportsUrl || '';
  }
  if (!enriched.ctaLabel) {
    enriched.ctaLabel = data.downloadUrl
      ? 'Download export file'
      : data.ctaLabel || 'Open in Insight';
  }
  return enriched;
}

/** Metadata for admin Settings — previews use sample data below. */
export const EMAIL_TEMPLATE_CATALOG = [
  {
    id: 'portal_invite',
    name: 'Portal invite',
    category: 'Auth',
    description: 'Sent when an administrator invites a new portal user.',
    triggers: ['Admin → Portal Users → Invite'],
  },
  {
    id: 'portal_welcome',
    name: 'Portal welcome',
    category: 'Auth',
    description: 'Sent when an administrator creates a user account directly.',
    triggers: ['Admin → Portal Users → Add user'],
  },
  {
    id: 'mfa_email_code',
    name: 'Email MFA code',
    category: 'Auth',
    description: 'Six-digit verification code for optional email MFA at sign-in.',
    triggers: ['Login with MFA enabled', 'Profile → Enable email MFA'],
  },
  {
    id: 'ticket_created_requester',
    name: 'Ticket opened (requester)',
    category: 'Support',
    description: 'Confirmation to the ticket requester when a ticket is created.',
    triggers: ['New support ticket'],
  },
  {
    id: 'ticket_assigned',
    name: 'Ticket assigned',
    category: 'Support',
    description: 'Notifies the assignee when a ticket is assigned to them.',
    triggers: ['Ticket assignment'],
  },
  {
    id: 'ticket_updated',
    name: 'Ticket updated',
    category: 'Support',
    description: 'Notifies stakeholders when ticket fields change.',
    triggers: ['Ticket status / priority / assignment updates'],
  },
  {
    id: 'ticket_comment',
    name: 'Ticket reply',
    category: 'Support',
    description: 'New public reply or internal note on a ticket.',
    triggers: ['Ticket comment added'],
  },
  {
    id: 'pbx_offline_daily',
    name: 'Offline Endpoints report',
    category: 'PBX Reports',
    description: 'Daily Offline Endpoint scan email with matching extensions table.',
    triggers: ['Reports → Offline Endpoint schedule', 'Immediate Offline Endpoint'],
  },
  {
    id: 'pbx_domain_export',
    name: 'Domain Export ready',
    category: 'PBX Reports',
    description: 'Download link when a Domain Export file is ready.',
    triggers: ['Reports → Domain Export (immediate or scheduled)'],
  },
  {
    id: 'pbx_e911_empty_cid',
    name: 'E911 empty / zero CID report',
    category: 'PBX Reports',
    description: 'Users whose emergency caller ID is empty, wildcard, or all zeros.',
    triggers: ['Reports → E911 Review schedule', 'Immediate E911 empty CID'],
  },
  {
    id: 'pbx_sip_alg_same_ip',
    name: 'SIP ALG same-IP report',
    category: 'PBX Reports',
    description: 'Extensions where internal and external registration IPs match.',
    triggers: ['Reports → SIP ALG schedule', 'Immediate SIP ALG'],
  },
  {
    id: 'pbx_vulnerability_dial',
    name: 'Vulnerability dial-permissions report',
    category: 'PBX Reports',
    description: 'Dial permission values for each extension on a domain.',
    triggers: ['Reports → Vulnerability Check schedule', 'Immediate Vulnerability'],
  },
];

const SAMPLE_TICKET = {
  id: 'sample-ticket-id',
  ticket_number: 1042,
  title: 'VPN not connecting after password reset',
  status: 'open',
  priority: 'high',
  category: 'technical',
  department: 'it',
  assigned_to: 'Support Agent',
  requester: 'Jane Smith',
  requester_email: 'jane@example.com',
};

function sampleDataForTemplate(templateId) {
  const baseUrl = config.appBaseUrl;
  switch (templateId) {
    case 'portal_invite':
      return {
        inviteeEmail: 'newuser@example.com',
        inviteUrl: `${baseUrl}/login?invite_token=sample-token&email=newuser%40example.com`,
        invitedByName: 'Admin User',
        role: 'user',
      };
    case 'portal_welcome':
      return {
        fullName: 'Jane Smith',
        email: 'jane@example.com',
        loginUrl: `${baseUrl}/login`,
        createdByName: 'Admin User',
      };
    case 'mfa_email_code':
      return { code: '482916' };
    case 'ticket_created_requester':
      return { ticket: SAMPLE_TICKET, requesterName: 'Jane Smith' };
    case 'ticket_assigned':
      return { ticket: SAMPLE_TICKET, assigneeName: 'Support Agent' };
    case 'ticket_updated':
      return {
        ticket: { ...SAMPLE_TICKET, status: 'in_progress' },
        requesterName: 'Jane Smith',
        changesSummary: 'Status: open → in_progress\nPriority: medium → high',
      };
    case 'ticket_comment':
      return {
        ticket: SAMPLE_TICKET,
        comment: {
          author: 'Support Agent',
          author_email: 'support@example.com',
          message: 'We reset your VPN profile. Please try connecting again and let us know.',
        },
        recipientName: 'Jane Smith',
        isInternalNote: false,
      };
    case 'pbx_offline_daily':
      return {
        generatedAt: '2026-09-24 10:00:00 +0000',
        domainsScanned: 12,
        domainsFailed: 0,
        rowCount: 1,
        minDowntime: 'any',
        scanTime: '1s',
        elapsedMs: 1000,
        reportUrl: `${baseUrl}/PBXReports?tab=offline-endpoint`,
        tableHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr style="background:#f8fafc;"><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Domain</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Ext</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Name</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Downtime</th></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">EXAMPLE.DOMAIN</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">100</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">Sample User</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">2h</td></tr>
</table>`,
      };
    case 'pbx_domain_export':
      return {
        domain: 'EXAMPLE.DOMAIN',
        reportType: 'user_device',
        status: 'completed',
        generatedAt: '2026-09-24 10:00:00 +0000',
        scheduled: true,
        introLine: 'Scheduled Domain Export Report',
        sourceLabel: 'Daily schedule',
        downloadUrl: `${baseUrl}/PBXReports?tab=domain-export`,
        reportsUrl: `${baseUrl}/PBXReports?tab=domain-export`,
        ctaUrl: `${baseUrl}/PBXReports?tab=domain-export`,
        ctaLabel: 'Download export file',
      };
    case 'pbx_e911_empty_cid':
      return {
        title: 'E911 empty / zero CID',
        intro: 'Scheduled E911 empty / zero CID Report',
        generatedAt: '2026-09-24 10:00:00 +0000',
        domain: 'EXAMPLE.DOMAIN',
        domainsScanned: 1,
        rowCount: 2,
        ctaLabel: 'Open E911 Review',
        reportUrl: `${baseUrl}/PBXReports?tab=e911-review`,
        extraSummaryHtml: '',
        tableHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr style="background:#f8fafc;"><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Domain</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Ext</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Name</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">PBX 911 CID</th></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">EXAMPLE.DOMAIN</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">101</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">Sample User</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">(empty)</td></tr>
</table>`,
      };
    case 'pbx_sip_alg_same_ip':
      return {
        title: 'SIP ALG — same internal/external IP',
        intro: 'Scheduled SIP ALG Report',
        generatedAt: '2026-09-24 10:00:00 +0000',
        domain: 'EXAMPLE.DOMAIN',
        rowCount: 1,
        ctaLabel: 'Open SIP ALG',
        reportUrl: `${baseUrl}/PBXReports?tab=sip-alg`,
        extraSummaryHtml: '',
        tableHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr style="background:#f8fafc;"><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Domain</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Ext</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Internal IP</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">External IP</th></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">EXAMPLE.DOMAIN</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">102</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">10.0.0.5</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">10.0.0.5</td></tr>
</table>`,
      };
    case 'pbx_vulnerability_dial':
      return {
        title: 'Vulnerability — dial permissions',
        intro: 'Scheduled Vulnerability Report',
        generatedAt: '2026-09-24 10:00:00 +0000',
        domain: 'EXAMPLE.DOMAIN',
        rowCount: 3,
        ctaLabel: 'Open Vulnerability Check',
        reportUrl: `${baseUrl}/PBXReports?tab=vulnerability-check`,
        extraSummaryHtml: '',
        tableHtml: `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">
<tr style="background:#f8fafc;"><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Domain</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Ext</th><th style="text-align:left;padding:8px;border-bottom:1px solid #e2e8f0;">Dial permission</th></tr>
<tr><td style="padding:8px;border-bottom:1px solid #e2e8f0;">EXAMPLE.DOMAIN</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">103</td><td style="padding:8px;border-bottom:1px solid #e2e8f0;">National</td></tr>
</table>`,
      };
    default:
      return {};
  }
}

export function listEmailTemplatesAdmin() {
  const configuredIds = Object.keys(EMAIL_TEMPLATES);
  return EMAIL_TEMPLATE_CATALOG.filter((t) => configuredIds.includes(t.id)).map((meta) => ({
    ...meta,
    sampleAvailable: true,
    editable: true,
  }));
}

export async function getEmailTemplateForEdit(templateId) {
  if (!EMAIL_TEMPLATES[templateId]) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }
  const content = await getTemplateContent(templateId);
  return {
    id: templateId,
    content,
    sample_data: enrichPreviewData(sampleDataForTemplate(templateId)),
  };
}

export async function previewEmailTemplate(templateId, contentOverride = null) {
  if (!EMAIL_TEMPLATES[templateId]) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }
  const sample = enrichPreviewData(sampleDataForTemplate(templateId));
  let content;
  if (contentOverride) {
    const defaults = await getTemplateContent(templateId);
    content = { ...defaults, ...contentOverride };
  } else {
    content = await getTemplateContent(templateId);
  }
  const rendered = renderTemplateContent(content, sample);
  return {
    id: templateId,
    ...rendered,
    sample_data: sample,
    is_customized: content.is_customized,
  };
}

export async function listEmailTemplatesAdminWithStatus() {
  const templates = listEmailTemplatesAdmin();
  const rows = await Promise.all(
    templates.map(async (t) => {
      const row = await getTemplateOverrideRow(t.id);
      return { ...t, is_customized: Boolean(row) };
    })
  );
  return rows;
}

export async function sendTestTemplateEmail(templateId, { to, content } = {}) {
  if (!EMAIL_TEMPLATES[templateId]) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }

  const normalizedTo = String(to || '')
    .trim()
    .toLowerCase();
  if (!normalizedTo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedTo)) {
    const err = new Error('A valid recipient email is required');
    err.status = 400;
    throw err;
  }

  const sample = enrichPreviewData(sampleDataForTemplate(templateId));
  let mergedContent;
  if (content) {
    const base = await getTemplateContent(templateId);
    mergedContent = { ...base, ...content };
  } else {
    mergedContent = await getTemplateContent(templateId);
  }

  const rendered = renderTemplateContent(mergedContent, sample);
  const result = await sendRenderedEmail({
    to: normalizedTo,
    subject: `[TEST] ${rendered.subject}`,
    text: rendered.text,
    html: rendered.html,
    logLabel: `test:${templateId}`,
  });

  return { ...result, template_id: templateId, sample_data: sample };
}

export { saveTemplateOverride, resetTemplateOverride } from './templateOverrides.js';

export async function getEmailSystemStatus(options) {
  return getEmailOperationalStatus(options);
}
