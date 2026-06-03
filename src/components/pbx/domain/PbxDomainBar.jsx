import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Globe, Loader2 } from 'lucide-react';

export default function PbxDomainBar({ currentPageName }) {
  const { domain, setDomain, domains, isLoading, error } = usePbxDomain();
  const onDomainsPage = currentPageName === 'PBXDomains';

  return (
    <div className="bg-[#0D1B2E]/95 border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider font-semibold shrink-0">
        <Globe className="h-3.5 w-3.5" />
        Selected domain
      </div>
      <p className="text-[10px] text-white/50 sm:hidden -mt-2">Your portal choice — not from SkySwitch</p>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 min-w-0">
        {isLoading ? (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading domains…
          </span>
        ) : error ? (
          <span className="text-sm text-red-300">Failed to load domains</span>
        ) : (
          <Select value={domain || undefined} onValueChange={(v) => setDomain(v)}>
            <SelectTrigger className="w-full sm:max-w-md bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="Select domain" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((d) => (
                <SelectItem key={d.domain} value={d.domain}>
                  {d.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {!onDomainsPage && (
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
