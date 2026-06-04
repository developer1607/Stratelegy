/** Registry mapping entity names to MySQL tables and column specs. */

import { PERMISSION_KEYS } from '../constants/permissions.js';

/**
 * Virtual entities (no dedicated table in entityDefinitions):
 * - User → `users` table (server/db/schema/platform.js) via server/services/users.js
 * - Ticket, TicketComment → ticket tables via ticketStore
 */

const PERMISSION_COLUMNS = Object.fromEntries(
  PERMISSION_KEYS.map((key) => [key, { type: 'bool', writable: true, default: false }])
);

const CONFIG_COLUMNS = {
  name: { type: 'string', required: true, writable: true, maxLength: 255 },
  sort_order: { type: 'int', apiField: 'order', writable: true },
  color: { type: 'string', writable: true, maxLength: 32, optional: true },
};

function crmTimestamps() {
  return {
    created_by: { type: 'string', writable: true, maxLength: 36, optional: true },
    created_date: { type: 'datetime', writable: false },
    updated_date: { type: 'datetime', writable: false },
  };
}

export const ENTITY_REGISTRY = {
  Account: {
    table: 'accounts',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      name: { type: 'string', required: true, writable: true, maxLength: 255 },
      industry: { type: 'string', writable: true, maxLength: 255, optional: true },
      website: { type: 'string', writable: true, maxLength: 500, optional: true },
      phone: { type: 'string', writable: true, maxLength: 64, optional: true },
      email: { type: 'string', writable: true, maxLength: 255, optional: true },
      annual_revenue: { type: 'decimal', writable: true, optional: true },
      employees: { type: 'int', writable: true, optional: true },
      status: { type: 'string', writable: true, maxLength: 50, optional: true, default: 'active' },
      owner: { type: 'string', writable: true, maxLength: 255, optional: true },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_accounts_name', columns: ['name'] },
      { name: 'idx_accounts_status', columns: ['status'] },
      { name: 'idx_accounts_created', columns: ['created_date'] },
    ],
  },

  Contact: {
    table: 'contacts',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      name: { type: 'string', required: true, writable: true, maxLength: 255 },
      email: { type: 'string', writable: true, maxLength: 255, optional: true },
      phone: { type: 'string', writable: true, maxLength: 64, optional: true },
      company: { type: 'string', writable: true, maxLength: 255, optional: true },
      position: { type: 'string', writable: true, maxLength: 255, optional: true },
      role: { type: 'string', writable: true, maxLength: 255, optional: true },
      priority: { type: 'string', writable: true, maxLength: 50, optional: true },
      status: { type: 'string', writable: true, maxLength: 50, optional: true, default: 'active' },
      source: { type: 'string', writable: true, maxLength: 100, optional: true },
      engagement_level: { type: 'string', writable: true, maxLength: 50, optional: true },
      company_size: { type: 'string', writable: true, maxLength: 50, optional: true },
      last_activity_date: { type: 'string', writable: true, maxLength: 64, optional: true },
      photo_url: { type: 'text', writable: true, optional: true },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_contacts_name', columns: ['name'] },
      { name: 'idx_contacts_email', columns: ['email'] },
      { name: 'idx_contacts_company', columns: ['company'] },
      { name: 'idx_contacts_created', columns: ['created_date'] },
    ],
  },

  Lead: {
    table: 'leads',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      name: { type: 'string', required: true, writable: true, maxLength: 255 },
      email: { type: 'string', writable: true, maxLength: 255, optional: true },
      phone: { type: 'string', writable: true, maxLength: 64, optional: true },
      company: { type: 'string', writable: true, maxLength: 255, optional: true },
      status: { type: 'string', writable: true, maxLength: 50, optional: true, default: 'new' },
      source: { type: 'string', writable: true, maxLength: 100, optional: true },
      value: { type: 'decimal', writable: true, optional: true },
      next_follow_up: { type: 'string', writable: true, maxLength: 64, optional: true },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_leads_name', columns: ['name'] },
      { name: 'idx_leads_status', columns: ['status'] },
      { name: 'idx_leads_created', columns: ['created_date'] },
    ],
  },

  Opportunity: {
    table: 'opportunities',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      name: { type: 'string', required: true, writable: true, maxLength: 255 },
      account_name: { type: 'string', writable: true, maxLength: 255, optional: true },
      amount: { type: 'decimal', writable: true, optional: true },
      stage: {
        type: 'string',
        writable: true,
        maxLength: 50,
        optional: true,
        default: 'prospecting',
      },
      probability: { type: 'decimal', writable: true, optional: true },
      close_date: { type: 'string', writable: true, maxLength: 64, optional: true },
      owner: { type: 'string', writable: true, maxLength: 255, optional: true },
      source: { type: 'string', writable: true, maxLength: 100, optional: true },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_opportunities_name', columns: ['name'] },
      { name: 'idx_opportunities_stage', columns: ['stage'] },
      { name: 'idx_opportunities_account', columns: ['account_name'] },
      { name: 'idx_opportunities_created', columns: ['created_date'] },
    ],
  },

  Activity: {
    table: 'activities',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      type: { type: 'string', required: true, writable: true, maxLength: 100 },
      description: { type: 'text', required: true, writable: true },
      date: { type: 'string', required: true, writable: true, maxLength: 64 },
      related_to_type: { type: 'string', writable: true, maxLength: 100, optional: true },
      related_to_id: { type: 'string', writable: true, maxLength: 36, optional: true },
      related_to_name: { type: 'string', writable: true, maxLength: 255, optional: true },
      completed: { type: 'bool', writable: true, optional: true, default: false },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_activities_type', columns: ['type'] },
      { name: 'idx_activities_date', columns: ['date'] },
      { name: 'idx_activities_related', columns: ['related_to_type', 'related_to_name'] },
      { name: 'idx_activities_created', columns: ['created_date'] },
    ],
  },

  CalendarEvent: {
    table: 'calendar_events',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      title: { type: 'string', required: true, writable: true, maxLength: 500 },
      description: { type: 'text', writable: true, optional: true },
      event_type: {
        type: 'string',
        writable: true,
        maxLength: 50,
        optional: true,
        default: 'meeting',
      },
      start_date: { type: 'string', writable: true, maxLength: 64, optional: true },
      end_date: { type: 'string', writable: true, maxLength: 64, optional: true },
      location: { type: 'string', writable: true, maxLength: 500, optional: true },
      related_to_type: { type: 'string', writable: true, maxLength: 100, optional: true },
      related_to_name: { type: 'string', writable: true, maxLength: 255, optional: true },
      status: {
        type: 'string',
        writable: true,
        maxLength: 50,
        optional: true,
        default: 'scheduled',
      },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_calendar_events_start', columns: ['start_date'] },
      { name: 'idx_calendar_events_status', columns: ['status'] },
      { name: 'idx_calendar_events_created', columns: ['created_date'] },
    ],
  },

  ContactSource: {
    table: 'contact_sources',
    configEntity: true,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      ...CONFIG_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_contact_sources_order', columns: ['sort_order'] }],
  },

  LeadStage: {
    table: 'lead_stages',
    configEntity: true,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      ...CONFIG_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_lead_stages_order', columns: ['sort_order'] }],
  },

  ActivityType: {
    table: 'activity_types',
    configEntity: true,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      ...CONFIG_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_activity_types_order', columns: ['sort_order'] }],
  },

  AccountTier: {
    table: 'account_tiers',
    configEntity: true,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      ...CONFIG_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_account_tiers_order', columns: ['sort_order'] }],
  },

  Industry: {
    table: 'industries',
    configEntity: true,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      ...CONFIG_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_industries_order', columns: ['sort_order'] }],
  },

  DefaultSettings: {
    table: 'default_settings',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      default_currency: {
        type: 'string',
        writable: true,
        maxLength: 10,
        optional: true,
        default: 'AED',
      },
      default_lead_stage: {
        type: 'string',
        writable: true,
        maxLength: 50,
        optional: true,
        default: 'new',
      },
      default_account_tier: {
        type: 'string',
        writable: true,
        maxLength: 50,
        optional: true,
        default: 'B',
      },
      default_follow_up_days: { type: 'int', writable: true, optional: true, default: 3 },
      default_calendar_view: {
        type: 'string',
        writable: true,
        maxLength: 20,
        optional: true,
        default: 'month',
      },
      first_day_of_week: {
        type: 'string',
        writable: true,
        maxLength: 20,
        optional: true,
        default: 'monday',
      },
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
  },

  KBArticle: {
    table: 'kb_articles',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      title: { type: 'string', required: true, writable: true, maxLength: 500 },
      content: { type: 'text', writable: true, optional: true },
      category: { type: 'string', writable: true, maxLength: 255, optional: true },
      status: { type: 'string', writable: true, maxLength: 50, optional: true, default: 'draft' },
      tags: { type: 'string', writable: true, maxLength: 500, optional: true },
      ...crmTimestamps(),
    },
    indexes: [
      { name: 'idx_kb_articles_title', columns: ['title'] },
      { name: 'idx_kb_articles_status', columns: ['status'] },
      { name: 'idx_kb_articles_created', columns: ['created_date'] },
    ],
  },

  UserPermissions: {
    table: 'user_permissions',
    configEntity: false,
    columns: {
      id: { type: 'string', writable: false, maxLength: 36 },
      user_id: { type: 'string', required: true, writable: true, maxLength: 36 },
      user_email: { type: 'string', writable: true, maxLength: 255, optional: true },
      user_name: { type: 'string', writable: true, maxLength: 255, optional: true },
      role_id: { type: 'string', writable: true, maxLength: 36, optional: true },
      use_custom_permissions: { type: 'bool', writable: true, default: false },
      ...PERMISSION_COLUMNS,
      created_date: { type: 'datetime', writable: false },
      updated_date: { type: 'datetime', writable: false },
    },
    indexes: [{ name: 'idx_user_permissions_user_id', columns: ['user_id'], unique: true }],
  },

  Ticket: {
    table: 'tickets',
    externalStore: 'ticket',
    configEntity: false,
    columns: {},
  },

  TicketComment: {
    table: 'ticket_comments',
    externalStore: 'ticket',
    configEntity: false,
    columns: {},
  },
};

export const SAAS_ENTITY_NAMES = Object.keys(ENTITY_REGISTRY).filter(
  (name) => !ENTITY_REGISTRY[name].externalStore
);

export function getEntityDef(entityName) {
  const def = ENTITY_REGISTRY[entityName];
  if (!def) {
    const err = new Error(`Unknown entity: ${entityName}`);
    err.status = 400;
    throw err;
  }
  return def;
}

export function isExternalStore(entityName) {
  return Boolean(getEntityDef(entityName).externalStore);
}

/** Map API field name to DB column name. */
export function apiToDbField(entityName, apiField) {
  const def = getEntityDef(entityName);
  if (apiField === 'order' && def.configEntity) return 'sort_order';
  for (const [col, spec] of Object.entries(def.columns)) {
    if (spec.apiField === apiField) return col;
    if (col === apiField) return col;
  }
  return apiField;
}

/** Map DB column name to API field name. */
export function dbToApiField(entityName, dbField) {
  const def = getEntityDef(entityName);
  const spec = def.columns[dbField];
  if (spec?.apiField) return spec.apiField;
  if (dbField === 'sort_order' && def.configEntity) return 'order';
  return dbField;
}
