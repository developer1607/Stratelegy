import { config } from '../../config.js';
import { sendTemplateEmail } from './mailer.js';

function isValidEmail(email) {
  return Boolean(email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
}

export async function sendPortalInviteEmail({ email, inviteUrl, invitedByName, role }) {
  return sendTemplateEmail({
    to: email,
    templateId: 'portal_invite',
    data: {
      inviteeEmail: email,
      inviteUrl,
      invitedByName,
      role,
    },
  });
}

export async function sendPortalWelcomeEmail({ email, fullName, createdByName }) {
  return sendTemplateEmail({
    to: email,
    templateId: 'portal_welcome',
    data: {
      email,
      fullName,
      createdByName,
      loginUrl: `${config.appBaseUrl}/login`,
    },
  });
}

export async function sendTicketCreatedEmails(ticket) {
  const results = [];

  if (isValidEmail(ticket.requester_email)) {
    results.push(
      await sendTemplateEmail({
        to: ticket.requester_email,
        templateId: 'ticket_created_requester',
        data: {
          ticket,
          requesterName: ticket.requester,
        },
      })
    );
  }

  if (isValidEmail(ticket.assigned_to)) {
    results.push(
      await sendTemplateEmail({
        to: ticket.assigned_to,
        templateId: 'ticket_assigned',
        data: { ticket },
      })
    );
  }

  return results;
}

export async function sendTicketAssignedEmail(ticket, assigneeName) {
  if (!isValidEmail(ticket.assigned_to)) return { sent: false, skipped: true };
  return sendTemplateEmail({
    to: ticket.assigned_to,
    templateId: 'ticket_assigned',
    data: { ticket, assigneeName },
  });
}

export async function sendTicketUpdatedEmail(ticket, oldTicket) {
  const changes = [];
  if (oldTicket.status !== ticket.status)
    changes.push(`Status: ${oldTicket.status} → ${ticket.status}`);
  if (oldTicket.priority !== ticket.priority)
    changes.push(`Priority: ${oldTicket.priority} → ${ticket.priority}`);
  if (oldTicket.assigned_to !== ticket.assigned_to) {
    changes.push(
      `Assignee: ${oldTicket.assigned_to || 'Unassigned'} → ${ticket.assigned_to || 'Unassigned'}`
    );
  }
  if (changes.length === 0) return { sent: false, skipped: true, reason: 'no_notifiable_changes' };

  const results = [];
  const changesSummary = changes.join('\n');

  if (isValidEmail(ticket.requester_email)) {
    results.push(
      await sendTemplateEmail({
        to: ticket.requester_email,
        templateId: 'ticket_updated',
        data: {
          ticket,
          requesterName: ticket.requester,
          changesSummary,
        },
      })
    );
  }

  if (
    isValidEmail(ticket.assigned_to) &&
    ticket.assigned_to !== ticket.requester_email &&
    oldTicket.assigned_to !== ticket.assigned_to
  ) {
    results.push(await sendTicketAssignedEmail(ticket));
  }

  return results;
}

export async function sendTicketCommentEmails(ticket, comment, { actorEmail } = {}) {
  const results = [];
  const recipients = new Set();

  if (
    !comment.is_internal &&
    isValidEmail(ticket.requester_email) &&
    ticket.requester_email !== actorEmail
  ) {
    recipients.add(ticket.requester_email);
  }

  if (isValidEmail(ticket.assigned_to) && ticket.assigned_to !== actorEmail) {
    recipients.add(ticket.assigned_to);
  }

  for (const to of recipients) {
    results.push(
      await sendTemplateEmail({
        to,
        templateId: 'ticket_comment',
        data: {
          ticket,
          comment,
          recipientName: to === ticket.requester_email ? ticket.requester : ticket.assigned_to,
          isInternalNote: Boolean(comment.is_internal),
        },
      })
    );
  }

  return results;
}
