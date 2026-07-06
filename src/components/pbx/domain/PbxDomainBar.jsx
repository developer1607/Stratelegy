import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { usePermissions } from '@/hooks/usePermissions';
import { canViewPbxDomains } from '@/lib/permissions';
import PbxDomainSearchSelect from '@/components/pbx/domain/PbxDomainSearchSelect';
import { Button } from '@/components/ui/button';
import { Globe, Loader2 } from 'lucide-react';

export default function PbxDomainBar({ currentPageName }) {
  const { domain, setDomain, domains, isLoading, error, isDomainRestricted } = usePbxDomain();
  const { permissions, canAccessPage } = usePermissions();
  const onDomainsPage = currentPageName === 'PBXDomains';
  const showDomainsLink =
    !onDomainsPage &&
    canViewPbxDomains(permissions) &&
    canAccessPage('PBXDomains') &&
    !isDomainRestricted;

  return (
    <div className="bg-[#0D1B2E]/95 border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider font-semibold shrink-0">
        <Globe className="h-3.5 w-3.5" />
        {isDomainRestricted ? 'Assigned domain' : 'Selected domain'}
      </div>
      {isDomainRestricted && (
        <span className="text-[11px] text-amber-200/90 sm:ml-1">
          View-only — data is limited to your assigned domain(s)
        </span>
      )}
      <p className="text-[10px] text-white/50 sm:hidden -mt-2">
        {isDomainRestricted
          ? 'Choose one of your assigned domains'
          : 'Your portal choice — not from SkySwitch'}
      </p>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 min-w-0">
        {isLoading ? (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading domains…
          </span>
        ) : error ? (
          <span className="text-sm text-red-300">Failed to load domains</span>
        ) : isDomainRestricted && domains.length === 1 ? (
          <span className="text-sm text-white font-mono truncate">
            {domain || domains[0]?.domain}
          </span>
        ) : (
          <PbxDomainSearchSelect
            domains={domains}
            value={domain}
            onValueChange={setDomain}
            disabled={!domains.length}
          />
        )}

        {showDomainsLink && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 shrink-0"
          >
            <Link to={createPageUrl('PBXDomains')}>Browse all domains</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
