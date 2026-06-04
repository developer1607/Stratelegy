import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { useAuth } from '@/lib/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import PbxNavGroup from '@/components/pbx/PbxNavGroup';
import { PbxDomainProvider } from '@/hooks/usePbxDomain';
import PbxDomainBar from '@/components/pbx/domain/PbxDomainBar';
import {
  CRM_PAGES,
  SUPPORT_PAGES,
  PBX_PAGES,
} from '@/lib/permissions';
import { CRM_NAV, SUPPORT_NAV, PBX_NAV_GROUPS, getAdminBottomNav, PBX_PAGES_NO_DOMAIN_BAR } from '@/lib/navConfig';
import { ChevronDown } from 'lucide-react';
import HeaderQuickActions from '@/components/layout/HeaderQuickActions';
import CommandPalette from '@/components/layout/CommandPalette';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Layout({ children, currentPageName }) {
  const { user: currentUser, logout, isAuthenticated, navigateToLogin } = useAuth();
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
      if (item.adminOnly) return isAdmin;
      return canAccessPage(item.path);
    });

  const crmItems = filterMenu(CRM_NAV);
  const supportItems = filterMenu(SUPPORT_NAV);
  const hasPbxNav = PBX_NAV_GROUPS.some((group) =>
    group.items.some((item) => {
      if (item.adminOnly) return isAdmin;
      return canAccessPage(item.path);
    })
  );

  const bottomMenuItems = isAdmin ? getAdminBottomNav() : [];

  const isActive = (itemPath) => currentPageName === itemPath;

  const navLinkClass = (path) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${isActive(path) ? 'bg-[#F07020] text-white' : 'hover:bg-white/10 text-white/80 hover:text-white'
    }`;

  useEffect(() => {
    if (isPermissionsLoading || !currentUser) return;
    if (!canAccessPage(currentPageName)) return;
    if (currentPageName === 'UserManagement' || currentPageName === 'Profile') return;

    const isCrmPage = CRM_PAGES.includes(currentPageName);
    const isSupportPage = SUPPORT_PAGES.includes(currentPageName);
    const isPbxPage = PBX_PAGES.includes(currentPageName);

    if (isCrmPage && !hasCrmAccess && hasSupportAccess) {
      window.location.href = createPageUrl('SupportDashboard');
    } else if (isSupportPage && !hasSupportAccess && hasCrmAccess) {
      window.location.href = createPageUrl('Dashboard');
    } else if (isPbxPage && !hasPbxAccess && hasCrmAccess) {
      window.location.href = createPageUrl('Dashboard');
    } else if (isPbxPage && !hasPbxAccess && hasSupportAccess) {
      window.location.href = createPageUrl('SupportDashboard');
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
    !PBX_PAGES_NO_DOMAIN_BAR.has(currentPageName);

  const layoutBody = (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-[#0D1B2E] text-white flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center flex-shrink-0">
          <img src="/logo.svg" alt="Stratelegy" className="h-10 w-auto object-contain" />
        </div>

        <nav className="flex-1 px-3 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {crmItems.length > 0 && (
            <>
              <div className="px-4 mb-2 mt-2">
                <span className="text-xs text-[#F07020] uppercase tracking-widest font-semibold">Sales</span>
              </div>
              {crmItems.map((item) => (
                <Link key={item.path} to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </>
          )}

          {supportItems.length > 0 && (
            <>
              <div className="px-4 mb-2 mt-4">
                <span className="text-xs text-[#F07020] uppercase tracking-widest font-semibold">Support</span>
              </div>
              {supportItems.map((item) => (
                <Link key={item.path} to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </>
          )}

          {hasPbxNav && (
            <>
              <div className="px-4 mb-2 mt-4">
                <span className="text-xs text-[#F07020] uppercase tracking-widest font-semibold">PBX</span>
              </div>
              {PBX_NAV_GROUPS.map((group) => (
                <PbxNavGroup
                  key={group.label}
                  label={group.label}
                  items={group.items}
                  canAccessPage={canAccessPage}
                  isAdmin={isAdmin}
                  currentPageName={currentPageName}
                  navLinkClass={navLinkClass}
                />
              ))}
            </>
          )}

          {bottomMenuItems.length > 0 && (
            <div className="mt-auto pt-4 border-t border-white/10 space-y-1 pb-4">
              {bottomMenuItems.map((item) => (
                <Link key={item.path} to={createPageUrl(item.path)} className={navLinkClass(item.path)}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 px-4 sm:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <CommandPalette canAccessPage={canAccessPage} isAdmin={isAdmin} />

            <div className="flex items-center gap-2 sm:gap-4">
              <HeaderQuickActions
                user={isAuthenticated ? currentUser : null}
                canViewSupportTickets={canAccessPage('SupportTickets')}
              />
              {isAuthenticated && currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-1 sm:gap-2">
                      <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                        Hi, {currentUser.full_name || currentUser.email}
                      </span>
                      <Avatar className="w-8 h-8">
                        <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-semibold text-sm">
                          {(currentUser.full_name || currentUser.email).charAt(0).toUpperCase()}
                        </div>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')}>Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="outline" size="sm" onClick={() => navigateToLogin()}>
                  Sign in
                </Button>
              )}
            </div>
          </div>
        </header>

        {showPbxDomainBar && <PbxDomainBar currentPageName={currentPageName} />}

        <main className="flex-1 overflow-auto bg-[#F4F6F9]">{children}</main>
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
