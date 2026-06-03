import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import AddE911Dialog from '@/components/pbx/e911/AddE911Dialog';
import E911ProvisionSheet from '@/components/pbx/e911/E911ProvisionSheet';
import E911UnprovisionAction from '@/components/pbx/e911/E911UnprovisionAction';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function E911Review() {
  return (
    <PbxShell title="E911 Review" description="Provisioned E911 endpoints" requiresDomain={false}>
      <E911Content />
    </PbxShell>
  );
}

function E911Content() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [routingFilter, setRoutingFilter] = useState('all');
  const [editPhone, setEditPhone] = useState(null);

  const { data = [], isLoading, error } = useQuery({
    queryKey: ['pbx-e911'],
    queryFn: () => pbxApi.e911(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-e911'] });

  const editRecord = editPhone ? data.find((item) => item.phone_number === editPhone) : null;

  const { rows, stateOptions, routingOptions } = useMemo(() => {
    const list = data.map((item) => ({
      phone_number: item.phone_number,
      city: item.location?.address?.civic_address?.city,
      state: item.location?.address?.civic_address?.state,
      street: `${item.location?.address?.civic_address?.street_number || ''} ${item.location?.address?.civic_address?.street_name || ''}`.trim(),
      zip_code: item.location?.address?.civic_address?.zip_code,
      routing_status: item.location?.level_of_service?.routing_status,
      name: item.location?.address?.civic_address?.name,
    }));

    return {
      stateOptions: uniqueFieldValues(list, 'state'),
      routingOptions: uniqueFieldValues(list, 'routing_status'),
      rows: list.filter((row) => {
        if (!matchSearch(row, search, ['phone_number', 'city', 'name', 'street', 'zip_code'])) return false;
        if (!matchSelect(row.state, stateFilter)) return false;
        if (!matchSelect(row.routing_status, routingFilter)) return false;
        return true;
      }),
    };
  }, [data, search, stateFilter, routingFilter]);

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const columns = [
    { key: 'phone_number', label: 'Phone' },
    { key: 'name', label: 'Name' },
    { key: 'street', label: 'Street' },
    { key: 'city', label: 'City' },
    { key: 'state', label: 'State' },
    { key: 'zip_code', label: 'ZIP' },
    { key: 'routing_status', label: 'Routing' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <PermissionGate pbxAction="manageE911" fallback="—">
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setEditPhone(row.phone_number)}>
              Edit
            </Button>
            <E911UnprovisionAction phoneNumber={row.phone_number} onSuccess={refresh} />
          </div>
        </PermissionGate>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PbxListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search phone, city, or name…">
        <PbxFilterSelect
          value={stateFilter}
          onValueChange={setStateFilter}
          options={stateOptions}
          allLabel="All states"
        />
        <PbxFilterSelect
          value={routingFilter}
          onValueChange={setRoutingFilter}
          options={routingOptions}
          allLabel="All routing"
        />
        <PermissionGate pbxAction="manageE911">
          <AddE911Dialog onSuccess={refresh} />
        </PermissionGate>
      </PbxListToolbar>
      <PbxDataTable columns={columns} rows={rows} emptyMessage="No E911 endpoints provisioned." />
      <E911ProvisionSheet
        phoneNumber={editPhone || ''}
        initialData={editRecord}
        open={!!editPhone}
        onOpenChange={(open) => !open && setEditPhone(null)}
        onSuccess={refresh}
      />
    </div>
  );
}
