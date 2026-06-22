import { activityMatchesAccount } from '@/lib/crmHelpers';

export function contactMatchesAccount(contact, account) {
  if (!contact || !account) return false;
  if (contact.account_id && contact.account_id === account.id) return true;
  return Boolean(contact.company && contact.company === account.name);
}

export function leadMatchesAccount(lead, account) {
  if (!lead || !account) return false;
  if (lead.account_id && lead.account_id === account.id) return true;
  return Boolean(lead.company && lead.company === account.name);
}

export function opportunityMatchesAccount(opportunity, account) {
  if (!opportunity || !account) return false;
  if (opportunity.account_id && opportunity.account_id === account.id) return true;
  return opportunity.account_name === account.name;
}

export function isOpenOpportunity(opportunity) {
  return (
    opportunity?.stage !== 'closed_won' && opportunity?.stage !== 'closed_lost'
  );
}

/** Account Insights + Accounts list — direct account links plus contact/opportunity roll-up. */
export function activitiesForAccount(
  account,
  activities,
  { contacts = [], opportunities = [] } = {},
) {
  if (!account || !activities?.length) return [];

  const linkedContacts = contacts.filter((c) => contactMatchesAccount(c, account));
  const linkedOpps = opportunities.filter((o) => opportunityMatchesAccount(o, account));
  const contactIds = new Set(linkedContacts.map((c) => c.id));
  const contactNames = new Set(linkedContacts.map((c) => c.name));
  const oppIds = new Set(linkedOpps.map((o) => o.id));
  const oppNames = new Set(linkedOpps.map((o) => o.name));

  return activities.filter((activity) => {
    if (activityMatchesAccount(activity, account)) return true;
    if (
      activity.related_to_type === 'Contact' &&
      (contactIds.has(activity.related_to_id) ||
        contactNames.has(activity.related_to_name))
    ) {
      return true;
    }
    if (
      activity.related_to_type === 'Opportunity' &&
      (oppIds.has(activity.related_to_id) || oppNames.has(activity.related_to_name))
    ) {
      return true;
    }
    return false;
  });
}

/** Account Insights — direct account links plus contact/opportunity roll-up. */
export function calendarEventsForAccount(
  account,
  events,
  { contacts = [], opportunities = [] } = {},
) {
  if (!account || !events?.length) return [];

  const linkedContacts = contacts.filter((c) => contactMatchesAccount(c, account));
  const linkedOpps = opportunities.filter((o) => opportunityMatchesAccount(o, account));
  const contactIds = new Set(linkedContacts.map((c) => c.id));
  const contactNames = new Set(linkedContacts.map((c) => c.name));
  const oppIds = new Set(linkedOpps.map((o) => o.id));
  const oppNames = new Set(linkedOpps.map((o) => o.name));

  return events.filter((event) => {
    if (activityMatchesAccount(event, account)) return true;
    if (
      event.related_to_type === 'Contact' &&
      (contactIds.has(event.related_to_id) || contactNames.has(event.related_to_name))
    ) {
      return true;
    }
    if (
      event.related_to_type === 'Opportunity' &&
      (oppIds.has(event.related_to_id) || oppNames.has(event.related_to_name))
    ) {
      return true;
    }
    return false;
  });
}
