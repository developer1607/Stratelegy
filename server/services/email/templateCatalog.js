import { config } from '../../config.js';
import { EMAIL_TEMPLATES } from './templates/index.js';
import { isEmailConfigured, sendRenderedEmail } from './mailer.js';
import {
  getTemplateContent,
  renderTemplateContent,
  saveTemplateOverride,
  resetTemplateOverride,
} from './templateOverrides.js';
import { getTemplateOverrideRow } from './templateOverrides.js';

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
    sample_data: sampleDataForTemplate(templateId),
  };
}

export async function previewEmailTemplate(templateId, contentOverride = null) {
  if (!EMAIL_TEMPLATES[templateId]) {
    const err = new Error('Unknown email template');
    err.status = 404;
    throw err;
  }
  const sample = sampleDataForTemplate(templateId);
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

  const sample = sampleDataForTemplate(templateId);
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

export function getEmailSystemStatus() {
  return {
    mail_enabled: isEmailConfigured(),
    smtp_host: config.mail.host || null,
    from_address: config.mail.from || null,
    app_name: config.appName,
    app_base_url: config.appBaseUrl,
  };
}
