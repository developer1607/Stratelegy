import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import AddE911Dialog from '@/components/pbx/e911/AddE911Dialog';
import E911ProvisionSheet from '@/components/pbx/e911/E911ProvisionSheet';
import E911UnprovisionAction from '@/components/pbx/e911/E911UnprovisionAction';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatE911Row, E911_COLUMNS } from '@/lib/pbxTable';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

export default function E911Review() {
  return (
    <PbxShell title="E911 Review" description="Provisioned addresses and domain endpoint review">
      <E911Content />
    </PbxShell>
  );
}

function E911Content() {
  const { domain } = usePbxDomain();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [routingFilter, setRoutingFilter] = useState('all');
  const [wanFilter, setWanFilter] = useState('all');
  const [editPhone, setEditPhone] = useState(null);

  const overviewQ = useQuery({
    queryKey: ['pbx-e911-review', domain],
    queryFn: () => pbxApi.e911ReviewOverview(domain || undefined),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-e911-review'] });

  const provisioned = overviewQ.data?.provisioned || [];
  const domainReview = overviewQ.data?.domainReview;

  const editRecord = editPhone ? provisioned.find((item) => item.phone_number === editPhone) : null;

  const { addressRows, stateOptions, routingOptions } = useMemo(() => {
    const list = provisioned.map(formatE911Row);
    return {
      stateOptions: uniqueFieldValues(list, 'state'),
      routingOptions: uniqueFieldValues(list, 'routing_status'),
      addressRows: list.filter((row) => {
        if (!matchSearch(row, search, ['phone_number', 'city', 'name', 'street', 'zip_code']))
          return false;
        if (!matchSelect(row.state, stateFilter)) return false;
        if (!matchSelect(row.routing_status, routingFilter)) return false;
        return true;
      }),
    };
  }, [provisioned, search, stateFilter, routingFilter]);

  const domainRows = useMemo(() => {
    const list = domainReview?.rows || [];
    return list.filter((row) => {
      if (!matchSearch(row, search, ['extension', 'name', 'caller_id', 'site', 'wan_ip'])) return false;
      if (wanFilter !== 'all' && row.wan_ip !== wanFilter) return false;
      return true;
    });
  }, [domainReview, search, wanFilter]);

  const wanOptions = useMemo(
    () => uniqueFieldValues(domainReview?.rows || [], 'wan_ip'),
    [domainReview]
  );

  if (overviewQ.isLoading) return <PbxLoading />;
  if (overviewQ.error) return <PbxError error={overviewQ.error} />;

  const addressColumns = [
    ...E911_COLUMNS,
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
      {domainReview?.summary ? (
        <PbxStatGrid
          stats={[
            { label: 'Visible endpoints', value: domainReview.summary.visibleEndpoints },
            { label: 'WAN groups', value: domainReview.summary.wanGroups },
            { label: 'Registered', value: domainReview.summary.registered },
            { label: 'Unregistered', value: domainReview.summary.unregistered },
          ]}
        />
      ) : null}

      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search phone, ext, name, site…"
      >
        {wanOptions.length > 0 && (
          <PbxFilterSelect
            value={wanFilter}
            onValueChange={setWanFilter}
            options={wanOptions}
            allLabel="All WAN IPs"
          />
        )}
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

      <Tabs defaultValue={domain ? 'domain' : 'addresses'}>
        <TabsList>
          {domain ? <TabsTrigger value="domain">Domain extensions</TabsTrigger> : null}
          <TabsTrigger value="addresses">Provisioned addresses</TabsTrigger>
          {domainReview?.wanGroups?.length ? (
            <TabsTrigger value="wan">WAN groups</TabsTrigger>
          ) : null}
        </TabsList>

        {domain ? (
          <TabsContent value="domain" className="mt-4">
            {!domainReview ? (
              <p className="text-sm text-gray-600 bg-white rounded-lg shadow p-6">
                Select a domain to review extensions alongside E911 status.
              </p>
            ) : (
              <PbxDataTable
                columns={[
                  { key: 'extension', label: 'Ext' },
                  { key: 'name', label: 'Name' },
                  { key: 'caller_id', label: 'Caller ID' },
                  { key: 'site', label: 'Site' },
                  { key: 'e911_status', label: 'E911' },
                  { key: 'location', label: 'Location' },
                  {
                    key: 'online_status',
                    label: 'Reg.',
                    render: (row) => <EndpointStatusCell row={row} />,
                  },
                  { key: 'registration_status', label: 'Registration detail' },
                  { key: 'wan_ip', label: 'WAN IP' },
                  { key: 'notes', label: 'Notes' },
                ]}
                rows={domainRows}
                emptyMessage="No extensions match your filters."
              />
            )}
          </TabsContent>
        ) : null}

        <TabsContent value="addresses" className="mt-4">
          <PbxDataTable
            columns={addressColumns}
            rows={addressRows}
            emptyMessage="No E911 endpoints provisioned."
          />
        </TabsContent>

        {domainReview?.wanGroups?.length ? (
          <TabsContent value="wan" className="mt-4">
            <PbxDataTable
              columns={[
                { key: 'wan_ip', label: 'WAN IP' },
                { key: 'endpoints', label: 'Endpoints' },
                { key: 'registered', label: 'Registered' },
                { key: 'unregistered', label: 'Unregistered' },
                { key: 'e911_disabled', label: 'E911 disabled' },
              ]}
              rows={domainReview.wanGroups}
            />
          </TabsContent>
        ) : null}
      </Tabs>

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
