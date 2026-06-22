/**
 * Portal permission registry — single source of truth for keys, UI groups, pages, and entities.
 * Imported by server and client (via @shared alias).
 */

import {
  PBX_OPERATIONAL_REPORT_PAGES,
} from './pbxReportPages.js';

export const PERMISSION_DEFS = [
  {
    key: 'can_access_crm',
    label: 'Full CRM access',
    module: 'crm',
    section: 'Module',
    master: true,
  },
  {
    key: 'can_access_support',
    label: 'Full Support access',
    module: 'support',
    section: 'Module',
    master: true,
  },
  {
    key: 'can_access_pbx',
    label: 'Full PBX access',
    module: 'pbx',
    section: 'Module',
    master: true,
  },
  {
    key: 'can_access_pbx_domain_scoped',
    label: 'PBX domain-scoped access',
    module: 'pbx',
    section: 'Module',
    master: true,
    domainScoped: true,
  },

  {
    key: 'can_view_dashboard',
    label: 'Dashboard',
    module: 'crm',
    section: 'Screens',
    page: 'Dashboard',
  },
  {
    key: 'can_view_accounts_page',
    label: 'Accounts',
    module: 'crm',
    section: 'Screens',
    page: 'Accounts',
  },
  {
    key: 'can_view_contacts_page',
    label: 'Contacts',
    module: 'crm',
    section: 'Screens',
    page: 'Contacts',
  },
  { key: 'can_view_leads_page', label: 'Leads', module: 'crm', section: 'Screens', page: 'Leads' },
  {
    key: 'can_view_opportunities_page',
    label: 'Opportunities',
    module: 'crm',
    section: 'Screens',
    page: 'Opportunities',
  },
  {
    key: 'can_view_calendar_page',
    label: 'Calendar',
    module: 'crm',
    section: 'Screens',
    page: 'Calendar',
  },
  {
    key: 'can_view_activities_page',
    label: 'Activities',
    module: 'crm',
    section: 'Screens',
    page: 'Activities',
  },
  {
    key: 'can_view_reports_page',
    label: 'Reports',
    module: 'crm',
    section: 'Screens',
    page: 'Reports',
  },

  {
    key: 'can_view_accounts',
    label: 'View accounts',
    module: 'crm',
    section: 'Data',
    entityRead: 'Account',
  },
  {
    key: 'can_manage_accounts',
    label: 'Manage accounts',
    module: 'crm',
    section: 'Data',
    entityWrite: 'Account',
  },
  {
    key: 'can_view_contacts',
    label: 'View contacts',
    module: 'crm',
    section: 'Data',
    entityRead: 'Contact',
  },
  {
    key: 'can_manage_contacts',
    label: 'Manage contacts',
    module: 'crm',
    section: 'Data',
    entityWrite: 'Contact',
  },
  {
    key: 'can_view_leads',
    label: 'View leads',
    module: 'crm',
    section: 'Data',
    entityRead: 'Lead',
  },
  {
    key: 'can_manage_leads',
    label: 'Manage leads',
    module: 'crm',
    section: 'Data',
    entityWrite: 'Lead',
  },
  {
    key: 'can_view_opportunities',
    label: 'View opportunities',
    module: 'crm',
    section: 'Data',
    entityRead: 'Opportunity',
  },
  {
    key: 'can_manage_opportunities',
    label: 'Manage opportunities',
    module: 'crm',
    section: 'Data',
    entityWrite: 'Opportunity',
  },
  {
    key: 'can_view_calendar_events',
    label: 'View calendar events',
    module: 'crm',
    section: 'Data',
    entityRead: 'CalendarEvent',
  },
  {
    key: 'can_manage_calendar',
    label: 'Manage calendar',
    module: 'crm',
    section: 'Data',
    entityWrite: 'CalendarEvent',
  },
  {
    key: 'can_view_activities',
    label: 'View activities',
    module: 'crm',
    section: 'Data',
    entityRead: 'Activity',
  },
  {
    key: 'can_manage_activities',
    label: 'Manage activities',
    module: 'crm',
    section: 'Data',
    entityWrite: 'Activity',
  },
  { key: 'can_export_data', label: 'Export CSV/PDF', module: 'crm', section: 'Data' },

  {
    key: 'can_view_support_dashboard',
    label: 'Support dashboard',
    module: 'support',
    section: 'Screens',
    page: 'SupportDashboard',
  },
  {
    key: 'can_view_tickets_page',
    label: 'Tickets',
    module: 'support',
    section: 'Screens',
    page: 'SupportTickets',
  },
  {
    key: 'can_view_kb_page',
    label: 'Knowledge base',
    module: 'support',
    section: 'Screens',
    page: 'KnowledgeBase',
  },

  {
    key: 'can_view_tickets',
    label: 'View ticket details',
    module: 'support',
    section: 'Tickets',
    entityRead: 'Ticket',
  },
  {
    key: 'can_create_tickets',
    label: 'Create tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'create',
  },
  {
    key: 'can_edit_tickets',
    label: 'Edit tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'edit',
  },
  {
    key: 'can_assign_tickets',
    label: 'Assign tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'assign',
  },
  {
    key: 'can_close_tickets',
    label: 'Close tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'close',
  },
  {
    key: 'can_delete_tickets',
    label: 'Delete tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'delete',
  },
  {
    key: 'can_comment_tickets',
    label: 'Comment on tickets',
    module: 'support',
    section: 'Tickets',
    ticketAction: 'comment',
    entityWrite: 'TicketComment',
  },

  {
    key: 'can_view_kb',
    label: 'View KB articles',
    module: 'support',
    section: 'Knowledge base',
    entityRead: 'KBArticle',
  },
  {
    key: 'can_manage_kb',
    label: 'Manage KB articles',
    module: 'support',
    section: 'Knowledge base',
    entityWrite: 'KBArticle',
  },

  {
    key: 'can_view_pbx_dashboard',
    label: 'PBX dashboard',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXDashboard',
  },
  {
    key: 'can_view_pbx_domains_page',
    label: 'Domains',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXDomains',
  },
  {
    key: 'can_view_extensions_page',
    label: 'Extensions',
    module: 'pbx',
    section: 'Screens',
    page: 'Extensions',
  },
  {
    key: 'can_view_endpoint_control',
    label: 'Endpoint control',
    module: 'pbx',
    section: 'Screens',
    page: 'EndpointControl',
  },
  {
    key: 'can_view_offline_endpoints',
    label: 'Offline endpoints',
    module: 'pbx',
    section: 'Screens',
    page: 'OfflineEndpoints',
  },
  {
    key: 'can_view_call_routing_page',
    label: 'Call routing',
    module: 'pbx',
    section: 'Screens',
    page: 'CallRouting',
  },
  {
    key: 'can_view_phone_numbers_page',
    label: 'Phone numbers',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXPhoneNumbers',
  },
  {
    key: 'can_view_route_by_ani_page',
    label: 'Route by ANI',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXRouteByAni',
  },
  {
    key: 'can_view_sip_trunks',
    label: 'SIP trunks',
    module: 'pbx',
    section: 'Screens',
    page: 'SIPTrunks',
  },
  {
    key: 'can_view_e911_review',
    label: 'E911 review',
    module: 'pbx',
    section: 'Screens',
    page: 'E911Review',
  },
  {
    key: 'can_view_e911_reports',
    label: 'E911 reports',
    module: 'pbx',
    section: 'Screens',
    page: 'E911Reports',
  },
  {
    key: 'can_view_pbx_reports_page',
    label: 'PBX reports',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXReports',
  },
  {
    key: 'can_view_mos_scores_page',
    label: 'MOS scores',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXMosScores',
  },
  {
    key: 'can_view_call_logs_page',
    label: 'Call logs',
    module: 'pbx',
    section: 'Screens',
    page: 'CallLogs',
  },
  {
    key: 'can_view_voicemail_page',
    label: 'Voicemail',
    module: 'pbx',
    section: 'Screens',
    page: 'Voicemail',
  },
  {
    key: 'can_view_troubleshooting',
    label: 'Troubleshooting',
    module: 'pbx',
    section: 'Screens',
    page: 'Troubleshooting',
  },
  { key: 'can_view_sip_alg', label: 'SIP ALG', module: 'pbx', section: 'Screens', page: 'SIPALG' },
  {
    key: 'can_view_make_call_page',
    label: 'Make call',
    module: 'pbx',
    section: 'Screens',
    page: 'PBXMakeCall',
  },

  {
    key: 'can_manage_pbx_reports',
    label: 'Manage PBX reports (queue and cancel)',
    module: 'pbx',
    section: 'Actions',
  },
  {
    key: 'can_manage_pbx_routing',
    label: 'Manage phone routes',
    module: 'pbx',
    section: 'Actions',
  },
  {
    key: 'can_manage_route_by_ani',
    label: 'Manage route-by-ANI',
    module: 'pbx',
    section: 'Actions',
  },
  { key: 'can_manage_e911', label: 'Manage E911', module: 'pbx', section: 'Actions' },
  { key: 'can_manage_pbx_endpoints', label: 'Manage hub users', module: 'pbx', section: 'Actions' },
  { key: 'can_make_pbx_calls', label: 'Originate calls', module: 'pbx', section: 'Actions' },
];

