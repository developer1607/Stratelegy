import { parseISO, isValid, format, subMonths, startOfMonth } from 'date-fns';

export const LEAD_STATUSES = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' },
];

export const ACCOUNT_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'prospect', label: 'Prospect' },
];

export function activityMatchesAccount(activity, account) {
  if (!activity || !account) return false;
  if (activity.related_to_id && activity.related_to_id === account.id) return true;
  return (
    activity.related_to_type === 'Account' && activity.related_to_name === account.name
  );
}

export function activityMatchesOpportunity(activity, opportunity) {
  if (!activity || !opportunity) return false;
  if (activity.related_to_id && activity.related_to_id === opportunity.id) return true;
  return (
    activity.related_to_type === 'Opportunity' &&
    activity.related_to_name === opportunity.name
  );
}

export function activityMatchesContact(activity, contact) {
  if (!activity || !contact) return false;
  if (activity.related_to_id && activity.related_to_id === contact.id) return true;
  return (
    activity.related_to_type === 'Contact' && activity.related_to_name === contact.name
  );
}

/** Format ISO/datetime string for datetime-local input */
export function toDatetimeLocalValue(value) {
  if (!value) return '';
  const normalized = String(value).replace(' ', 'T');
  const d = parseISO(normalized);
  if (!isValid(d)) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateInputValue(value) {
  if (!value) return '';
  const normalized = String(value).replace(' ', 'T');
  const d = parseISO(normalized);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

export function safeParseDate(value) {
  if (!value) return null;
  const d = parseISO(String(value).replace(' ', 'T'));
  return isValid(d) ? d : null;
}

export function calendarEventToForm(event) {
  if (!event) return null;
  return {
    title: event.title || '',
    description: event.description || '',
    event_type: event.event_type || 'meeting',
    start_date: toDatetimeLocalValue(event.start_date),
    end_date: toDatetimeLocalValue(event.end_date),
    location: event.location || '',
    related_to_type: event.related_to_type || '',
    related_to_name: event.related_to_name || '',
    status: event.status || 'scheduled',
  };
}

export function calendarFormToPayload(formData) {
  return {
    title: formData.title,
    description: formData.description || undefined,
    event_type: formData.event_type,
    start_date: formData.start_date || undefined,
    end_date: formData.end_date || undefined,
    location: formData.location || undefined,
    related_to_type: formData.related_to_type || undefined,
    related_to_name: formData.related_to_name || undefined,
    status: formData.status,
  };
}

/** Last N month labels ending at the current month */
export function recentMonthLabels(count = 6) {
  const now = new Date();
  return Array.from({ length: count }, (_, idx) => {
    const d = subMonths(startOfMonth(now), count - 1 - idx);
    return { key: format(d, 'yyyy-MM'), label: format(d, 'MMM') };
  });
}
