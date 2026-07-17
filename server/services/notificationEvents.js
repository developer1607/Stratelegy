import { getUserByEmail } from "./users.js";
import { createNotification } from "./notifications.js";
import { isValidEmail } from "../validators/ticket.js";

function ticketDetailPath(ticketId) {
  return `/SupportTicketDetail?id=${ticketId}`;
}

function ticketLabel(ticket) {
  return ticket.ticket_number ? `#${ticket.ticket_number}` : "Ticket";
}

function shouldSkipRecipient(email, actorEmail) {
  if (!isValidEmail(email)) return true;
  const normalized = email.toLowerCase();
  if (actorEmail && normalized === actorEmail.toLowerCase()) return true;
  return false;
}

async function notifyUserByEmail(email, payload, { actorEmail } = {}) {
  if (shouldSkipRecipient(email, actorEmail)) return;

  const user = await getUserByEmail(email);
  if (!user?.id || !user.is_active) return;

  try {
    await createNotification({
      userId: user.id,
      type: payload.type,
      title: payload.title,
      body: payload.body,
      linkPath: payload.linkPath,
      entityType: payload.entityType,
      entityId: payload.entityId,
    });
  } catch (e) {
    console.error("[notifications] create failed:", e.message);
  }
}

export async function onTicketCreatedNotification(ticket, { actorEmail } = {}) {
  if (!ticket?.id || !isValidEmail(ticket.assigned_to)) return;

  await notifyUserByEmail(
    ticket.assigned_to,
    {
      type: "ticket_assigned",
      title: `${ticketLabel(ticket)} assigned to you`,
      body: ticket.title || "New support ticket",
      linkPath: ticketDetailPath(ticket.id),
      entityType: "ticket",
      entityId: ticket.id,
    },
    { actorEmail },
  );
}

export async function onTicketUpdatedNotification(
  ticket,
  oldTicket,
  { actorEmail } = {},
) {
  if (!ticket?.id || !oldTicket) return;

  const label = ticketLabel(ticket);
  const linkPath = ticketDetailPath(ticket.id);
  const base = { entityType: "ticket", entityId: ticket.id, linkPath };

  if (
    ticket.assigned_to !== oldTicket.assigned_to &&
    isValidEmail(ticket.assigned_to)
  ) {
    await notifyUserByEmail(
      ticket.assigned_to,
      {
        ...base,
        type: "ticket_assigned",
        title: `${label} assigned to you`,
        body: ticket.title || "Support ticket",
      },
      { actorEmail },
    );
  }

  if (ticket.status !== oldTicket.status && isValidEmail(ticket.assigned_to)) {
    await notifyUserByEmail(
      ticket.assigned_to,
      {
        ...base,
        type: "ticket_status",
        title: `${label} status updated`,
        body: `Status changed to ${String(ticket.status).replace(/_/g, " ")}`,
      },
      { actorEmail },
    );
  }

  if (
    ticket.priority !== oldTicket.priority &&
    isValidEmail(ticket.assigned_to)
  ) {
    await notifyUserByEmail(
      ticket.assigned_to,
      {
        ...base,
        type: "ticket_priority",
        title: `${label} priority updated`,
        body: `Priority set to ${ticket.priority}`,
      },
      { actorEmail },
    );
  }
}

export async function onTicketCommentNotification(
  ticket,
  comment,
  { actorEmail } = {},
) {
  if (!ticket?.id || !comment || comment.is_internal) return;

  const label = ticketLabel(ticket);
  const linkPath = ticketDetailPath(ticket.id);
  const authorName = comment.author || comment.author_email || "Someone";
  const bodyPreview =
    comment.message?.length > 120
      ? `${comment.message.slice(0, 117)}…`
      : comment.message || "";

  const payload = {
    type: "ticket_comment",
    title: `New comment on ${label}`,
    body: `${authorName}: ${bodyPreview}`,
    linkPath,
    entityType: "ticket",
    entityId: ticket.id,
  };

  const recipients = new Set();
  if (isValidEmail(ticket.assigned_to))
    recipients.add(ticket.assigned_to.toLowerCase());
  if (isValidEmail(ticket.requester_email))
    recipients.add(ticket.requester_email.toLowerCase());

  for (const email of recipients) {
    await notifyUserByEmail(email, payload, { actorEmail });
  }
}
