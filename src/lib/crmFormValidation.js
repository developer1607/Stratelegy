import { LEAD_STATUSES } from '@/lib/crmHelpers';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+().-]{7,64}$/;
const URL_RE = /^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/.*)?$/i;

function trim(value) {
  return value == null ? '' : String(value).trim();
}

function isEmpty(value) {
  return trim(value) === '';
}

function collect(errors, field, message) {
  if (message) errors[field] = message;
}

function requiredField(value, label) {
  if (isEmpty(value)) return `${label} is required.`;
  return null;
}

function maxLen(value, max, label) {
  const v = trim(value);
  if (!v) return null;
  if (v.length > max) return `${label} must be ${max} characters or fewer.`;
  return null;
}

function emailField(value, label, { required = false } = {}) {
  const v = trim(value);
  if (!v) return required ? `${label} is required.` : null;
  if (!EMAIL_RE.test(v)) return `${label} must be a valid email address.`;
  if (v.length > 255) return `${label} must be 255 characters or fewer.`;
  return null;
}

function phoneField(value, label) {
  const v = trim(value);
  if (!v) return null;
  if (v.length > 64) return `${label} must be 64 characters or fewer.`;
  if (/[^\d\s+().-]/.test(v)) return `${label} must be a valid phone number.`;
  if (v.length >= 7 && !PHONE_RE.test(v)) return `${label} must be a valid phone number.`;
  return null;
}

function urlField(value, label) {
  const v = trim(value);
  if (!v) return null;
  if (v.length > 500) return `${label} must be 500 characters or fewer.`;
  if (!URL_RE.test(v)) return `${label} must be a valid URL (e.g. https://example.com).`;
  return null;
}

function numberField(value, label, { min, max, integer = false } = {}) {
  if (value === '' || value == null) return null;
  const n = Number(value);
  if (Number.isNaN(n)) return `${label} must be a valid number.`;
  if (integer && !Number.isInteger(n)) return `${label} must be a whole number.`;
  if (min != null && n < min) return `${label} must be at least ${min}.`;
  if (max != null && n > max) return `${label} must be at most ${max}.`;
  return null;
}

function isUnchanged(value, unchangedFrom) {
  if (unchangedFrom == null) return false;
  return trim(value) === trim(unchangedFrom);
}

function dateField(value, label, { required = false, minToday = false, unchangedFrom } = {}) {
  const v = trim(value);
  if (!v) return required ? `${label} is required.` : null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return `${label} must be a valid date.`;
  if (minToday && !isUnchanged(v, unchangedFrom)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const cmp = new Date(d);
    cmp.setHours(0, 0, 0, 0);
    if (cmp < today) return `${label} cannot be in the past.`;
  }
  return null;
}

function datetimeField(value, label, { required = false, minNow = false, unchangedFrom } = {}) {
  const v = trim(value);
  if (!v) return required ? `${label} is required.` : null;
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return `${label} must be a valid date and time.`;
  if (minNow && !isUnchanged(v, unchangedFrom) && d < new Date()) {
    return `${label} cannot be in the past.`;
  }
  return null;
}

function oneOf(value, allowed, label) {
  const v = trim(value);
  if (!v) return null;
  if (!allowed.includes(v)) return `${label} has an invalid value.`;
  return null;
}

/** Returns true when there are no validation errors. */
export function isFormValid(errors) {
  return Object.keys(errors).length === 0;
}

const ACCOUNT_STATUSES = ['active', 'inactive', 'prospect'];
const CONTACT_STATUSES = ['active', 'inactive'];
const CONTACT_SOURCES = ['call', 'email', 'website', 'partner', 'referral'];
const CONTACT_PRIORITIES = ['Key', 'Standard', 'At Risk'];
const CONTACT_ENGAGEMENT = ['High', 'Medium', 'Low'];
const LEAD_SOURCES = ['call', 'email', 'website', 'partner'];
const OPPORTUNITY_STAGES = [
  'prospecting',
  'qualification',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
];
const ACTIVITY_TYPES = ['Call', 'Email', 'Meeting', 'Task', 'Note'];
const EVENT_TYPES = ['meeting', 'call', 'demo', 'task', 'reminder', 'appointment'];
const EVENT_STATUSES = ['scheduled', 'completed', 'cancelled'];
const RELATED_TYPES = ['Contact', 'Account', 'Opportunity', 'Lead'];

