import { config } from '../../../config.js';
import { escapeHtml, renderLayout, infoRow } from './base.js';

function ticketUrl(ticketId) {
  return `${config.appBaseUrl}/SupportTicketDetail?id=${encodeURIComponent(ticketId)}`;
}

function loginUrl() {
  return `${config.appBaseUrl}/login`;
}

export const EMAIL_TEMPLATES = {
  portal_invite: {
    subject: ({ appName }) => `Invite — ${appName}`,
    render: ({ inviteeEmail, inviteUrl, invitedByName, role }) => ({
      subject: `Invite — ${config.appName}`,
      text: [
        `${config.appName} portal invite.`,
        invitedByName ? `From: ${invitedByName}` : '',
        `Role: ${role || 'user'}`,
        inviteUrl,
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Portal invite',
        preheader: `${config.appName} invite`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Portal invite for <strong>${escapeHtml(config.appName)}</strong>.</p>
          ${infoRow('Email', inviteeEmail)}
          ${infoRow('From', invitedByName)}
          ${infoRow('Role', role || 'user')}
        `,
        ctaUrl: inviteUrl,
        ctaLabel: 'Set password',
      }),
    }),
  },

  portal_welcome: {
    subject: () => `${config.appName} account`,
    render: ({ fullName, email, loginUrl: url, createdByName }) => ({
      subject: `${config.appName} account`,
      text: [
        `${fullName || email},`,
        `Portal account on ${config.appName}.`,
        createdByName ? `Created by: ${createdByName}` : '',
        `Sign in: ${url || loginUrl()}`,
        `Email: ${email}`,
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Account ready',
        preheader: `Sign in — ${config.appName}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">${escapeHtml(fullName || email)}, your portal account is ready.</p>
          ${infoRow('Email', email)}
          ${infoRow('Created by', createdByName)}
        `,
        ctaUrl: url || loginUrl(),
        ctaLabel: 'Sign in',
      }),
    }),
  },

  ticket_created_requester: {
    subject: ({ ticketNumber, title }) => `Ticket #${ticketNumber || 'new'}: ${title}`,
    render: ({ ticket, requesterName }) => ({
      subject: `Ticket #${ticket.ticket_number || 'new'}: ${ticket.title}`,
      text: [
        requesterName ? `${requesterName},` : '',
        `Ticket #${ticket.ticket_number || 'pending'} — ${ticket.title}`,
        `Status: ${ticket.status}`,
        `Priority: ${ticket.priority}`,
        ticketUrl(ticket.id),
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Ticket opened',
        preheader: `#${ticket.ticket_number || 'new'} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Ticket logged.</p>
          ${infoRow('Ticket', `#${ticket.ticket_number || 'pending'}`)}
          ${infoRow('Subject', ticket.title)}
          ${infoRow('Status', ticket.status)}
          ${infoRow('Priority', ticket.priority)}
          ${infoRow('Category', ticket.category)}
        `,
        ctaUrl: ticketUrl(ticket.id),
        ctaLabel: 'View ticket',
      }),
    }),
  },

  ticket_assigned: {
    subject: ({ ticketNumber, title }) => `Assigned #${ticketNumber}: ${title}`,
    render: ({ ticket, assigneeName }) => ({
      subject: `Assigned #${ticket.ticket_number}: ${ticket.title}`,
      text: [
        `${assigneeName || ticket.assigned_to},`,
        `#${ticket.ticket_number} — ${ticket.title}`,
        `Priority: ${ticket.priority}`,
        ticketUrl(ticket.id),
      ].join('\n'),
      html: renderLayout({
        title: 'Ticket assigned',
        preheader: `#${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Assigned to you.</p>
          ${infoRow('Ticket', `#${ticket.ticket_number}`)}
          ${infoRow('Subject', ticket.title)}
          ${infoRow('Priority', ticket.priority)}
          ${infoRow('Status', ticket.status)}
          ${infoRow('Requester', ticket.requester || ticket.requester_email)}
        `,
        ctaUrl: ticketUrl(ticket.id),
        ctaLabel: 'Open ticket',
      }),
    }),
  },

  ticket_updated: {
    subject: ({ ticketNumber, title }) => `Updated #${ticketNumber}: ${title}`,
    render: ({ ticket, requesterName, changesSummary }) => ({
      subject: `Updated #${ticket.ticket_number}: ${ticket.title}`,
      text: [
        requesterName ? `${requesterName},` : '',
        `#${ticket.ticket_number} updated.`,
        changesSummary,
        ticketUrl(ticket.id),
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Ticket updated',
        preheader: `#${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Ticket updated.</p>
          ${infoRow('Ticket', `#${ticket.ticket_number}`)}
          ${infoRow('Subject', ticket.title)}
          ${infoRow('Status', ticket.status)}
          ${infoRow('Priority', ticket.priority)}
          ${changesSummary ? `<p style="margin:16px 0 0;white-space:pre-line;">${escapeHtml(changesSummary)}</p>` : ''}
        `,
        ctaUrl: ticketUrl(ticket.id),
        ctaLabel: 'View ticket',
      }),
    }),
  },

  ticket_comment: {
    subject: ({ ticketNumber, title }) => `Reply #${ticketNumber}: ${title}`,
    render: ({ ticket, comment, recipientName, isInternalNote }) => ({
      subject: `Reply #${ticket.ticket_number}: ${ticket.title}`,
      text: [
        recipientName ? `${recipientName},` : '',
        isInternalNote ? 'Internal note.' : 'New reply.',
        `#${ticket.ticket_number} — ${ticket.title}`,
        `${comment.author || comment.author_email || 'Support'}:`,
        comment.message,
        ticketUrl(ticket.id),
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: isInternalNote ? 'Internal note' : 'New reply',
        preheader: `#${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">${isInternalNote ? 'Internal note.' : 'New reply.'}</p>
          ${infoRow('Ticket', `#${ticket.ticket_number}`)}
          ${infoRow('Subject', ticket.title)}
          ${infoRow('From', comment.author || comment.author_email || 'Support')}
          <div style="margin:16px 0;padding:16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;white-space:pre-wrap;">${escapeHtml(comment.message)}</div>
        `,
        ctaUrl: ticketUrl(ticket.id),
        ctaLabel: 'View ticket',
      }),
    }),
  },
};

export function renderEmailTemplate(templateId, data) {
  const template = EMAIL_TEMPLATES[templateId];
  if (!template) throw new Error(`Unknown email template: ${templateId}`);
  return template.render(data);
}