export const PERMISSION_KEYS = PERMISSION_DEFS.map((d) => d.key);

export const MODULE_MASTER_KEYS = {
  crm: 'can_access_crm',
  support: 'can_access_support',
  pbx: 'can_access_pbx',
};

const CRM_KEYS = PERMISSION_DEFS.filter((d) => d.module === 'crm' && !d.master).map((d) => d.key);
const SUPPORT_KEYS = PERMISSION_DEFS.filter((d) => d.module === 'support' && !d.master).map(
  (d) => d.key
);
const PBX_KEYS = PERMISSION_DEFS.filter((d) => d.module === 'pbx' && !d.master).map((d) => d.key);

export const CRM_MODULE_KEYS = CRM_KEYS;
export const SUPPORT_MODULE_KEYS = SUPPORT_KEYS;
export const PBX_MODULE_KEYS = PBX_KEYS;

export const PBX_ACTION_KEYS = PERMISSION_DEFS.filter(
  (d) => d.module === 'pbx' && d.section === 'Actions'
).map((d) => d.key);

export const PBX_READ_KEYS = PERMISSION_DEFS.filter(
  (d) => d.module === 'pbx' && !d.master && d.section !== 'Actions'
).map((d) => d.key);

export const TICKET_ACTION_KEYS = Object.fromEntries(
  PERMISSION_DEFS.filter((d) => d.ticketAction).map((d) => [d.ticketAction, d.key])
);

