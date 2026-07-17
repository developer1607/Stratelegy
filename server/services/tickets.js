import * as ticketStore from "./ticketStore.js";
import { sendTicketCreatedEmails } from "./email/notifications.js";
import { onTicketCreatedNotification } from "./notificationEvents.js";
import { assigneeMatchesTicket } from "../constants/ticketRouting.js";
import { listTicketAssignees } from "./ticketAssignees.js";

export async function assignTicketNumber(ticketId) {
  await ticketStore.getTicket(ticketId);
  const allTickets = await ticketStore.listTickets();
  const maxNumber = allTickets.reduce(
    (max, t) =>
      t.ticket_number && t.ticket_number > max ? t.ticket_number : max,
    0,
  );
  const nextNumber = Math.max(maxNumber + 1, 1200);
  await ticketStore.updateTicket(ticketId, { ticket_number: nextNumber });
  return { ticket_number: nextNumber };
}

export async function autoAssignTicket(ticketId) {
  const ticket = await ticketStore.getTicket(ticketId);
  if (ticket.assigned_to || ticket.assignee) {
    return {
      assigned_to: ticket.assigned_to || ticket.assignee,
      message: "Ticket already has an assignee",
    };
  }

  const assignees = await listTicketAssignees({
    department: ticket.department,
    category: ticket.category,
  });

  const pickAssignee = async (candidates) => {
    if (candidates.length === 0) return null;
    const openTickets = (await ticketStore.listTickets()).filter((t) =>
      ["open", "in_progress"].includes(t.status),
    );
    const workload = candidates.map((user) => ({
      user,
      count: openTickets.filter((t) => t.assigned_to === user.email).length,
    }));
    workload.sort((a, b) => a.count - b.count);
    return workload[0].user.email;
  };

  let matching = assignees;
  if (ticket.department || ticket.category) {
    matching = assignees.filter((user) =>
      assigneeMatchesTicket(user, {
        department: ticket.department,
        category: ticket.category,
      }),
    );
  }

  const assignee = await pickAssignee(
    matching.length > 0 ? matching : assignees,
  );

  if (assignee) {
    await ticketStore.updateTicket(ticketId, { assigned_to: assignee });
    return {
      assigned_to: assignee,
      message: `Ticket auto-assigned to ${assignee}`,
    };
  }

  return {
    assigned_to: null,
    message: "No suitable portal user found for auto-assignment",
  };
}

export async function onTicketCreated(ticket, { actorEmail } = {}) {
  try {
    await assignTicketNumber(ticket.id);
    await autoAssignTicket(ticket.id);
    const fresh = await ticketStore.getTicket(ticket.id);
    await sendTicketCreatedEmails(fresh);
    await onTicketCreatedNotification(fresh, { actorEmail });
  } catch (e) {
    console.error("[tickets] post-create hooks failed:", e);
  }
}

export async function createTicketFromEmail({ subject, body, fromEmail }) {
  const cleanBody = body
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const ticket = await ticketStore.createTicket({
    title: subject.substring(0, 200),
    description: `**From:** ${fromEmail}\n\n${cleanBody || body}`,
    category: "report_a_problem",
    priority: "medium",
    status: "open",
    source: "email",
    requester_email: fromEmail || null,
  });
  await onTicketCreated(ticket);
  return ticketStore.getTicket(ticket.id);
}