export function validateAccountForm(data, { allowedTiers, allowedIndustries } = {}) {
  const errors = {};
  collect(errors, 'name', requiredField(data.name, 'Account name'));
  collect(errors, 'name', maxLen(data.name, 255, 'Account name'));
  if (allowedIndustries?.length) {
    collect(errors, 'industry', oneOf(data.industry, allowedIndustries, 'Industry'));
  } else {
    collect(errors, 'industry', maxLen(data.industry, 255, 'Industry'));
  }
  collect(errors, 'email', emailField(data.email, 'Email', { required: true }));
  collect(errors, 'phone', phoneField(data.phone, 'Phone'));
  collect(errors, 'website', urlField(data.website, 'Website'));
  collect(errors, 'annual_revenue', numberField(data.annual_revenue, 'Annual revenue', { min: 0 }));
  collect(errors, 'employees', numberField(data.employees, 'Employees', { min: 0, integer: true }));
  collect(errors, 'status', oneOf(data.status, ACCOUNT_STATUSES, 'Status'));
  if (allowedTiers?.length && trim(data.tier)) {
    collect(errors, 'tier', oneOf(data.tier, allowedTiers, 'Tier'));
  } else {
    collect(errors, 'tier', maxLen(data.tier, 100, 'Tier'));
  }
  collect(errors, 'owner', maxLen(data.owner, 255, 'Account owner'));
  return errors;
}

/** Strip empty optional fields before entity API create/update. */
export function buildAccountPayload(formData) {
  const payload = {
    name: trim(formData.name),
    email: trim(formData.email),
    status: trim(formData.status) || 'active',
  };

  const industry = trim(formData.industry);
  if (industry) payload.industry = industry;

  const tier = trim(formData.tier);
  if (tier) payload.tier = tier;

  const website = trim(formData.website);
  if (website) payload.website = website;

  const phone = trim(formData.phone);
  if (phone) payload.phone = phone;

  if (formData.annual_revenue !== '' && formData.annual_revenue != null) {
    const revenue = Number(formData.annual_revenue);
    if (!Number.isNaN(revenue)) payload.annual_revenue = revenue;
  }

  if (formData.employees !== '' && formData.employees != null) {
    const employees = parseInt(formData.employees, 10);
    if (!Number.isNaN(employees)) payload.employees = employees;
  }

  payload.owner = trim(formData.owner) || null;

  return payload;
}

export function validateContactForm(data, { requireEmail = true, allowedSources } = {}) {
  const errors = {};
  const sources = allowedSources?.length ? allowedSources : CONTACT_SOURCES;
  collect(errors, 'name', requiredField(data.name, 'Name'));
  collect(errors, 'name', maxLen(data.name, 255, 'Name'));
  collect(errors, 'email', emailField(data.email, 'Email', { required: requireEmail }));
  collect(errors, 'phone', phoneField(data.phone, 'Phone'));
  collect(errors, 'company', maxLen(data.company, 255, 'Company'));
  collect(errors, 'position', maxLen(data.position, 255, 'Position'));
  collect(errors, 'role', maxLen(data.role, 255, 'Role'));
  collect(errors, 'priority', oneOf(data.priority, CONTACT_PRIORITIES, 'Priority'));
  collect(errors, 'status', oneOf(data.status, CONTACT_STATUSES, 'Status'));
  collect(errors, 'source', oneOf(data.source, sources, 'Source'));
  collect(errors, 'engagement_level', oneOf(data.engagement_level, CONTACT_ENGAGEMENT, 'Engagement level'));
  collect(errors, 'company_size', maxLen(data.company_size, 50, 'Company size'));
  collect(errors, 'last_activity_date', dateField(data.last_activity_date, 'Last activity date'));
  return errors;
}

