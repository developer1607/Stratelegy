import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import ProvisionHubUserDialog from '@/components/pbx/endpoints/ProvisionHubUserDialog';
import UnprovisionHubUserAction from '@/components/pbx/endpoints/UnprovisionHubUserAction';
import SubscriberDetailSheet from '@/components/pbx/endpoints/SubscriberDetailSheet';
import { EndpointStatusCell, FeatureBadges } from '@/components/pbx/endpoints/EndpointCells';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

const messagingColumns = [
  { key: 'userid', label: 'User ID' },
  { key: 'user', label: 'Extension' },
  { key: 'domain', label: 'Domain' },
  { key: 'device_user', label: 'Device' },
  { key: 'name', label: 'Name' },
  { key: 'user_type', label: 'Type' },
];

export default function EndpointControl() {
  return (
    <PbxShell
      title="Endpoint Control"
      description="Live extension status, subscribers, and messaging hub users"
    >
      {({ domain }) => <EndpointContent domain={domain} />}
    </PbxShell>
  );
}

function EndpointContent({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [detailSub, setDetailSub] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-endpoint-control', domain],
    queryFn: () => pbxApi.endpointControlOverview(domain),
    enabled: !!domain,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['pbx-endpoint-control', domain] });

  const subscribers = data?.subscribers || [];
  const messagingUsers = data?.messagingUsers || [];
  const stats = data?.stats;

  const serviceOptions = useMemo(() => uniqueFieldValues(subscribers, 'srv_code'), [subscribers]);
  const typeOptions = useMemo(
    () => uniqueFieldValues(messagingUsers, 'user_type'),
    [messagingUsers]
  );

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((row) => {
      if (
        !matchSearch(row, search, [
          'user',
          'name',
          'subscriber_login',
          'scope',
          'caller_id',
          'site',
          'department',
        ])
      ) {
        return false;
      }
      if (!matchSelect(row.srv_code, serviceFilter)) return false;
      if (statusFilter !== 'all' && row.online_status !== statusFilter) return false;
      return true;
    });
  }, [subscribers, search, serviceFilter, statusFilter]);

  const filteredMessaging = useMemo(() => {
    return messagingUsers.filter((row) => {
      if (!matchSearch(row, search, ['user', 'name', 'userid', 'device_user', 'domain']))
        return false;
      return matchSelect(row.user_type, typeFilter);
    });
  }, [messagingUsers, search, typeFilter]);

  const subscriberColumns = useMemo(
    () => [
      {
        key: 'detail',
        label: '',
        render: (row) => (
          <Button type="button" variant="outline" size="sm" onClick={() => setDetailSub(row)}>
            Detail
          </Button>
        ),
      },
      {
        key: 'online_status',
        label: 'Status',
        render: (row) => <EndpointStatusCell row={row} />,
      },
      { key: 'user', label: 'Ext' },
      { key: 'name', label: 'Name' },
      { key: 'transport', label: 'Transport' },
      { key: 'site', label: 'Site' },
      { key: 'department', label: 'Dept.' },
      { key: 'scope', label: 'Scope' },
      {
        key: 'features',
        label: 'Features',
        render: (row) => <FeatureBadges features={row.features} />,
      },
      { key: 'caller_id', label: 'DID' },
      { key: 'geo_node', label: 'Geo node' },
    ],
    []
  );

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const msgColumns = [
    ...messagingColumns,
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <PermissionGate pbxAction="manageEndpoints" fallback="—">
          {row.userid ? <UnprovisionHubUserAction userId={row.userid} onSuccess={refresh} /> : null}
        </PermissionGate>
      ),
    },
  ];

  const statCards = stats
    ? [
        { label: 'Total extensions', value: stats.totalExtensions },
        { label: 'Offline extensions', value: stats.offlineExtensions },
        { label: 'Online extensions', value: stats.onlineExtensions },
        { label: 'Active calls', value: stats.activeCalls ?? 0 },
        { label: 'SIP ALG warnings', value: stats.sipAlgWarnings ?? 0 },
      ]
    : [];

  return (
    <div className="space-y-6">
      {statCards.length > 0 ? <PbxStatGrid stats={statCards} /> : null}

      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search ext, name, site, DID…"
      >
        <PbxFilterSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={[
            { value: 'online', label: 'Online' },
            { value: 'offline', label: 'Offline' },
            { value: 'unknown', label: 'Unknown' },
          ]}
          allLabel="All statuses"
        />
        <PbxFilterSelect
          value={serviceFilter}
          onValueChange={setServiceFilter}
          options={serviceOptions}
          allLabel="All services"
        />
        <PbxFilterSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          options={typeOptions}
          allLabel="All hub types"
        />
        <PermissionGate pbxAction="manageEndpoints">
          <ProvisionHubUserDialog domain={domain} onSuccess={refresh} />
        </PermissionGate>
      </PbxListToolbar>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">PBX subscribers ({filteredSubscribers.length})</TabsTrigger>
          <TabsTrigger value="hub">Messaging hub ({filteredMessaging.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <PbxDataTable
            columns={subscriberColumns}
            rows={filteredSubscribers}
            emptyMessage="No subscribers match your filters."
          />
        </TabsContent>

        <TabsContent value="hub" className="mt-4">
          <PbxDataTable
            columns={msgColumns}
            rows={filteredMessaging}
            emptyMessage="No messaging hub users match your filters."
          />
        </TabsContent>
      </Tabs>

      <SubscriberDetailSheet
        domain={domain}
        subscriber={detailSub}
        open={!!detailSub}
        onOpenChange={(open) => !open && setDetailSub(null)}
      />
    </div>
  );
}
