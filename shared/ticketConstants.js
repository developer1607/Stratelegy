/** Ticket enums — single source for client UI and server validation. */

export const TICKET_STATUS_VALUES = [
  'open',
  'in_progress',
  'waiting_on_end_user',
  'waiting_on_vendor',
  'resolved',
  'closed',
  'pending',
];

export const TICKET_PRIORITY_VALUES = ['low', 'medium', 'high', 'urgent'];

export const TICKET_CATEGORY_VALUES = [
  'new_order_request',
  'port_request',
  'report_a_problem',
  'report_an_outage',
  'sales_inquiry',
];

export const TICKET_DEPARTMENT_VALUES = ['billing', 'sales', 'support', 'number_porting_team'];

export const TICKET_SOURCE_VALUES = ['phone', 'email', 'web', 'chat', 'other'];

export const TICKET_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting_on_end_user', label: 'Waiting on End-User' },
  { value: 'waiting_on_vendor', label: 'Waiting on Vendor' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

export const TICKET_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const TICKET_CATEGORIES = [
  { value: 'new_order_request', label: 'New Order Request' },
  { value: 'port_request', label: 'Port Request' },
  { value: 'report_a_problem', label: 'Report a Problem' },
  { value: 'report_an_outage', label: 'Report an Outage' },
  { value: 'sales_inquiry', label: 'Sales Inquiry' },
];

export const TICKET_DEPARTMENTS = [
  { value: 'billing', label: 'Billing' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
  { value: 'number_porting_team', label: 'Number Porting Team' },
];

export const TICKET_SOURCES = [
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
  { value: 'web', label: 'Web' },
  { value: 'chat', label: 'Chat' },
  { value: 'other', label: 'Other' },
];

export const CATEGORY_DEFAULT_DEPARTMENT = {
  port_request: 'number_porting_team',
  sales_inquiry: 'sales',
  new_order_request: 'sales',
  report_a_problem: 'support',
  report_an_outage: 'support',
};

export function getSuggestedDepartmentForCategory(category) {
  if (!category) return '';
  return CATEGORY_DEFAULT_DEPARTMENT[category] || '';
}
