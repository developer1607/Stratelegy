export {
  TICKET_STATUSES,
  TICKET_PRIORITIES,
  TICKET_CATEGORIES,
  TICKET_DEPARTMENTS,
  TICKET_SOURCES,
  CATEGORY_DEFAULT_DEPARTMENT,
  getSuggestedDepartmentForCategory,
} from '@shared/ticketConstants';

export function buildAssigneeSelectOptions(assignees, currentAssignee = '') {
  const options = (assignees || []).map((a) => ({
    value: a.email,
    label: a.team ? `${a.name} (${a.team})` : `${a.name} (${a.email})`,
  }));

  if (currentAssignee && !options.some((o) => o.value === currentAssignee)) {
    options.unshift({ value: currentAssignee, label: `${currentAssignee} (current assignee)` });
  }

  return options;
}

export const STATUS_COLORS = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  waiting_on_end_user: 'bg-orange-100 text-orange-700',
  waiting_on_vendor: 'bg-purple-100 text-purple-700',
  resolved: 'bg-green-100 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  pending: 'bg-orange-100 text-orange-700',
};

export const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export function formatTicketLabel(value) {
  if (!value) return '—';
  return String(value).replace(/_/g, ' ');
}

export function getTicketAssignee(ticket) {
  return ticket?.assigned_to || ticket?.assignee || '';
}

export function normalizeTicketPayload(data) {
  const payload = { ...data };
  if (payload.assignee !== undefined && payload.assigned_to === undefined) {
    payload.assigned_to = payload.assignee;
    delete payload.assignee;
  }
  if (payload.assigned_to === '') payload.assigned_to = null;
  return payload;
}

export const DEFAULT_TICKET_FORM = {
  title: '',
  description: '',
  status: 'open',
  priority: 'medium',
  category: '',
  department: '',
  source: 'web',
  assigned_to: '',
  requester: '',
  requester_email: '',
};