/** Expand legacy coarse keys → granular keys (migration + role shorthand). */
export const LEGACY_PERMISSION_EXPAND = {
  can_access_crm: CRM_KEYS,
  can_access_support: SUPPORT_KEYS,
  can_access_pbx: PBX_KEYS,
  can_manage_contacts: ['can_view_contacts_page', 'can_view_contacts', 'can_manage_contacts'],
  can_manage_accounts: ['can_view_accounts_page', 'can_view_accounts', 'can_manage_accounts'],
  can_manage_leads: ['can_view_leads_page', 'can_view_leads', 'can_manage_leads'],
  can_manage_opportunities: [
    'can_view_opportunities_page',
    'can_view_opportunities',
    'can_manage_opportunities',
  ],
  can_manage_activities: [
    'can_view_activities_page',
    'can_view_activities',
    'can_manage_activities',
  ],
  can_manage_calendar: [
    'can_view_calendar_page',
    'can_view_calendar_events',
    'can_manage_calendar',
  ],
  can_manage_tickets: [
    'can_access_support',
    'can_view_support_dashboard',
    'can_view_tickets_page',
    'can_view_tickets',
    'can_create_tickets',
    'can_edit_tickets',
    'can_assign_tickets',
    'can_close_tickets',
    'can_comment_tickets',
  ],
  can_view_reports: ['can_view_reports_page'],
  can_manage_kb: ['can_view_kb_page', 'can_view_kb', 'can_manage_kb'],
};

export function expandPermissionKeys(keys) {
  const set = new Set();
  for (const key of keys) {
    if (LEGACY_PERMISSION_EXPAND[key]) {
      LEGACY_PERMISSION_EXPAND[key].forEach((k) => set.add(k));
    } else if (PERMISSION_KEYS.includes(key)) {
      set.add(key);
    }
  }
  return [...set];
}

