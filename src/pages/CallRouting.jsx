import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import RoutePhoneSheet from '@/components/pbx/routing/RoutePhoneSheet';
import UnroutePhoneAction from '@/components/pbx/routing/UnroutePhoneAction';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function CallRouting() {
  return (
    <PbxShell title="Call Routing" description="Phone number routes for the selected domain">
      {({ domain }) => <RoutingContent domain={domain} />}
    </PbxShell>
  );
}

function RoutingContent({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [enabledFilter, setEnabledFilter] = useState('all');
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [editRow, setEditRow] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-call-routing', domain],
    queryFn: () => pbxApi.callRouting(domain),
    enabled: !!domain,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-call-routing', domain] });

  const rows = useMemo(() => {
    const list = (data?.routes || []).map((item) => ({
      phone_number: item.phone_number,
      type: item.type,
      treatment: item.route?.treatment,
      domain: item.route?.domain,
      subscriber: item.route?.subscriber,
      enable: item.route?.enable,
      error: item.error,
      _raw: item,
    }));

    const typeOptions = uniqueFieldValues(list, 'type');

    return {
      typeOptions,
      filtered: list.filter((row) => {
        if (!matchSearch(row, search, ['phone_number', 'subscriber', 'treatment'])) return false;
        if (!matchSelect(row.type, typeFilter)) return false;
        if (enabledFilter === 'yes' && !row.enable) return false;
        if (enabledFilter === 'no' && row.enable) return false;
        if (errorsOnly && !row.error) return false;
        return true;
      }),
    };
  }, [data, search, typeFilter, enabledFilter, errorsOnly]);

  const { filtered: filteredRows, typeOptions } = rows;

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const columns = [
    { key: 'phone_number', label: 'Phone' },
    { key: 'type', label: 'Type' },
    { key: 'treatment', label: 'Treatment' },
    { key: 'domain', label: 'Domain' },
    { key: 'subscriber', label: 'Subscriber' },
    { key: 'enable', label: 'Enabled' },
    { key: 'error', label: 'Error' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <PermissionGate pbxAction="manageRouting" fallback="—">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditRow(row)}>
              Edit
            </Button>
            <UnroutePhoneAction phoneNumber={row.phone_number} onSuccess={refresh} />
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search phone or subscriber…"
      >
        <PbxFilterSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          options={typeOptions}
          allLabel="All types"
        />
        <PbxFilterSelect
          value={enabledFilter}
          onValueChange={setEnabledFilter}
          options={[
            { value: 'yes', label: 'Enabled' },
            { value: 'no', label: 'Disabled' },
          ]}
          allLabel="Any status"
        />
        <Button
          type="button"
          size="sm"
          variant={errorsOnly ? 'default' : 'outline'}
          onClick={() => setErrorsOnly((v) => !v)}
        >
          Errors only
        </Button>
      </PbxListToolbar>
      <PbxDataTable
        columns={columns}
        rows={filteredRows}
        emptyMessage="No routed phone numbers for this domain."
      />
      <RoutePhoneSheet
        phoneNumber={editRow?.phone_number || ''}
        initialData={editRow?._raw || editRow}
        domain={domain}
        open={!!editRow}
        onOpenChange={(open) => !open && setEditRow(null)}
        onSuccess={refresh}
      />
    </div>
  );
}
