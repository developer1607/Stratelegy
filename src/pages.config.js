/**
 * Central page registry — maps route names to page components.
 * Set `mainPage` to the landing page for authenticated users at `/`.
 */
import Accounts from "./pages/Accounts";
import Activities from "./pages/Activities";
import Calendar from "./pages/Calendar";
import CallLogs from "./pages/CallLogs";
import CallRouting from "./pages/CallRouting";
import Contacts from "./pages/Contacts";
import Dashboard from "./pages/Dashboard";
import E911Reports from "./pages/E911Reports";
import E911Review from "./pages/E911Review";
import EndpointControl from "./pages/EndpointControl";
import Extensions from "./pages/Extensions";
import KnowledgeBase from "./pages/KnowledgeBase";
import Leads from "./pages/Leads";
import OfflineEndpoints from "./pages/OfflineEndpoints";
import Opportunities from "./pages/Opportunities";
import PBXDashboard from "./pages/PBXDashboard";
import PBXDomains from "./pages/PBXDomains";
import PBXPhoneNumbers from "./pages/PBXPhoneNumbers";
import PBXMakeCall from "./pages/PBXMakeCall";
import PBXMosScores from "./pages/PBXMosScores";
import PBXReports from "./pages/PBXReports";
import PBXRouteByAni from "./pages/PBXRouteByAni";
import {
  PBXReportDeviceMonitoring,
  PBXReportE911,
  PBXReportOfflineEndpoints,
} from "./pages/pbx/operationalReports";
import Profile from "./pages/Profile";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import SIPALG from "./pages/SIPALG";
import SIPTrunks from "./pages/SIPTrunks";
import SupportDashboard from "./pages/SupportDashboard";
import SupportTicketDetail from "./pages/SupportTicketDetail";
import SupportTickets from "./pages/SupportTickets";
import UserManagement from "./pages/UserManagement";
import Voicemail from "./pages/Voicemail";
import __Layout from "./Layout.jsx";

export const PAGES = {
  Accounts,
  Activities,
  Calendar,
  CallLogs,
  CallRouting,
  Contacts,
  Dashboard,
  E911Reports,
  E911Review,
  EndpointControl,
  Extensions,
  KnowledgeBase,
  Leads,
  OfflineEndpoints,
  Opportunities,
  PBXDashboard,
  PBXDomains,
  PBXPhoneNumbers,
  PBXMakeCall,
  PBXMosScores,
  PBXReports,
  PBXReportOfflineEndpoints,
  PBXReportDeviceMonitoring,
  PBXReportE911,
  PBXRouteByAni,
  Profile,
  Reports,
  Settings,
  SIPALG,
  SIPTrunks,
  SupportDashboard,
  SupportTicketDetail,
  SupportTickets,
  UserManagement,
  Voicemail,
};

export const pagesConfig = {
  mainPage: "Dashboard",
  Pages: PAGES,
  Layout: __Layout,
};
