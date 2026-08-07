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
  Route,
  Layers,
  Radio,
  Globe,
  PhoneForwarded,
  Settings,
  Mail,
  LineChart,
  ShieldAlert,
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

/**
 * Flat PBX sidebar — each item is permission-gated.
 * Reports opens the tabbed hub (Voicemail lives there as a tab, not a sidebar child).
 * Troubleshooting is a single top-level item (not a dropdown).
 */
export const PBX_NAV = [
  { name: "Domains", icon: Globe, path: "PBXDomains" },
  { name: "Endpoint Control", icon: Users, path: "EndpointControl" },
  { name: "Offline Endpoints", icon: Activity, path: "OfflineEndpoints" },
  { name: "SIP ALG", icon: Settings, path: "SIPALG" },
  { name: "E911", icon: Mail, path: "PBXReportE911" },
  { name: "Reports", icon: BarChart3, path: "PBXReports" },
  { name: "MOS Scores", icon: LineChart, path: "PBXMosScores" },
  { name: "Troubleshooting", icon: ShieldAlert, path: "Troubleshooting" },
  { name: "SIP Trunks", icon: Briefcase, path: "SIPTrunks" },
  { name: "Entitlements", icon: Layers, path: "Entitlements", hidden: true },
  { name: "Call Routing", icon: Route, path: "CallRouting", hidden: true },
  { name: "Phone Numbers", icon: PhoneForwarded, path: "PBXPhoneNumbers", hidden: true },
  { name: "Route by ANI", icon: Radio, path: "PBXRouteByAni", hidden: true },
];

/** @deprecated Use PBX_NAV — kept for callers that flatten grouped items. */
export const PBX_NAV_GROUPS = [{ label: "PBX", items: PBX_NAV }];

/** Account-wide PBX screens — no global domain selector (domain is picked on-page or not needed). */
export const PBX_PAGES_NO_DOMAIN_BAR = new Set([
  "PBXDomains",
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

/** Report hub tab ids — keep in sync with PBXReports.jsx */
export const PBX_REPORT_TAB_IDS = [
  "offline-endpoint",
  "device-monitoring",
  "domain-export",
  "e911-review",
  "sip-alg",
  "sip-trunk",
  "vulnerability-check",
  "voicemail",
];
