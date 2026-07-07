import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import CreateEndpointDialog from '@/components/pbx/endpoints/CreateEndpointDialog';
import UnprovisionHubUserAction from '@/components/pbx/endpoints/UnprovisionHubUserAction';
import SubscriberExpandPanel from '@/components/pbx/endpoints/SubscriberExpandPanel';
import ResyncPhoneAction from '@/components/pbx/endpoints/ResyncPhoneAction';
import { PhoneStatusCell, EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import PermissionGate from '@/components/PermissionGate';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';
import { Minus, Plus, Settings, Voicemail } from 'lucide-react';

function formatDid(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return `${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value || '—';
}

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
      description="Extension registration from PBX device and MAC APIs (not subscriber presence)"
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
  const [expandedKey, setExpandedKey] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);

  const toggleExpanded = (row) => {
    const key = String(row.user || row.id);
    setExpandedKey((current) => (current === key ? null : key));
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-endpoint-control', domain],
    queryFn: () => pbxApi.endpointControlOverview(domain),
    enabled: !!domain,
  });
  const phonesQ = useQuery({
    queryKey: ['pbx-phone-inventory', domain],
    queryFn: () => pbxApi.phones(domain),
    enabled: !!domain,
  });

  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ['pbx-endpoint-control', domain] });

  const subscribers = data?.subscribers || [];
  const messagingUsers = data?.messagingUsers || [];
  const phones = phonesQ.data || [];
  const stats = data?.stats;

  const serviceOptions = useMemo(() => uniqueFieldValues(subscribers, 'srv_code'), [subscribers]);
  const typeOptions = useMemo(
    () => uniqueFieldValues(messagingUsers, 'user_type'),
    [messagingUsers]
  );
  const phoneModelOptions = useMemo(() => uniqueFieldValues(phones, 'model'), [phones]);
  const serviceOrModelOptions = useMemo(
    () => [...new Set([...serviceOptions, ...phoneModelOptions])].sort((a, b) => a.localeCompare(b)),
    [serviceOptions, phoneModelOptions]
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

  const filteredPhones = useMemo(() => {
    return phones.filter((row) => {
      if (!matchSearch(row, search, ['mac', 'model', 'primary_line', 'primary_device', 'user_agent', 'contact'])) {
        return false;
      }
      if (!matchSelect(row.model, serviceFilter, 'all')) return false;
      if (statusFilter !== 'all' && row.online_status !== statusFilter) return false;
      return true;
    });
  }, [phones, search, serviceFilter, statusFilter]);

  const allVisibleSelected =
    filteredSubscribers.length > 0 &&
    filteredSubscribers.every((row) => selectedRows.includes(String(row.user || row.id)));

  const toggleSelected = (row) => {
    const key = String(row.user || row.id);
    setSelectedRows((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const toggleAllVisible = (checked) => {
    if (!checked) {
      setSelectedRows((current) =>
        current.filter((key) => !filteredSubscribers.some((row) => String(row.user || row.id) === key))
      );
      return;
    }
    const visibleKeys = filteredSubscribers.map((row) => String(row.user || row.id));
    setSelectedRows((current) => [...new Set([...current, ...visibleKeys])]);
  };

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
        { label: 'Online (registered)', value: stats.onlineExtensions },
        { label: 'Unregistered phones', value: stats.offlineExtensions },
        { label: 'No device provisioned', value: stats.noDeviceExtensions ?? 0 },
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
            { value: 'offline', label: 'Unregistered' },
            { value: 'no_device', label: 'No device' },
          ]}
          allLabel="All statuses"
        />
        <PbxFilterSelect
          value={serviceFilter}
          onValueChange={setServiceFilter}
          options={serviceOrModelOptions}
          allLabel="All services / models"
        />
        <PbxFilterSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          options={typeOptions}
          allLabel="All hub types"
        />
      </PbxListToolbar>

      <Tabs defaultValue="subscribers">
        <TabsList>
          <TabsTrigger value="subscribers">Endpoint Control ({filteredSubscribers.length})</TabsTrigger>
          <TabsTrigger value="hub">Messaging hub ({filteredMessaging.length})</TabsTrigger>
          <TabsTrigger value="phones">Provisioned phones ({filteredPhones.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="subscribers" className="mt-4">
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            {filteredSubscribers.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-[#f2f2f2] border-b">
                    <tr className="text-[11px] uppercase tracking-wide text-gray-600">
                      <th className="px-3 py-2.5 text-left w-10">
                        <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAllVisible} />
                      </th>
                      <th className="px-2 py-2.5 text-left w-10">
                        <Settings className="h-4 w-4 text-gray-600" aria-hidden />
                        <span className="sr-only">Settings</span>
                      </th>
                      <th className="px-3 py-2.5 text-left font-semibold">Status</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Extension</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Name</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Transport</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Site</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Department</th>
                      <th className="px-3 py-2.5 text-left font-semibold">User Scope</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Features</th>
                      <th className="px-3 py-2.5 text-left font-semibold">DID</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Warning</th>
                      <th className="px-3 py-2.5 text-left font-semibold">Geo Node</th>
                      <th className="px-3 py-2.5 text-right w-12">
                        <PermissionGate pbxAction="manageEndpoints" fallback={<span className="sr-only">Add endpoint</span>}>
                          <CreateEndpointDialog domain={domain} onSuccess={refresh} />
                        </PermissionGate>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscribers.map((row, idx) => {
                      const rowKey = String(row.user || row.id);
                      const selected = selectedRows.includes(rowKey);
                      const expanded = expandedKey === rowKey;
                      return (
                        <React.Fragment key={row.id || row.user || idx}>
                          <tr
                            className={
                              expanded
                                ? 'bg-[#1e4f8a] text-white border-b border-[#1e4f8a]'
                                : 'border-b last:border-0 hover:bg-gray-50/80'
                            }
                          >
                            <td className="px-3 py-2.5">
                              <Checkbox checked={selected} onCheckedChange={() => toggleSelected(row)} />
                            </td>
                            <td className="px-2 py-2.5">
                              <button
                                type="button"
                                className={`inline-flex h-6 w-6 items-center justify-center ${
                                  expanded ? 'text-white' : 'text-blue-600 hover:text-blue-700'
                                }`}
                                onClick={() => toggleExpanded(row)}
                                title={expanded ? 'Collapse endpoint details' : 'Expand endpoint details'}
                              >
                                {expanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                              </button>
                            </td>
                            <td className="px-3 py-2.5 font-medium whitespace-nowrap">
                              <EndpointStatusCell row={row} />
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">{row.user || '—'}</td>
                            <td className="px-3 py-2.5">
                              <button
                                type="button"
                                className={`text-left hover:underline ${
                                  expanded ? 'text-white' : 'text-cyan-700'
                                }`}
                                onClick={() => toggleExpanded(row)}
                              >
                                {row.name || '—'}
                                {row.transport ? (
                                  <span
                                    className={`ml-2 inline-flex rounded border px-1 py-0.5 text-[10px] uppercase ${
                                      expanded ? 'border-white/60' : 'border-gray-400'
                                    }`}
                                  >
                                    {row.transport}
                                  </span>
                                ) : null}
                              </button>
                            </td>
                            <td className="px-3 py-2.5">
                              {!expanded && row.transport ? (
                                <span className="inline-flex rounded border border-gray-400 px-1.5 py-0.5 text-[11px] uppercase">
                                  {row.transport}
                                </span>
                              ) : (
                                ''
                              )}
                            </td>
                            <td className="px-3 py-2.5">{row.site || ''}</td>
                            <td className="px-3 py-2.5">{row.department || ''}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">{row.scope || '—'}</td>
                            <td className="px-3 py-2.5">
                              {row.features?.length ? (
                                <Voicemail
                                  className={`h-4 w-4 ${expanded ? 'text-white' : 'text-gray-700'}`}
                                  aria-label={row.features.join(', ')}
                                />
                              ) : null}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">{formatDid(row.caller_id)}</td>
                            <td className="px-3 py-2.5">{row.warning || ''}</td>
                            <td className="px-3 py-2.5 whitespace-nowrap">{row.geo_node || ''}</td>
                            <td className="px-3 py-2.5" />
                          </tr>
                          {expanded ? (
                            <tr className="border-b last:border-0">
                              <td colSpan={14} className="p-0">
                                <SubscriberExpandPanel
                                  domain={domain}
                                  subscriber={row}
                                  onUpdated={refresh}
                                />
                              </td>
                            </tr>
                          ) : null}
                        </React.Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No subscribers match your filters.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="hub" className="mt-4">
          <PbxDataTable
            columns={msgColumns}
            rows={filteredMessaging}
            emptyMessage="No messaging hub users match your filters."
          />
        </TabsContent>

        <TabsContent value="phones" className="mt-4">
          <PbxDataTable
            columns={[
              {
                key: 'online_status',
                label: 'Status',
                render: (row) => <PhoneStatusCell row={row} />,
              },
              { key: 'mac', label: 'MAC' },
              { key: 'model', label: 'Model' },
              { key: 'primary_line', label: 'Primary line' },
              { key: 'primary_device', label: 'Device' },
              { key: 'transport', label: 'Transport' },
              { key: 'user_agent', label: 'User agent' },
              { key: 'registration_time', label: 'Registered' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) =>
                  row.mac && row.primary_device ? (
                    <PermissionGate pbxAction="manageEndpoints" fallback="—">
                      <ResyncPhoneAction
                        macAddress={row.mac}
                        domain={domain}
                        onSuccess={() => {
                          phonesQ.refetch();
                          refresh();
                        }}
                      />
                    </PermissionGate>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={filteredPhones}
            emptyMessage="No provisioned phones match your filters."
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
