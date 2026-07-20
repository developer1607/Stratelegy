import { UserCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';
import {
  CRM_NAV,
  SUPPORT_NAV,
  PBX_NAV,
  flattenPbxNav,
  PBX_PAGES_NO_DOMAIN_BAR,
  getAdminBottomNav,
} from '@/lib/navConfig';
import { PBX_PAGES } from '@/lib/permissions';

const PBX_DOMAIN_STORAGE_KEY = 'pbx_selected_domain';

function filterNavItems(items, canAccessPage, isAdmin) {
  return items.filter((item) => {
    if (item.hidden) return false;
    if (item.adminOnly) return isAdmin;
    return canAccessPage(item.path);
  });
}

/** @returns {{ label: string, items: Array<{ name: string, path: string, icon: import('react').ComponentType, keywords: string }> }[]} */
export function buildCommandPaletteGroups({ canAccessPage, isAdmin }) {
  /** @type {{ label: string, items: object[] }[]} */
  const groups = [];

  const crmItems = filterNavItems(CRM_NAV, canAccessPage, isAdmin).map((item) => ({
    ...item,
    keywords: `sales crm ${item.name} ${item.path}`.toLowerCase(),
  }));
  if (crmItems.length) groups.push({ label: 'Sales', items: crmItems });

  const supportItems = filterNavItems(SUPPORT_NAV, canAccessPage, isAdmin).map((item) => ({
    ...item,
    keywords: `support ${item.name} ${item.path}`.toLowerCase(),
  }));
  if (supportItems.length) groups.push({ label: 'Support', items: supportItems });

  const pbxItems = filterNavItems(flattenPbxNav(PBX_NAV), canAccessPage, isAdmin).map((item) => ({
    ...item,
    keywords: `pbx ${item.name} ${item.path}`.toLowerCase(),
  }));
  if (pbxItems.length) groups.push({ label: 'PBX', items: pbxItems });

  const adminItems = filterNavItems(getAdminBottomNav(), canAccessPage, isAdmin).map((item) => ({
    ...item,
    keywords: `admin ${item.name} ${item.path}`.toLowerCase(),
  }));
  if (adminItems.length) groups.push({ label: 'Admin', items: adminItems });

  if (canAccessPage('Profile')) {
    groups.push({
      label: 'Account',
      items: [
        {
          name: 'Profile',
          path: 'Profile',
          icon: UserCircle,
          keywords: 'account profile settings user',
        },
      ],
    });
  }

  return groups;
}

export function filterCommandPaletteGroups(groups, query) {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.path.toLowerCase().includes(q) ||
          item.keywords.includes(q)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

export function buildPalettePageUrl(pageName) {
  const base = createPageUrl(pageName);
  if (!PBX_PAGES.includes(pageName) || PBX_PAGES_NO_DOMAIN_BAR.has(pageName)) {
    return base;
  }
  if (typeof window === 'undefined') return base;
  const domain = localStorage.getItem(PBX_DOMAIN_STORAGE_KEY);
  if (!domain) return base;
  return `${base}?domain=${encodeURIComponent(domain)}`;
}
