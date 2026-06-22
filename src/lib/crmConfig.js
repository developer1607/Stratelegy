import { addDays, format } from 'date-fns';
import { namesFromConfigItems } from '@/lib/listFilters';

export const CRM_CONFIG_QUERY_KEYS = {
  defaultSettings: ['defaultSettings'],
  contactSources: ['contactSources'],
  leadStages: ['leadStages'],
  activityTypes: ['activityTypes'],
  accountTiers: ['accountTiers'],
  industries: ['industries'],
};

/** Invalidate all CRM config queries after Settings changes. */
export function invalidateCrmConfig(queryClient) {
  for (const queryKey of Object.values(CRM_CONFIG_QUERY_KEYS)) {
    queryClient.invalidateQueries({ queryKey });
  }
}

export async function fetchDefaultSettingsRecord() {
  const { api } = await import('@/api/client');
  const settings = await api.entities.DefaultSettings.list();
  return settings[0] || null;
}

/** date-fns weekStartsOn: 0 = Sunday, 1 = Monday */
export function weekStartsOnFromSettings(settings) {
  return settings?.first_day_of_week === 'sunday' ? 0 : 1;
}

export function defaultCalendarView(settings) {
  return settings?.default_calendar_view === 'week' ? 'week' : 'month';
}

export function defaultCurrency(settings) {
  return settings?.default_currency || 'AED';
}

export function defaultFollowUpDays(settings) {
  const days = Number(settings?.default_follow_up_days);
  return Number.isFinite(days) && days >= 0 ? days : 3;
}

/** YYYY-MM-DD for date inputs — today + N days from settings. */
export function followUpDateFromSettings(settings, fromDate = new Date()) {
  return format(addDays(fromDate, defaultFollowUpDays(settings)), 'yyyy-MM-dd');
}

/**
 * Pick a config list value, matching settings text case-insensitively when possible.
 */
export function resolveConfigDefault(preferred, options, fallback) {
  const list = (options || []).filter(Boolean);
  if (!list.length) return fallback;
  if (preferred) {
    const match = list.find(
      (item) => String(item).toLowerCase() === String(preferred).toLowerCase(),
    );
    if (match) return match;
  }
  return list[0] || fallback;
}

export function configOptionsFromItems(items, { currentValue, fallbacks = [] } = {}) {
  const fromConfig = namesFromConfigItems(items);
  const set = new Set([...fromConfig, ...fallbacks.filter(Boolean)]);
  if (currentValue) set.add(currentValue);
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}

export function leadStageOptions(leadStages, currentValue) {
  return configOptionsFromItems(leadStages, {
    currentValue,
    fallbacks: ['New', 'Contacted', 'Qualified', 'Won', 'Lost'],
  });
}

export function contactSourceOptions(contactSources, currentValue) {
  return configOptionsFromItems(contactSources, {
    currentValue,
    fallbacks: ['Email', 'Website', 'Referral', 'Phone'],
  });
}

export function activityTypeOptions(activityTypes, currentValue) {
  return configOptionsFromItems(activityTypes, {
    currentValue,
    fallbacks: ['Call', 'Email', 'Meeting', 'Task', 'Note'],
  });
}

export function accountTierOptions(accountTiers, currentValue) {
  return configOptionsFromItems(accountTiers, {
    currentValue,
    fallbacks: ['Standard', 'Premium', 'Enterprise'],
  });
}

export function industryOptions(industries, currentValue) {
  return configOptionsFromItems(industries, {
    currentValue,
    fallbacks: ['Technology', 'Healthcare', 'Finance', 'Retail', 'Other'],
  });
}

export function defaultLeadStage(settings, leadStages) {
  return resolveConfigDefault(
    settings?.default_lead_stage,
    namesFromConfigItems(leadStages),
    'New',
  );
}

export function defaultContactSource(settings, contactSources) {
  return resolveConfigDefault(
    null,
    namesFromConfigItems(contactSources),
    'Email',
  );
}

export function defaultAccountTier(settings, accountTiers) {
  return resolveConfigDefault(
    settings?.default_account_tier,
    namesFromConfigItems(accountTiers),
    'Standard',
  );
}

export function defaultActivityType(activityTypes) {
  return resolveConfigDefault(null, namesFromConfigItems(activityTypes), 'Call');
}
