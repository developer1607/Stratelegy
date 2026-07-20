import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { useAuth } from "@/lib/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import PbxNavGroup from "@/components/pbx/PbxNavGroup";
import SidebarNavSection from "@/components/layout/SidebarNavSection";
import { PbxDomainProvider } from "@/hooks/usePbxDomain";
import PbxDomainBar from "@/components/pbx/domain/PbxDomainBar";
import { CRM_PAGES, SUPPORT_PAGES, PBX_PAGES, canViewPbxDomains, isPbxDomainRestricted } from "@/lib/permissions";
import {
  CRM_NAV,
  SUPPORT_NAV,
  PBX_NAV,
  getAdminBottomNav,
  PBX_PAGES_NO_DOMAIN_BAR,
} from "@/lib/navConfig";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import HeaderQuickActions from "@/components/layout/HeaderQuickActions";
import CommandPalette from "@/components/layout/CommandPalette";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Layout({ children, currentPageName }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("stratelegy-sidebar-collapsed") === "true";
  });
  const {
    user: currentUser,
    logout,
    isAuthenticated,
    navigateToLogin,
  } = useAuth();
  const {
    permissions,
    isLoading: isPermissionsLoading,
    isAdmin,
    hasCrmAccess,
    hasSupportAccess,
    hasPbxAccess,
    canAccessPage,
  } = usePermissions();

  const filterMenu = (items) =>
    items.filter((item) => {
      if (item.hidden) return false;
      if (item.adminOnly) return isAdmin;
      return canAccessPage(item.path);
    });

  const crmItems = filterMenu(CRM_NAV);
  const supportItems = filterMenu(SUPPORT_NAV);
  const hasPbxNav = PBX_NAV.some((item) => {
    if (item.children?.length) {
      return item.children.some((child) => !child.hidden && canAccessPage(child.path));
    }
    if (item.hidden) return false;
    if (item.adminOnly) return isAdmin;
    return canAccessPage(item.path);
  });

  const bottomMenuItems = isAdmin ? getAdminBottomNav() : [];

  const isActive = (itemPath) => currentPageName === itemPath;

  const navLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
      isActive(path)
        ? "bg-[#F07020] text-white"
        : "hover:bg-white/10 text-white/80 hover:text-white"
    }`;

  useEffect(() => {
    window.localStorage.setItem(
      "stratelegy-sidebar-collapsed",
      String(sidebarCollapsed),
    );
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (isPermissionsLoading || !currentUser) return;
    if (!canAccessPage(currentPageName)) return;
    if (currentPageName === "UserManagement" || currentPageName === "UserDetail" || currentPageName === "Profile")
      return;

    const isCrmPage = CRM_PAGES.includes(currentPageName);
    const isSupportPage = SUPPORT_PAGES.includes(currentPageName);
    const isPbxPage = PBX_PAGES.includes(currentPageName);

    if (isCrmPage && !hasCrmAccess && hasSupportAccess) {
      window.location.href = createPageUrl("SupportDashboard");
    } else if (isSupportPage && !hasSupportAccess && hasCrmAccess) {
      window.location.href = createPageUrl("Dashboard");
    } else if (isPbxPage && !hasPbxAccess && hasCrmAccess) {
      window.location.href = createPageUrl("Dashboard");
    } else if (isPbxPage && !hasPbxAccess && hasSupportAccess) {
      window.location.href = createPageUrl("SupportDashboard");
    }
  }, [
    currentUser,
    currentPageName,
    isPermissionsLoading,
    hasCrmAccess,
    hasSupportAccess,
    hasPbxAccess,
    canAccessPage,
  ]);

  if (isPermissionsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const showPbxDomainBar =
    hasPbxAccess &&
    PBX_PAGES.includes(currentPageName) &&
    (canViewPbxDomains(permissions) || isPbxDomainRestricted(permissions)) &&
    (!PBX_PAGES_NO_DOMAIN_BAR.has(currentPageName) ||
      isPbxDomainRestricted(permissions));

  const layoutBody = (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`app-sidebar-space relative h-full flex-shrink-0 transition-[width] duration-300 ease-in-out ${
          sidebarCollapsed ? "w-0" : "w-64"
        }`}
      >
        <div
          className={`app-sidebar-panel absolute inset-y-0 left-0 z-30 w-64 bg-[#0D1B2E] text-white flex flex-col transition-transform duration-300 ease-in-out ${
            sidebarCollapsed ? "-translate-x-full" : "translate-x-0"
          }`}
        >
          <button
            type="button"
            onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
            className="absolute right-0 top-5 z-40 inline-flex h-9 w-9 translate-x-1/2 items-center justify-center rounded-full border border-slate-600 bg-[#0D1B2E] text-white shadow-md transition-colors hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            aria-label={sidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
            title={sidebarCollapsed ? "Open sidebar" : "Collapse sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        <div className="p-6 flex items-center flex-shrink-0">
          <img
            src="/logo.svg"
            alt="Stratelegy"
            className="h-10 w-auto object-contain"
          />
        </div>

        <nav className="sidebar-scrollbar min-h-0 flex-1 px-3 flex flex-col overflow-y-scroll">
          {crmItems.length > 0 && (
            <SidebarNavSection
              label="Sales"
              isActive={CRM_PAGES.includes(currentPageName)}
            >
              {crmItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={navLinkClass(item.path)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </SidebarNavSection>
          )}

          {supportItems.length > 0 && (
            <SidebarNavSection
              label="Support"
              isActive={SUPPORT_PAGES.includes(currentPageName)}
            >
              {supportItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={navLinkClass(item.path)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </SidebarNavSection>
          )}

          {hasPbxNav && (
            <SidebarNavSection
              label="PBX"
              isActive={PBX_PAGES.includes(currentPageName)}
            >
              {PBX_NAV.map((item) => (
                <PbxNavGroup
                  key={item.path || item.name}
                  item={item}
                  canAccessPage={canAccessPage}
                  isAdmin={isAdmin}
                  currentPageName={currentPageName}
                  navLinkClass={navLinkClass}
                />
              ))}
            </SidebarNavSection>
          )}

          {bottomMenuItems.length > 0 && (
            <div className="mt-auto pt-4 border-t border-white/10 space-y-1 pb-4">
              {bottomMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={createPageUrl(item.path)}
                  className={navLinkClass(item.path)}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
        </div>
      </div>

      <div className="min-w-0 flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-2">
              {sidebarCollapsed ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSidebarCollapsed(false)}
                  aria-label="Open sidebar"
                  title="Open sidebar"
                  className="shrink-0"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              ) : null}
              <CommandPalette canAccessPage={canAccessPage} isAdmin={isAdmin} />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <HeaderQuickActions
                user={isAuthenticated ? currentUser : null}
                canViewSupportTickets={canAccessPage("SupportTickets")}
              />
              {isAuthenticated && currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 sm:gap-2"
                    >
                      <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                        Hi, {currentUser.full_name || currentUser.email}
                      </span>
                      <Avatar className="w-8 h-8">
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {(currentUser.full_name || currentUser.email)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl("Profile")}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToLogin()}
                >
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </header>

        {showPbxDomainBar && <PbxDomainBar currentPageName={currentPageName} />}

        <main className="app-scrollbar min-h-0 flex-1 overflow-auto bg-[#F4F6F9]">
          {children}
        </main>
      </div>
    </div>
  );

  if (hasPbxAccess) {
    return (
      <PbxDomainProvider currentPageName={currentPageName}>
        {layoutBody}
      </PbxDomainProvider>
    );
  }

  return layoutBody;
}
