import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { usePermissions } from '@/hooks/usePermissions';
import {
  CRM_CONFIG_QUERY_KEYS,
  fetchDefaultSettingsRecord,
  weekStartsOnFromSettings,
  defaultCalendarView,
  defaultCurrency,
  defaultFollowUpDays,
  followUpDateFromSettings,
  defaultLeadStage,
  defaultContactSource,
  defaultAccountTier,
  defaultActivityType,
  leadStageOptions,
  contactSourceOptions,
  activityTypeOptions,
  accountTierOptions,
  industryOptions,
} from '@/lib/crmConfig';

/**
 * Shared CRM configuration from Settings — lists + default values.
 */
export function useCrmConfig({ enabled = true } = {}) {
  const { canReadEntity, isLoading: permsLoading } = usePermissions();
  const canRead = !permsLoading && canReadEntity('DefaultSettings');
  const queriesEnabled = enabled && canRead;

  const { data: defaultSettings = null, isLoading: settingsLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.defaultSettings,
    queryFn: fetchDefaultSettingsRecord,
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const { data: contactSources = [], isLoading: sourcesLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.contactSources,
    queryFn: () => api.entities.ContactSource.list('order'),
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const { data: leadStages = [], isLoading: stagesLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.leadStages,
    queryFn: () => api.entities.LeadStage.list('order'),
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const { data: activityTypes = [], isLoading: typesLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.activityTypes,
    queryFn: () => api.entities.ActivityType.list('order'),
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const { data: accountTiers = [], isLoading: tiersLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.accountTiers,
    queryFn: () => api.entities.AccountTier.list('order'),
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const { data: industries = [], isLoading: industriesLoading } = useQuery({
    queryKey: CRM_CONFIG_QUERY_KEYS.industries,
    queryFn: () => api.entities.Industry.list('order'),
    staleTime: 60_000,
    enabled: queriesEnabled,
  });

  const options = useMemo(
    () => ({
      leadStages: leadStageOptions(leadStages),
      contactSources: contactSourceOptions(contactSources),
      activityTypes: activityTypeOptions(activityTypes),
      accountTiers: accountTierOptions(accountTiers),
      industries: industryOptions(industries),
    }),
    [leadStages, contactSources, activityTypes, accountTiers, industries],
  );

  const defaults = useMemo(
    () => ({
      currency: defaultCurrency(defaultSettings),
      leadStage: defaultLeadStage(defaultSettings, leadStages),
      contactSource: defaultContactSource(defaultSettings, contactSources),
      accountTier: defaultAccountTier(defaultSettings, accountTiers),
      activityType: defaultActivityType(activityTypes),
      followUpDays: defaultFollowUpDays(defaultSettings),
      followUpDate: followUpDateFromSettings(defaultSettings),
      calendarView: defaultCalendarView(defaultSettings),
      weekStartsOn: weekStartsOnFromSettings(defaultSettings),
    }),
    [defaultSettings, leadStages, contactSources, accountTiers, activityTypes],
  );

  return {
    isLoading:
      permsLoading ||
      (queriesEnabled &&
        (settingsLoading ||
          sourcesLoading ||
          stagesLoading ||
          typesLoading ||
          tiersLoading ||
          industriesLoading)),
    defaultSettings,
    defaults,
    options,
    contactSources,
    leadStages,
    activityTypes,
    accountTiers,
    industries,
  };
}
