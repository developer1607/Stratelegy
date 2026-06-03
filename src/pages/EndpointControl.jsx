import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import ProvisionHubUserDialog from '@/components/pbx/endpoints/ProvisionHubUserDialog';
import UnprovisionHubUserAction from '@/components/pbx/endpoints/UnprovisionHubUserAction';
import PermissionGate from '@/components/PermissionGate';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

const subscriberColumns = [
  { key: 'user', label: 'User' },
  { key: 'name', label: 'Name' },
  { key: 'subscriber_login', label: 'Login' },
  { key: 'srv_code', label: 'Service' },
  { key: 'scope', label: 'Scope' },
];

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
    <PbxShell title="Endpoint Control" description="PBX subscribers and messaging hub users">
      {({ domain }) => <EndpointContent domain={domain} />}
    </PbxShell>
  );
}

function EndpointContent({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-endpoints', domain],
    queryFn: () => pbxApi.endpoints(domain),
    enabled: !!domain,
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-endpoints', domain] });

  const subscribers = data?.subscribers || [];
  const messagingUsers = data?.messagingUsers || [];

  const serviceOptions = useMemo(
    () => uniqueFieldValues(subscribers, 'srv_code'),
    [subscribers]
  );
  const typeOptions = useMemo(
    () => uniqueFieldValues(messagingUsers, 'user_type'),
    [messagingUsers]
  );

  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((row) => {
      if (!matchSearch(row, search, ['user', 'name', 'subscriber_login', 'scope'])) return false;
      return matchSelect(row.srv_code, serviceFilter);
    });
  }, [subscribers, search, serviceFilter]);

  const filteredMessaging = useMemo(() => {
    return messagingUsers.filter((row) => {
      if (!matchSearch(row, search, ['user', 'name', 'userid', 'device_user', 'domain'])) return false;
      return matchSelect(row.user_type, typeFilter);
    });
  }, [messagingUsers, search, typeFilter]);

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

  return (
    <div className="space-y-8">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search subscribers and hub users…"
      >
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
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">PBX subscribers</h2>
        <PbxDataTable columns={subscriberColumns} rows={filteredSubscribers} emptyMessage="No subscribers match your filters." />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Messaging hub users</h2>
        <PbxDataTable columns={msgColumns} rows={filteredMessaging} emptyMessage="No messaging hub users match your filters." />
      </section>
    </div>
  );
}
