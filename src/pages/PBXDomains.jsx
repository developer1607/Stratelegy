import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, ExternalLink, Globe, Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { domainsMatch, findDomainRecord } from '@/lib/pbxDomain';
import PbxShell, { PbxDataTable, PbxError } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export default function PBXDomains() {
  const { domain: selectedDomain, setDomain, domains, isLoading, error } = usePbxDomain();
  const [search, setSearch] = useState('');
  const [resellerFilter, setResellerFilter] = useState('all');

  const selectedRecord = useMemo(
    () => findDomainRecord(domains, selectedDomain),
    [domains, selectedDomain]
  );

  const resellerOptions = useMemo(() => {
    const set = new Set(domains.map((d) => d.reseller).filter(Boolean));
    return [...set].sort();
  }, [domains]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = domains;
    if (resellerFilter !== 'all') {
      list = list.filter((d) => String(d.reseller || '') === resellerFilter);
    }
    if (q) {
      list = list.filter((d) => {
        const haystack = [d.domain, d.description, d.name, d.reseller]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return [...list].sort((a, b) => {
      const aSelected = domainsMatch(a.domain, selectedDomain);
      const bSelected = domainsMatch(b.domain, selectedDomain);
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      return (a.domain || '').localeCompare(b.domain || '', undefined, { sensitivity: 'base' });
    });
  }, [domains, search, resellerFilter, selectedDomain]);

  const selectedHiddenBySearch = Boolean(
    selectedRecord &&
      (search.trim() || resellerFilter !== 'all') &&
      !filtered.some((d) => domainsMatch(d.domain, selectedDomain))
  );

  const rows = filtered.map((item) => ({
    domain: item.domain,
    description: item.description || '—',
    reseller: item.reseller || '—',
    isSelected: domainsMatch(item.domain, selectedDomain),
  }));

  const columns = [
    {
      key: 'domain',
      label: 'Domain',
      render: (row) => (
        <div className="flex items-center gap-2 min-w-0">
          <Globe className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="font-mono text-sm font-medium truncate">{row.domain}</span>
          {row.isSelected ? (
            <Badge className="bg-[#F07020] hover:bg-[#F07020] shrink-0">Selected</Badge>
          ) : null}
        </div>
      ),
    },
    { key: 'description', label: 'Description' },
    { key: 'reseller', label: 'Reseller' },
    {
      key: 'actions',
      label: '',
      render: (row) => (
        <div className="flex flex-wrap gap-2 justify-end">
          <Button
            size="sm"
            variant={row.isSelected ? 'secondary' : 'default'}
            className={row.isSelected ? '' : 'bg-[#F07020] hover:bg-[#e06518]'}
            onClick={() => setDomain(row.domain)}
            disabled={row.isSelected}
          >
            {row.isSelected ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Selected
              </>
            ) : (
              'Select domain'
            )}
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link
              to={`${createPageUrl('PBXDashboard')}?domain=${encodeURIComponent(row.domain)}`}
              onClick={() => !row.isSelected && setDomain(row.domain)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Dashboard
            </Link>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PbxShell
      title="PBX Domains"
      description={`${domains.length} domain(s)`}
      requiresDomain={false}
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading domains…
        </div>
      ) : error ? (
        <PbxError error={error} />
      ) : domains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No PBX domains found</p>
            <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
              No domains were found for this account. Contact your administrator if you expect domains to appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {selectedRecord ? (
            <Card className="border-[#F07020]/40 bg-gradient-to-r from-orange-50 to-white shadow-sm">
              <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#F07020]">
                    Your selected domain
                  </p>
                  <p className="font-mono text-lg font-semibold text-gray-900 mt-1 truncate">
                    {selectedRecord.domain}
                  </p>
                  {selectedRecord.description ? (
                    <p className="text-sm text-gray-600 mt-1">{selectedRecord.description}</p>
                  ) : null}
                  {selectedRecord.reseller ? (
                    <p className="text-xs text-gray-500 mt-1">Reseller: {selectedRecord.reseller}</p>
                  ) : null}
                </div>
                <Button asChild className="bg-[#F07020] hover:bg-[#e06518] shrink-0">
                  <Link
                    to={`${createPageUrl('PBXDashboard')}?domain=${encodeURIComponent(selectedRecord.domain)}`}
                  >
                    Open PBX dashboard
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-4 text-sm text-amber-900">
                Select a domain below — saved in this browser for domain-scoped PBX screens.
              </CardContent>
            </Card>
          )}

          {selectedHiddenBySearch && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="py-3 text-sm text-amber-900 flex flex-wrap items-center justify-between gap-2">
                <span>
                  Selected domain <span className="font-mono font-medium">{selectedRecord.domain}</span> is hidden
                  by filters.
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    setResellerFilter('all');
                  }}
                >
                  Clear filters
                </Button>
              </CardContent>
            </Card>
          )}

          <PbxListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search domain or description…"
          >
            {resellerOptions.length > 0 && (
              <PbxFilterSelect
                value={resellerFilter}
                onValueChange={setResellerFilter}
                options={resellerOptions}
                allLabel="All resellers"
                className="w-[180px]"
              />
            )}
            <span className="text-sm text-gray-500 whitespace-nowrap">
              {filtered.length} of {domains.length}
            </span>
          </PbxListToolbar>

          <PbxDataTable
            columns={columns}
            rows={rows}
            rowClassName={(row) =>
              row.isSelected ? 'bg-orange-50 hover:bg-orange-50 ring-1 ring-inset ring-[#F07020]/25' : ''
            }
            emptyMessage="No domains match your filters."
          />
        </div>
      )}
    </PbxShell>
  );
}