export function validateLeadForm(data, { original, allowedStatuses, allowedSources } = {}) {
  const errors = {};
  const leadStatusValues = allowedStatuses?.length
    ? allowedStatuses
    : LEAD_STATUSES.map((s) => s.value);
  const sources = allowedSources?.length ? allowedSources : LEAD_SOURCES;
  collect(errors, 'name', requiredField(data.name, 'Name'));
  collect(errors, 'name', maxLen(data.name, 255, 'Name'));
  collect(errors, 'email', emailField(data.email, 'Email', { required: true }));
  collect(errors, 'phone', phoneField(data.phone, 'Phone'));
  collect(errors, 'company', maxLen(data.company, 255, 'Company'));
  collect(errors, 'status', oneOf(data.status, leadStatusValues, 'Status'));
  collect(errors, 'source', oneOf(data.source, sources, 'Source'));
  collect(errors, 'value', numberField(data.value, 'Estimated value', { min: 0 }));
  collect(
    errors,
    'next_follow_up',
    dateField(data.next_follow_up, 'Next follow-up', {
      minToday: true,
      unchangedFrom: original?.next_follow_up,
    })
  );
  return errors;
}

export function validateOpportunityForm(data) {
  const errors = {};
  collect(errors, 'name', requiredField(data.name, 'Opportunity name'));
  collect(errors, 'name', maxLen(data.name, 255, 'Opportunity name'));
  collect(errors, 'account_name', maxLen(data.account_name, 255, 'Account'));
  collect(errors, 'amount', numberField(data.amount, 'Amount', { min: 0 }));
  collect(errors, 'stage', oneOf(data.stage, OPPORTUNITY_STAGES, 'Stage'));
  collect(errors, 'probability', numberField(data.probability, 'Probability', { min: 0, max: 100 }));
  collect(errors, 'close_date', dateField(data.close_date, 'Close date'));
  collect(errors, 'owner', maxLen(data.owner, 255, 'Owner'));
  collect(errors, 'source', maxLen(data.source, 100, 'Source'));
  return errors;
}

export function validateActivityForm(data, { allowedTypes } = {}) {
  const errors = {};
  const types = allowedTypes?.length ? allowedTypes : ACTIVITY_TYPES;
  collect(errors, 'type', requiredField(data.type, 'Activity type'));
  collect(errors, 'type', oneOf(data.type, types, 'Activity type'));
  collect(errors, 'description', requiredField(data.description, 'Description'));
  collect(errors, 'date', datetimeField(data.date, 'Date & time', { required: true }));
  collect(errors, 'related_to_type', oneOf(data.related_to_type, RELATED_TYPES, 'Related type'));

  if (trim(data.related_to_type) && !trim(data.related_to_id) && !trim(data.related_to_name)) {
    collect(errors, 'related_to_name', 'Related record is required when a type is selected.');
  }
  return errors;
}

export function validateCalendarEventForm(data, { original } = {}) {
  const errors = {};
  const isScheduled = trim(data.status) === 'scheduled';
  collect(errors, 'title', requiredField(data.title, 'Title'));
  collect(errors, 'title', maxLen(data.title, 500, 'Title'));
  collect(errors, 'description', maxLen(data.description, 5000, 'Description'));
  collect(errors, 'event_type', requiredField(data.event_type, 'Event type'));
  collect(errors, 'event_type', oneOf(data.event_type, EVENT_TYPES, 'Event type'));
  collect(errors, 'status', oneOf(data.status, EVENT_STATUSES, 'Status'));
  collect(
    errors,
    'start_date',
    datetimeField(data.start_date, 'Start date & time', {
      required: true,
      ...(isScheduled
        ? { minNow: true, unchangedFrom: original?.start_date }
        : {}),
    })
  );
  collect(
    errors,
    'end_date',
    datetimeField(data.end_date, 'End date & time', {
      ...(isScheduled ? { minNow: true, unchangedFrom: original?.end_date } : {}),
    })
  );

  if (trim(data.start_date) && trim(data.end_date)) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
      collect(errors, 'end_date', 'End date & time must be after the start date & time.');
    }
  }

  collect(errors, 'location', maxLen(data.location, 500, 'Location'));
  collect(errors, 'related_to_type', oneOf(data.related_to_type, RELATED_TYPES, 'Related type'));
  if (trim(data.related_to_type) && !trim(data.related_to_id) && !trim(data.related_to_name)) {
    collect(errors, 'related_to_name', 'Related record is required when a related type is selected.');
  }
  return errors;
}
