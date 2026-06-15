import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { PBX_PAGES } from '@/lib/permissions';
import { canViewPbxDomains } from '@/lib/permissions';
import { PBX_PAGES_NO_DOMAIN_BAR } from '@/lib/navConfig';
import { domainsMatch, findDomainRecord } from '@/lib/pbxDomain';
import { usePermissions } from '@/hooks/usePermissions';

const STORAGE_KEY = 'pbx_selected_domain';

const PbxDomainContext = createContext(null);

export function PbxDomainProvider({ children, currentPageName }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { permissions } = usePermissions();
  const isPbxPage = PBX_PAGES.includes(currentPageName);
  const canListDomains = canViewPbxDomains(permissions);
  const syncDomainToUrl = isPbxPage && !PBX_PAGES_NO_DOMAIN_BAR.has(currentPageName);

  const urlDomain = searchParams.get('domain') || '';
  const [domain, setDomainState] = useState(
    () => urlDomain || localStorage.getItem(STORAGE_KEY) || ''
  );

  const {
    data: domains = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-domains'],
    queryFn: () => pbxApi.domains(),
    staleTime: 5 * 60 * 1000,
    enabled: isPbxPage && canListDomains,
  });

  const setDomain = useCallback(
    (value, { updateUrl = syncDomainToUrl } = {}) => {
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
    [searchParams, setSearchParams, syncDomainToUrl]
  );

  useEffect(() => {
    if (!urlDomain || urlDomain === domain) return;
    setDomainState(urlDomain);
    localStorage.setItem(STORAGE_KEY, urlDomain);
  }, [urlDomain, domain]);

  useEffect(() => {
    if (!canListDomains || !domains.length) return;
    const exists = findDomainRecord(domains, domain);
    if (!domain || !exists) {
      const urlMatch = urlDomain ? findDomainRecord(domains, urlDomain) : null;
      const next = urlMatch?.domain || domains[0]?.domain || '';
      if (next && !domainsMatch(next, domain))
        setDomain(next, { updateUrl: syncDomainToUrl && !urlDomain });
    }
  }, [canListDomains, domains, domain, urlDomain, setDomain, syncDomainToUrl]);

  const value = useMemo(
    () => ({ domain, setDomain, domains, isLoading, error, isPbxPage, canListDomains }),
    [domain, setDomain, domains, isLoading, error, isPbxPage, canListDomains]
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
