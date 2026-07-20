import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import CreateEndpointDialog from '@/components/pbx/endpoints/CreateEndpointDialog';
import BulkEndpointActions from '@/components/pbx/endpoints/BulkEndpointActions';
import SubscriberExpandPanel from '@/components/pbx/endpoints/SubscriberExpandPanel';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import PermissionGate from '@/components/PermissionGate';
import { Checkbox } from '@/components/ui/checkbox';
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

const STATUS_SORT_ORDER = { online: 0, offline: 1, no_device: 2 };

function compareValues(a, b, { numeric = false } = {}) {
  const left = a ?? '';
  const right = b ?? '';
  return String(left).localeCompare(String(right), undefined, {
    numeric,
    sensitivity: 'base',
  });
}

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
  const [recordFilter, setRecordFilter] = useState('all');
  const [sortBy, setSortBy] = useState('extension');
  const [sortDir, setSortDir] = useState('asc');
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

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['pbx-endpoint-control', domain] });
    queryClient.invalidateQueries({ queryKey: ['pbx-phone-inventory', domain] });
  };

  const subscribers = data?.subscribers || [];
  const phones = phonesQ.data || [];
  const stats = data?.stats;

  const selectedSubscriberRows = useMemo(
    () => subscribers.filter((row) => selectedRows.includes(String(row.user || row.id))),
    [subscribers, selectedRows]
  );

  const serviceOptions = useMemo(() => uniqueFieldValues(subscribers, 'srv_code'), [subscribers]);
  const phoneModelOptions = useMemo(() => uniqueFieldValues(phones, 'model'), [phones]);
  const serviceOrModelOptions = useMemo(
    () => [...new Set([...serviceOptions, ...phoneModelOptions])].sort((a, b) => a.localeCompare(b)),
    [serviceOptions, phoneModelOptions]
  );

  const filteredRows = useMemo(() => {
    return subscribers.filter((row) => {
      if (recordFilter === 'extensions' && row.is_phone_inventory) return false;
      if (recordFilter === 'phones' && !row.is_phone_inventory) return false;

      if (
        !matchSearch(row, search, [
          'user',
          'name',
          'subscriber_login',
          'scope',
          'caller_id',
          'site',
          'department',
          'mac_address',
          'model',
          'geo_node',
        ])
      ) {
        return false;
      }
      if (!matchSelect(row.srv_code || row.model, serviceFilter)) return false;
      if (
        statusFilter !== 'all' &&
        row.online_status !== statusFilter &&
        !(row.deviceLines || []).some((line) => line.online_status === statusFilter)
      ) {
        return false;
      }
      return true;
    });
  }, [subscribers, search, serviceFilter, statusFilter, recordFilter]);

  const sortedRows = useMemo(() => {
    const list = [...filteredRows];
    const dir = sortDir === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      let result = 0;
      switch (sortBy) {
        case 'name':
          result = compareValues(a.name, b.name);
          break;
        case 'status':
          result =
            (STATUS_SORT_ORDER[a.online_status] ?? 9) - (STATUS_SORT_ORDER[b.online_status] ?? 9);
          break;
        case 'site':
          result = compareValues(a.site, b.site);
          break;
        case 'department':
          result = compareValues(a.department, b.department);
          break;
        case 'did':
          result = compareValues(a.caller_id, b.caller_id, { numeric: true });
          break;
        case 'extension':
        default:
          result = compareValues(a.user, b.user, { numeric: true });
          break;
      }
      return result * dir;
    });
    return list;
  }, [filteredRows, sortBy, sortDir]);

  const allVisibleSelected =
    sortedRows.length > 0 &&
    sortedRows.every((row) => selectedRows.includes(String(row.user || row.id)));

  const toggleSelected = (row) => {
    const key = String(row.user || row.id);
    setSelectedRows((current) =>
      current.includes(key) ? current.filter((item) => item !== key) : [...current, key]
    );
  };

  const toggleAllVisible = (checked) => {
    if (!checked) {
      setSelectedRows((current) =>
        current.filter((key) => !sortedRows.some((row) => String(row.user || row.id) === key))
      );
      return;
    }
    const visibleKeys = sortedRows.map((row) => String(row.user || row.id));
    setSelectedRows((current) => [...new Set([...current, ...visibleKeys])]);
  };

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

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
        searchPlaceholder="Search ext, name, site, DID, MAC…"
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
          value={recordFilter}
          onValueChange={setRecordFilter}
          options={[
            { value: 'extensions', label: 'Extensions only' },
            { value: 'phones', label: 'Phones only' },
          ]}
          allLabel="All endpoints"
          className="w-[150px]"
        />
        <PbxFilterSelect
          value={sortBy}
          onValueChange={setSortBy}
          hideAll
          options={[
            { value: 'extension', label: 'Sort: Extension' },
            { value: 'name', label: 'Sort: Name' },
            { value: 'status', label: 'Sort: Status' },
            { value: 'site', label: 'Sort: Site' },
            { value: 'department', label: 'Sort: Department' },
            { value: 'did', label: 'Sort: DID' },
          ]}
          className="w-[160px]"
        />
        <PbxFilterSelect
          value={sortDir}
          onValueChange={setSortDir}
          hideAll
          options={[
            { value: 'asc', label: 'Ascending' },
            { value: 'desc', label: 'Descending' },
          ]}
          className="w-[130px]"
        />
      </PbxListToolbar>

      <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
        <span>
          {sortedRows.length} endpoint{sortedRows.length === 1 ? '' : 's'}
          {filteredRows.length !== subscribers.length
            ? ` (of ${subscribers.length})`
            : ''}
        </span>
        <PermissionGate pbxAction="manageEndpoints" fallback={null}>
          <CreateEndpointDialog domain={domain} onSuccess={refresh} />
        </PermissionGate>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        {sortedRows.length ? (
          <div className="app-scrollbar overflow-x-scroll">
            <table className="min-w-[1120px] w-full text-sm">
              <thead className="bg-[#f2f2f2] border-b">
                <tr className="text-[11px] uppercase tracking-wide text-gray-600">
                  <th className="px-3 py-2.5 text-left w-10">
                    <Checkbox checked={allVisibleSelected} onCheckedChange={toggleAllVisible} />
                  </th>
                  <th className="px-2 py-2.5 text-left w-10">
                    <PermissionGate
                      pbxAction="manageEndpoints"
                      fallback={
                        <>
                          <Settings className="h-4 w-4 text-gray-400" aria-hidden />
                          <span className="sr-only">Actions</span>
                        </>
                      }
                    >
                      <BulkEndpointActions
                        domain={domain}
                        selectedRows={selectedSubscriberRows}
                        onSuccess={() => {
                          setSelectedRows([]);
                          refresh();
                        }}
                      />
                    </PermissionGate>
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
                  <th className="px-3 py-2.5 w-12" />
                </tr>
              </thead>
              <tbody>
                {sortedRows.map((row, idx) => {
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
          <div className="p-8 text-center text-gray-500">No endpoints match your filters.</div>
        )}
      </div>
    </div>
  );
}
