import {
  LayoutDashboard,
  Users,
  UserCircle,
  Target,
  Calendar,
  Activity,
  BarChart3,
  Ticket,
  BookOpen,
  UserCog,
  Briefcase,
  Phone,
  Route,
  Voicemail,
  Hash,
  Radio,
  Globe,
  PhoneForwarded,
  Settings,
  Mail,
  LineChart,
  Cpu,
} from "lucide-react";
import { PBX_OPERATIONAL_REPORT_PAGES } from "@shared/pbxReportPages.js";

/** Sidebar navigation — permissions resolved via canAccessPage(page). */
export const CRM_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "Dashboard" },
  { name: "Accounts", icon: Users, path: "Accounts" },
  { name: "Contacts", icon: UserCircle, path: "Contacts" },
  { name: "Leads", icon: Target, path: "Leads" },
  { name: "Opportunities", icon: Briefcase, path: "Opportunities" },
  { name: "Calendar", icon: Calendar, path: "Calendar" },
  { name: "Activities", icon: Activity, path: "Activities" },
  { name: "Reports", icon: BarChart3, path: "Reports" },
];

export const SUPPORT_NAV = [
  { name: "Dashboard", icon: LayoutDashboard, path: "SupportDashboard" },
  { name: "Tickets", icon: Ticket, path: "SupportTickets" },
  { name: "Knowledge Base", icon: BookOpen, path: "KnowledgeBase" },
];

const PBX_REPORT_NAV_ICONS = {
  offlineEndpoints: Activity,
  deviceMonitoring: Cpu,
  e911: Mail,
};

/** Flat PBX sidebar — each item is permission-gated; Reports has a submenu. */
export const PBX_NAV = [
  { name: "Domains", icon: Globe, path: "PBXDomains" },
  { name: "Endpoint Control", icon: Users, path: "EndpointControl" },
  { name: "Offline Endpoints", icon: Activity, path: "OfflineEndpoints" },
  { name: "Extensions", icon: Hash, path: "Extensions" },
  { name: "Call Routing", icon: Route, path: "CallRouting" },
  { name: "Phone Numbers", icon: PhoneForwarded, path: "PBXPhoneNumbers" },
  { name: "Route by ANI", icon: Radio, path: "PBXRouteByAni" },
  { name: "SIP Trunks", icon: Briefcase, path: "SIPTrunks" },
  { name: "E911 Review", icon: Mail, path: "E911Review" },
  {
    name: "Reports",
    icon: BarChart3,
    children: [
      ...PBX_OPERATIONAL_REPORT_PAGES.map((def) => ({
        name: def.title,
        icon: PBX_REPORT_NAV_ICONS[def.id] || BarChart3,
        path: def.page,
      })),
      { name: "MOS Scores", icon: LineChart, path: "PBXMosScores" },
    ],
  },
  { name: "Call Logs", icon: Phone, path: "CallLogs" },
  { name: "Voicemail", icon: Voicemail, path: "Voicemail" },
  { name: "SIP ALG", icon: Settings, path: "SIPALG" },
];

/** @deprecated Use PBX_NAV — kept for callers that flatten grouped items. */
export const PBX_NAV_GROUPS = [{ label: "PBX", items: PBX_NAV }];

/** Account-wide PBX screens — no global domain selector (domain is picked on-page or not needed). */
export const PBX_PAGES_NO_DOMAIN_BAR = new Set([
  "PBXDomains",
  "E911Reports",
  "PBXReportE911",
  "PBXReports",
  "PBXMosScores",
  "CallLogs",
  "SIPTrunks",
  ...PBX_OPERATIONAL_REPORT_PAGES.filter((def) => def.requiresDomain === false).map(
    (def) => def.page
  ),
]);

export const ADMIN_BOTTOM_NAV = [
  { name: "Settings", icon: Settings, path: "Settings", adminOnly: true },
  {
    name: "Portal Users",
    icon: UserCog,
    path: "UserManagement",
    adminOnly: true,
  },
];

/** Admin nav items visible in the current environment. */
export function getAdminBottomNav(isProduction = import.meta.env.PROD) {
  return ADMIN_BOTTOM_NAV.filter((item) => !item.devOnly || !isProduction);
}

/** Flatten PBX nav for command palette and search. */
export function flattenPbxNav(items = PBX_NAV) {
  const out = [];
  for (const item of items) {
    if (item.children?.length) {
      out.push(...item.children);
    } else if (item.path) {
      out.push(item);
    }
  }
  return out;
}