export function getModulePermissionKeys(module) {
  return PERMISSION_DEFS.filter((d) => d.module === module).map((d) => d.key);
}

export function getModuleForPermissionKey(key) {
  return PERMISSION_DEFS.find((d) => d.key === key)?.module || null;
}

export function hasModuleMaster(permissions, module) {
  if (!permissions || !module) return false;
  const master = MODULE_MASTER_KEYS[module];
  return master ? Boolean(permissions[master]) : false;
}

export function hasPermissionKey(permissions, key) {
  if (!permissions || !key) return false;
  if (permissions.isAdmin) return true;
  if (permissions[key]) return true;
  const module = getModuleForPermissionKey(key);
  return module ? hasModuleMaster(permissions, module) : false;
}

const UI_SECTION_ORDER = ['Screens', 'Data', 'Tickets', 'Knowledge base', 'Actions'];

export function buildPermissionGroupsForUI() {
  const modules = [
    { id: 'crm', label: 'CRM', icon: 'crm', masterKey: 'can_access_crm' },
    { id: 'support', label: 'Support Desk', icon: 'support', masterKey: 'can_access_support' },
    { id: 'pbx', label: 'PBX', icon: 'pbx', masterKey: 'can_access_pbx' },
  ];

  return modules.map((mod) => {
    const defs = PERMISSION_DEFS.filter((d) => d.module === mod.id && !d.master);
    const sectionNames = [...new Set(defs.map((d) => d.section))].sort(
      (a, b) => UI_SECTION_ORDER.indexOf(a) - UI_SECTION_ORDER.indexOf(b)
    );
    const sections = sectionNames.map((section) => ({
      label: section,
      permissions: defs
        .filter((d) => d.section === section)
        .map((d) => ({ key: d.key, label: d.label })),
    }));
    return {
      ...mod,
      sections,
      allKeys: getModulePermissionKeys(mod.id),
      screenKeys: defs.filter((d) => d.section === 'Screens').map((d) => d.key),
      actionKeys: defs
        .filter(
          (d) =>
            d.section === 'Actions' ||
            d.section === 'Data' ||
            d.section === 'Tickets' ||
            d.section === 'Knowledge base'
        )
        .map((d) => d.key),
    };
  });
}

export function buildPagePermissionMap() {
  const map = {
    Profile: null,
    Settings: '__admin__',
    UserManagement: '__admin__',
    SupportTicketDetail: 'can_view_tickets',
    E911Reports: 'can_view_e911_reports',
  };
  for (const def of PERMISSION_DEFS) {
    if (def.page) map[def.page] = def.key;
  }
  for (const def of PBX_OPERATIONAL_REPORT_PAGES) {
    map[def.page] = def.permissionKey;
  }
  return map;
}

export function buildEntityReadMap() {
  const map = {
    User: null,
    UserPermissions: null,
    ContactSource: null,
    LeadStage: null,
    ActivityType: null,
    AccountTier: null,
    Industry: null,
    DefaultSettings: null,
  };
  for (const def of PERMISSION_DEFS) {
    if (def.entityRead) map[def.entityRead] = def.key;
  }
  return map;
}

export function buildEntityWriteMap() {
  const map = {};
  for (const def of PERMISSION_DEFS) {
    if (def.entityWrite) map[def.entityWrite] = def.key;
  }
  return map;
}

export function buildPageLists() {
  const crm = [];
  const support = [];
  const pbx = [];
  for (const def of PERMISSION_DEFS) {
    if (!def.page) continue;
    if (def.module === 'crm') crm.push(def.page);
    if (def.module === 'support') support.push(def.page);
    if (def.module === 'pbx') pbx.push(def.page);
  }
  for (const def of PBX_OPERATIONAL_REPORT_PAGES) {
    if (!pbx.includes(def.page)) pbx.push(def.page);
  }
  return {
    CRM_PAGES: [...crm, 'Settings', 'Profile'],
    SUPPORT_PAGES: [...support, 'SupportTicketDetail'],
    PBX_PAGES: pbx,
  };
}

export const CLOSED_TICKET_STATUSES = new Set(['resolved', 'closed']);
