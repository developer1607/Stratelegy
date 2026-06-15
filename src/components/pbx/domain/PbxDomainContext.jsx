import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { PBX_PAGES } from '@/lib/permissions';
import { canViewPbxDomains } from '@/lib/permissions';
import { PBX_PAGES_NO_DOMAIN_BAR } from '@/lib/navConfig';
import { domainsMatch, findDomainRecord } from '@/lib/pbxDomain';
import {
  isPbxDomainRestricted,
  getAssignedPbxDomains,
  filterDomainsForUser,
} from '@shared/pbxDomainAccess.js';
import { usePermissions } from '@/hooks/usePermissions';

const STORAGE_KEY = 'pbx_selected_domain';

const PbxDomainContext = createContext(null);

export function PbxDomainProvider({ children, currentPageName }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { permissions } = usePermissions();
  const isPbxPage = PBX_PAGES.includes(currentPageName);
  const isDomainRestricted = isPbxDomainRestricted(permissions);
  const canListDomains =
    isPbxPage && (canViewPbxDomains(permissions) || isDomainRestricted);
  const syncDomainToUrl =
    isPbxPage &&
    (!PBX_PAGES_NO_DOMAIN_BAR.has(currentPageName) ||
      (isDomainRestricted && currentPageName !== 'PBXDashboard'));

  const urlDomain = searchParams.get('domain') || '';
  const [domain, setDomainState] = useState(
    () => urlDomain || localStorage.getItem(STORAGE_KEY) || ''
  );

  const assignedDomainKey = isDomainRestricted
    ? getAssignedPbxDomains(permissions).join('\0')
    : 'all';

  const {
    data: domainsRaw = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-domains', assignedDomainKey],
    queryFn: () => pbxApi.domains(),
    staleTime: 5 * 60 * 1000,
    enabled: canListDomains,
  });

  const domains = useMemo(
    () => filterDomainsForUser(permissions, domainsRaw),
    [permissions, domainsRaw]
  );

  const setDomain = useCallback(
    (value, { updateUrl = syncDomainToUrl } = {}) => {
      if (isDomainRestricted) {
        const allowed = getAssignedPbxDomains(permissions);
        if (value && !allowed.some((d) => domainsMatch(d, value))) return;
      }
      setDomainState(value);
      if (value) localStorage.setItem(STORAGE_KEY, value);
      else localStorage.removeItem(STORAGE_KEY);

      if (updateUrl) {
        const next = new URLSearchParams(searchParams);
        if (value) next.set('domain', value);
        else next.delete('domain');
        setSearchParams(next, { replace: true });
      }
    },
    [searchParams, setSearchParams, syncDomainToUrl, isDomainRestricted, permissions]
  );

  useEffect(() => {
    if (!isDomainRestricted) return;
    const allowed = getAssignedPbxDomains(permissions);
    if (urlDomain && !allowed.some((name) => domainsMatch(name, urlDomain))) {
      setDomain(allowed[0] || '', { updateUrl: syncDomainToUrl });
      return;
    }
    if (domain && !allowed.some((name) => domainsMatch(name, domain))) {
      setDomain(allowed[0] || '', { updateUrl: syncDomainToUrl });
    }
  }, [isDomainRestricted, permissions, domain, urlDomain, setDomain, syncDomainToUrl]);

  useEffect(() => {
    if (!urlDomain || urlDomain === domain) return;
    if (isDomainRestricted) {
      const allowed = getAssignedPbxDomains(permissions);
      if (!allowed.some((name) => domainsMatch(name, urlDomain))) return;
    }
    setDomainState(urlDomain);
    localStorage.setItem(STORAGE_KEY, urlDomain);
  }, [urlDomain, domain, isDomainRestricted, permissions]);

  useEffect(() => {
    if (!canListDomains || !domains.length) return;
    const exists = findDomainRecord(domains, domain);
    if (!domain || !exists) {
      const urlMatch = urlDomain ? findDomainRecord(domains, urlDomain) : null;
      const assigned = getAssignedPbxDomains(permissions);
      const next =
        urlMatch?.domain ||
        (assigned.length === 1 ? assigned[0] : null) ||
        domains[0]?.domain ||
        '';
      if (next && !domainsMatch(next, domain))
        setDomain(next, { updateUrl: syncDomainToUrl && !urlDomain });
    }
  }, [canListDomains, domains, domain, urlDomain, setDomain, syncDomainToUrl, permissions]);

  const value = useMemo(
    () => ({
      domain,
      setDomain,
      domains,
      isLoading,
      error,
      isPbxPage,
      canListDomains,
      isDomainRestricted,
    }),
    [domain, setDomain, domains, isLoading, error, isPbxPage, canListDomains, isDomainRestricted]
  );

  return <PbxDomainContext.Provider value={value}>{children}</PbxDomainContext.Provider>;
}

export function usePbxDomain() {
  const ctx = useContext(PbxDomainContext);
  if (!ctx) {
    throw new Error('usePbxDomain must be used within PbxDomainProvider');
  }
  return ctx;
}
