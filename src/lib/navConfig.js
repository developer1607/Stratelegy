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
  ShieldAlert,
  Phone,
  PhoneCall,
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
  FileDown,
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
  domainExport: FileDown,
  e911: Mail,
  sipAlg: Settings,
  sipTrunk: Briefcase,
  vulnerabilityCheck: ShieldAlert,
  voicemail: Voicemail,
};

export const PBX_NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "PBXDashboard" },
      { name: "Domains", icon: Globe, path: "PBXDomains" },
    ],
  },
  {
    label: "Users & Endpoints",
    items: [
      { name: "Extensions", icon: Hash, path: "Extensions" },
      { name: "Endpoint Control", icon: Users, path: "EndpointControl" },
      { name: "Offline Endpoints", icon: Activity, path: "OfflineEndpoints" },
    ],
  },
  {
    label: "Routing",
    items: [
      { name: "Call Routing", icon: Route, path: "CallRouting" },
      { name: "Phone Numbers", icon: PhoneForwarded, path: "PBXPhoneNumbers" },
      { name: "Route by ANI", icon: Radio, path: "PBXRouteByAni" },
      { name: "SIP Trunks", icon: Briefcase, path: "SIPTrunks" },
    ],
  },
  {
    label: "E911",
    items: [{ name: "E911 Review", icon: Mail, path: "E911Review" }],
  },
  {
    label: "Reports",
    items: [
      ...PBX_OPERATIONAL_REPORT_PAGES.map((def) => ({
        name: def.title,
        icon: PBX_REPORT_NAV_ICONS[def.id] || BarChart3,
        path: def.page,
      })),
      { name: "Report catalog", icon: BarChart3, path: "PBXReports" },
      { name: "MOS Scores", icon: LineChart, path: "PBXMosScores" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { name: "Call Logs", icon: Phone, path: "CallLogs" },
      { name: "Voicemail", icon: Voicemail, path: "Voicemail" },
      { name: "Troubleshooting", icon: ShieldAlert, path: "Troubleshooting" },
      { name: "SIP ALG", icon: Settings, path: "SIPALG" },
    ],
  },
  {
    label: "Actions",
    items: [{ name: "Make Call", icon: PhoneCall, path: "PBXMakeCall" }],
  },
];

/** Account-wide PBX screens — no global domain selector (domain is picked on-page or not needed). */
export const PBX_PAGES_NO_DOMAIN_BAR = new Set([
  "PBXDashboard",
  "PBXDomains",
  "E911Review",
  "E911Reports",
  "PBXReportE911",
  "PBXReports",
  "PBXMosScores",
  "CallLogs",
  "SIPTrunks",
  "PBXMakeCall",
  ...PBX_OPERATIONAL_REPORT_PAGES.map((def) => def.page),
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
