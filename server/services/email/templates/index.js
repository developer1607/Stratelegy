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
    subject: ({ appName }) => `You're invited to ${appName}`,
    render: ({ inviteeEmail, inviteUrl, invitedByName, role }) => ({
      subject: `You're invited to ${config.appName}`,
      text: [
        `You have been invited to join ${config.appName}.`,
        invitedByName ? `Invited by: ${invitedByName}` : '',
        `Role: ${role || 'user'}`,
        `Accept your invite: ${inviteUrl}`,
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Portal invitation',
        preheader: `Join ${config.appName} as a portal user`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello,</p>
          <p style="margin:0 0 16px;">You have been invited to create your portal account for <strong>${escapeHtml(config.appName)}</strong>.</p>
          ${infoRow('Email', inviteeEmail)}
          ${infoRow('Invited by', invitedByName)}
          ${infoRow('Role', role || 'user')}
          <p style="margin:16px 0 0;">Click below to set your password and sign in.</p>
        `,
        ctaUrl: inviteUrl,
        ctaLabel: 'Accept invitation',
      }),
    }),
  },

  portal_welcome: {
    subject: () => `Your ${config.appName} account is ready`,
    render: ({ fullName, email, loginUrl: url, createdByName }) => ({
      subject: `Your ${config.appName} account is ready`,
      text: [
        `Hello ${fullName || email},`,
        `An administrator created a portal account for you on ${config.appName}.`,
        createdByName ? `Created by: ${createdByName}` : '',
        `Sign in: ${url || loginUrl()}`,
        `Email: ${email}`,
        'Use the password provided by your administrator.',
      ]
        .filter(Boolean)
        .join('\n'),
      html: renderLayout({
        title: 'Your account is ready',
        preheader: `Sign in to ${config.appName}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello ${escapeHtml(fullName || email)},</p>
          <p style="margin:0 0 16px;">An administrator created a portal account for you.</p>
          ${infoRow('Email', email)}
          ${infoRow('Created by', createdByName)}
          <p style="margin:16px 0 0;">Use the password your administrator shared with you to sign in.</p>
        `,
        ctaUrl: url || loginUrl(),
        ctaLabel: 'Sign in',
      }),
    }),
  },

  ticket_created_requester: {
    subject: ({ ticketNumber, title }) =>
      `Ticket #${ticketNumber || 'new'} received: ${title}`,
    render: ({ ticket, requesterName }) => ({
      subject: `Ticket #${ticket.ticket_number || 'new'} received: ${ticket.title}`,
      text: [
        `Hello ${requesterName || 'there'},`,
        'We received your support request.',
        `Ticket: #${ticket.ticket_number || 'pending'} — ${ticket.title}`,
        `Status: ${ticket.status}`,
        `Priority: ${ticket.priority}`,
        `View ticket: ${ticketUrl(ticket.id)}`,
      ].join('\n'),
      html: renderLayout({
        title: 'Support request received',
        preheader: `Ticket #${ticket.ticket_number || 'new'} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello ${escapeHtml(requesterName || 'there')},</p>
          <p style="margin:0 0 16px;">We received your support request and our team will review it shortly.</p>
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
    subject: ({ ticketNumber, title }) =>
      `Ticket #${ticketNumber} assigned to you: ${title}`,
    render: ({ ticket, assigneeName }) => ({
      subject: `Ticket #${ticket.ticket_number} assigned: ${ticket.title}`,
      text: [
        `Hello ${assigneeName || ticket.assigned_to},`,
        `Ticket #${ticket.ticket_number} has been assigned to you.`,
        `Subject: ${ticket.title}`,
        `Priority: ${ticket.priority}`,
        `View ticket: ${ticketUrl(ticket.id)}`,
      ].join('\n'),
      html: renderLayout({
        title: 'New ticket assignment',
        preheader: `Ticket #${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello ${escapeHtml(assigneeName || ticket.assigned_to)},</p>
          <p style="margin:0 0 16px;">A support ticket has been assigned to you.</p>
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
    subject: ({ ticketNumber, title }) =>
      `Ticket #${ticketNumber} updated: ${title}`,
    render: ({ ticket, requesterName, changesSummary }) => ({
      subject: `Ticket #${ticket.ticket_number} updated: ${ticket.title}`,
      text: [
        `Hello ${requesterName || 'there'},`,
        `Your ticket #${ticket.ticket_number} was updated.`,
        changesSummary,
        `View ticket: ${ticketUrl(ticket.id)}`,
      ].join('\n'),
      html: renderLayout({
        title: 'Ticket update',
        preheader: `Ticket #${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello ${escapeHtml(requesterName || 'there')},</p>
          <p style="margin:0 0 16px;">Your support ticket has been updated.</p>
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
    subject: ({ ticketNumber, title }) =>
      `New reply on ticket #${ticketNumber}: ${title}`,
    render: ({ ticket, comment, recipientName, isInternalNote }) => ({
      subject: `New reply on ticket #${ticket.ticket_number}: ${ticket.title}`,
      text: [
        `Hello ${recipientName || 'there'},`,
        isInternalNote ? 'An internal note was added to a ticket you follow.' : 'There is a new reply on your support ticket.',
        `Ticket: #${ticket.ticket_number} — ${ticket.title}`,
        `From: ${comment.author || comment.author_email || 'Support team'}`,
        comment.message,
        `View ticket: ${ticketUrl(ticket.id)}`,
      ].join('\n'),
      html: renderLayout({
        title: isInternalNote ? 'Internal ticket note' : 'New ticket reply',
        preheader: `Ticket #${ticket.ticket_number} — ${ticket.title}`,
        bodyHtml: `
          <p style="margin:0 0 16px;">Hello ${escapeHtml(recipientName || 'there')},</p>
          <p style="margin:0 0 16px;">${isInternalNote ? 'An internal note was added to a ticket assigned to you.' : 'There is a new reply on your support ticket.'}</p>
          ${infoRow('Ticket', `#${ticket.ticket_number}`)}
          ${infoRow('Subject', ticket.title)}
          ${infoRow('From', comment.author || comment.author_email || 'Support team')}
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
  if (!template) {
    throw new Error(`Unknown email template: ${templateId}`);
  }
  return template.render(data);
}
