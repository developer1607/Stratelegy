import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import RouteByAniDialog from '@/components/pbx/routing/RouteByAniDialog';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function PBXRouteByAni() {
  return (
    <PbxShell title="Route by ANI" description="Provision and manage ANI-based routing rules">
      {({ domain }) => <RouteByAniContent domain={domain} />}
    </PbxShell>
  );
}

function RouteByAniContent({ domain }) {
  const [search, setSearch] = useState('');
  const [appFilter, setAppFilter] = useState('all');
  const [editRule, setEditRule] = useState(null);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['pbx-route-by-ani', domain],
    queryFn: () => pbxApi.routeByAni(domain),
    enabled: !!domain,
  });

  const { rows, appOptions } = useMemo(() => {
    const list = Array.isArray(data)
      ? data.map((r) => ({
          ani: r.ani ?? JSON.stringify(r),
          dnis: r.dnis,
          destination: r.destination,
          application: r.application,
          domain: r.domain || domain,
          _raw: r,
        }))
      : [];

    return {
      appOptions: uniqueFieldValues(list, 'application'),
      rows: list.filter((row) => {
        if (!matchSearch(row, search, ['ani', 'dnis', 'destination', 'application'])) return false;
        return matchSelect(row.application, appFilter);
      }),
    };
  }, [data, search, appFilter, domain]);

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const columns = [
    { key: 'ani', label: 'ANI' },
    { key: 'dnis', label: 'DNIS' },
    { key: 'destination', label: 'Destination' },
    { key: 'application', label: 'Application' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <PermissionGate pbxAction="manageRouteByAni" fallback="—">
          <Button size="sm" variant="outline" onClick={() => setEditRule(row._raw || row)}>
            Edit
          </Button>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PbxListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search ANI, DNIS, or destination…">
        <PbxFilterSelect
          value={appFilter}
          onValueChange={setAppFilter}
          options={appOptions}
          allLabel="All applications"
          className="w-[180px]"
        />
        <PermissionGate pbxAction="manageRouteByAni">
          <RouteByAniDialog domain={domain} />
        </PermissionGate>
      </PbxListToolbar>
      <PbxDataTable columns={columns} rows={rows} emptyMessage="No route-by-ANI rules for this domain." />
      <RouteByAniDialog
        domain={domain}
        initialData={editRule}
        open={!!editRule}
        onOpenChange={(open) => !open && setEditRule(null)}
      />
    </div>
  );
}
