import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import AddE911Dialog from '@/components/pbx/e911/AddE911Dialog';
import AddEmergencyPoolDialog from '@/components/pbx/e911/AddEmergencyPoolDialog';
import E911DomainDefaultsCard from '@/components/pbx/e911/E911DomainDefaultsCard';
import E911EmergencyPoolSheet from '@/components/pbx/e911/E911EmergencyPoolSheet';
import E911DeletePoolAction from '@/components/pbx/e911/E911DeletePoolAction';
import E911ProvisionSheet from '@/components/pbx/e911/E911ProvisionSheet';
import E911SubscriberCallerIdSheet from '@/components/pbx/e911/E911SubscriberCallerIdSheet';
import E911UnprovisionAction from '@/components/pbx/e911/E911UnprovisionAction';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatE911Row, E911_COLUMNS } from '@/lib/pbxTable';
import { formatCivicAddressLabel } from '@shared/pbxE911Format.js';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

/** SkySwitch E911 routes expect an 11-digit US number (leading 1). */
function normalizeE911Phone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length >= 11) return digits.slice(-11);
  if (digits.length === 10) return `1${digits}`;
  return '';
}

function isWildcardDid(value) {
  const text = String(value ?? '').trim();
  return !text || text === '[*]' || text.includes('*');
}

function findProvisionedRecord(provisioned, phone) {
  const key = normalizeE911Phone(phone);
  if (!key) return null;
  return provisioned.find((item) => normalizeE911Phone(item.phone_number) === key) || null;
}

function dialableE911Phone(row, phoneSource = 'phone_number') {
  const raw = row[phoneSource] ?? row.e911_caller_id ?? row.caller_id;
  if (isWildcardDid(raw)) return '';
  return normalizeE911Phone(raw);
}

function compactLocationLabel(row) {
  if (row.location && row.location !== '—') return row.location;
  return formatCivicAddressLabel(row) || '—';
}

export default function E911Review() {
  return (
    <PbxShell
      title="E911 Review"
      description="Provisioned addresses and domain endpoint review"
      requiresDomain
    >
      {({ domain }) => <E911Content domain={domain} />}
    </PbxShell>
  );
}

function E911Content({ domain }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [routingFilter, setRoutingFilter] = useState('all');
  const [wanFilter, setWanFilter] = useState('all');
  const [editPhone, setEditPhone] = useState(null);
  const [editSubscriber, setEditSubscriber] = useState(null);
  const [editPoolRow, setEditPoolRow] = useState(null);
  const [activeTab, setActiveTab] = useState('review');

  const overviewQ = useQuery({
    queryKey: ['pbx-e911-review', domain],
    queryFn: () => pbxApi.e911ReviewOverview(domain),
    enabled: Boolean(domain),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-e911-review'] });

  const provisioned = overviewQ.data?.provisioned || [];
  const domainReview = overviewQ.data?.domainReview;
  const domainPhones = overviewQ.data?.domainPhones || [];
  const sources = overviewQ.data?.sources || {};
  const capabilities = overviewQ.data?.capabilities || {};
  const emergencyPool = overviewQ.data?.emergencyPool || [];
  const emergencyPoolRows = overviewQ.data?.emergencyPoolRows || [];
  const domainDefaults = overviewQ.data?.domainDefaults || null;

  React.useEffect(() => {
    if (!domain) return;
    if (domainPhones.length > 0) setActiveTab('review');
    else setActiveTab('domain');
  }, [domain, domainPhones.length]);

  const editRecord = editPhone ? findProvisionedRecord(provisioned, editPhone) : null;
  const editIsProvisioned = Boolean(editRecord);

  const renderE911Actions = (row, { phoneSource = 'phone_number', isProvisioned } = {}) => {
    const phone = dialableE911Phone(row, phoneSource);
    const extension = row.extension || row.user;

    if (!phone && extension) {
      return (
        <PermissionGate pbxAction="manageE911" fallback="—">
          <Button size="sm" variant="outline" onClick={() => setEditSubscriber(row)}>
            Set 911 CID
          </Button>
        </PermissionGate>
      );
    }

    if (!phone) {
      return (
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-auto px-0 text-xs text-gray-500 hover:text-gray-800"
          onClick={() => setActiveTab('phones')}
        >
          Use phone numbers tab
        </Button>
      );
    }

    const provisionedRow =
      isProvisioned ??
      (row.e911_status === 'Provisioned' || Boolean(findProvisionedRecord(provisioned, phone)));

    return (
      <PermissionGate pbxAction="manageE911" fallback="—">
        <div className="flex flex-wrap gap-2">
          {extension ? (
            <Button size="sm" variant="ghost" onClick={() => setEditSubscriber(row)}>
              911 CID
            </Button>
          ) : null}
          <Button size="sm" variant="outline" onClick={() => setEditPhone(phone)}>
            {provisionedRow ? 'Edit address' : 'Provision address'}
          </Button>
          {provisionedRow ? (
            <E911UnprovisionAction phoneNumber={phone} onSuccess={refresh} />
          ) : null}
        </div>
      </PermissionGate>
    );
  };

  const renderPoolActions = (row) => {
    const phone = dialableE911Phone(row);
    const provisionedRow =
      row.e911_status === 'Provisioned' || Boolean(findProvisionedRecord(provisioned, phone));

    return (
      <PermissionGate pbxAction="manageE911" fallback="—">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="ghost" onClick={() => setEditPoolRow(row)}>
            Edit tag
          </Button>
          {phone ? (
            <Button size="sm" variant="outline" onClick={() => setEditPhone(phone)}>
              {provisionedRow ? 'Edit address' : 'Provision address'}
            </Button>
          ) : null}
          <E911DeletePoolAction domain={domain} callid={row.callid} onSuccess={refresh} />
        </div>
      </PermissionGate>
    );
  };

  const poolRows = useMemo(() => {
    return emergencyPoolRows.filter((row) => {
      if (!matchSearch(row, search, ['callid', 'phone_number', 'tag', 'location', 'e911_status'])) {
        return false;
      }
      if (!matchSelect(row.routing_status, routingFilter)) return false;
      return true;
    });
  }, [emergencyPoolRows, search, routingFilter]);

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
      if (!matchSearch(row, search, ['extension', 'name', 'caller_id', 'e911_caller_id', 'site', 'wan_ip'])) return false;
      if (wanFilter !== 'all' && row.wan_ip !== wanFilter) return false;
      return true;
    });
  }, [domainReview, search, wanFilter]);

  const domainPhoneRows = useMemo(() => {
    return domainPhones.filter((row) => {
      if (!matchSearch(row, search, ['phone_number', 'name', 'location', 'routing_status']))
        return false;
      if (!matchSelect(row.routing_status, routingFilter)) return false;
      return true;
    });
  }, [domainPhones, search, routingFilter]);

  const reviewRows = useMemo(() => {
    const list = domainReview?.rows || [];
    return list.filter((row) => {
      if (
        !matchSearch(row, search, [
          'extension',
          'name',
          'caller_id',
          'e911_caller_id',
          'phone_number',
          'site',
          'location',
          'notes',
          'wan_ip',
        ])
      ) {
        return false;
      }
      if (!matchSelect(row.routing_status, routingFilter)) return false;
      if (wanFilter !== 'all' && row.wan_ip !== wanFilter) return false;
      return true;
    });
  }, [domainReview, search, routingFilter, wanFilter]);

  const wanOptions = useMemo(
    () => uniqueFieldValues(domainReview?.rows || [], 'wan_ip'),
    [domainReview]
  );

  if (!domain) {
    return (
      <p className="text-sm text-gray-600 bg-white rounded-lg shadow p-6">
        Select a domain above to load E911 data for that domain.
      </p>
    );
  }

  if (overviewQ.isLoading) return <PbxLoading />;
  if (overviewQ.error) return <PbxError error={overviewQ.error} />;

  const addressColumns = [
    ...E911_COLUMNS,
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => renderE911Actions(row, { isProvisioned: true }),
    },
  ];

  const domainPhoneColumns = [
    { key: 'phone_number', label: 'Phone number' },
    { key: 'e911_status', label: 'E911' },
    { key: 'name', label: 'Location name' },
    { key: 'location', label: 'City / state' },
    { key: 'routing_status', label: 'Routing status' },
    { key: 'msag_status', label: 'MSAG status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => renderE911Actions(row),
    },
  ];

  const domainColumns = [
    { key: 'extension', label: 'Ext' },
    { key: 'name', label: 'Name' },
    { key: 'caller_id', label: 'Caller ID' },
    { key: 'e911_caller_id', label: 'PBX 911 CID' },
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
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => renderE911Actions(row),
    },
  ];

  const poolColumns = [
    { key: 'callid', label: 'Emergency caller ID' },
    { key: 'tag', label: 'Tag', render: (row) => row.tag || '—' },
    { key: 'e911_status', label: 'Telco civic' },
    { key: 'location', label: 'Location' },
    { key: 'routing_status', label: 'Routing status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => renderPoolActions(row),
    },
  ];

  const reviewColumns = [
    { key: 'extension', label: 'Ext' },
    { key: 'name', label: 'Name' },
    { key: 'caller_id', label: 'Caller ID' },
    {
      key: 'e911_caller_id',
      label: 'PBX 911 CID',
      render: (row) => row.e911_caller_id || '—',
    },
    {
      key: 'v2_e911_caller_id',
      label: 'v2 911 CID',
      render: (row) =>
        row.v2_e911_caller_id && row.v2_e911_caller_id !== row.e911_caller_id
          ? row.v2_e911_caller_id
          : '—',
    },
    {
      key: 'phone_number',
      label: 'Effective 911 DID',
      render: (row) => row.phone_number || row.e911_caller_id || row.caller_id || '—',
    },
    { key: 'site', label: 'Site' },
    {
      key: 'location',
      label: 'Location',
      render: (row) => compactLocationLabel(row) || '—',
    },
    { key: 'notes', label: 'Notes' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => renderE911Actions(row),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Domain</p>
            <p className="text-lg font-semibold text-gray-900">{domain}</p>
            <p className="text-sm text-gray-500 mt-1">
              PBX subscribers, emergency caller ID pool, and Telco civic addresses when configured.
            </p>
            {sources.pbx ? (
              <p className="text-xs text-gray-500 mt-2">
                Data: PBX API
                {sources.telco ? ' + Telco E911 addresses' : ' (Telco E911 disabled)'}
                {emergencyPool.length ? ` · ${emergencyPool.length} domain 911 pool number(s)` : ''}
              </p>
            ) : null}
          </div>
          <PermissionGate pbxAction="manageE911">
            <div className="flex flex-wrap gap-2 justify-end">
              <AddEmergencyPoolDialog domain={domain} onSuccess={refresh} />
              <AddE911Dialog onSuccess={refresh} />
            </div>
          </PermissionGate>
        </div>

        <E911DomainDefaultsCard
          domain={domain}
          defaults={domainDefaults}
          capabilities={capabilities}
          onSuccess={refresh}
        />

        {domainReview?.summary ? (
          <PbxStatGrid
            stats={[
              { label: 'Visible endpoints', value: domainReview.summary.visibleEndpoints },
              { label: 'WAN groups', value: domainReview.summary.wanGroups },
              { label: 'Registered', value: domainReview.summary.registered },
              { label: 'Unregistered', value: domainReview.summary.unregistered },
              ...(domainReview.summary.emergencyPool != null
                ? [{ label: 'Emergency pool', value: domainReview.summary.emergencyPool }]
                : []),
              ...(domainReview.summary.pbxConfigured != null
                ? [{ label: 'PBX 911 CID set', value: domainReview.summary.pbxConfigured }]
                : []),
              ...(domainReview.summary.telcoProvisioned != null
                ? [{ label: 'Telco provisioned', value: domainReview.summary.telcoProvisioned }]
                : []),
            ]}
          />
        ) : null}

        {wanOptions.length > 0 ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
            <span className="font-medium">{wanOptions[0]}</span>
            {'  '}
            <span className="text-gray-500">
              IP geolocation and emergency routing details are shown per caller ID and provisioned record below.
            </span>
          </div>
        ) : null}
      </div>

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
      </PbxListToolbar>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="review">Review table</TabsTrigger>
          <TabsTrigger value="pool">Emergency pool</TabsTrigger>
          <TabsTrigger value="phones">Domain phone numbers</TabsTrigger>
          <TabsTrigger value="domain">Domain extensions</TabsTrigger>
          <TabsTrigger value="addresses">Provisioned addresses</TabsTrigger>
          {domainReview?.wanGroups?.length ? (
            <TabsTrigger value="wan">WAN groups</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="review" className="mt-4">
          <PbxDataTable
            columns={reviewColumns}
            rows={reviewRows}
            emptyMessage="No E911 review rows match your filters."
          />
        </TabsContent>

        <TabsContent value="pool" className="mt-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
            <p className="text-sm text-gray-600">
              Domain emergency caller ID pool (<code className="text-xs bg-gray-100 px-1 rounded">callidemgr</code>
              ). Extensions with <code className="text-xs bg-gray-100 px-1 rounded">[*]</code> can use
              these numbers for 911 routing.
            </p>
            <PermissionGate pbxAction="manageE911">
              <AddEmergencyPoolDialog domain={domain} onSuccess={refresh} />
            </PermissionGate>
          </div>
          <PbxDataTable
            columns={poolColumns}
            rows={poolRows}
            emptyMessage="No emergency pool numbers configured. Add a pool number to route 911 for wildcard extensions."
          />
        </TabsContent>

        <TabsContent value="phones" className="mt-4">
          <p className="text-sm text-gray-600 mb-3">
            E911 civic addresses are provisioned per phone number (DID). Extensions with caller ID{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">[*]</code> use the domain 911 pool or
            per-extension <code className="text-xs bg-gray-100 px-1 rounded">callid_emgr</code>.
          </p>
          <PbxDataTable
            columns={domainPhoneColumns}
            rows={domainPhoneRows}
            emptyMessage="No phone numbers are assigned to this domain."
          />
        </TabsContent>

        <TabsContent value="domain" className="mt-4">
          <PbxDataTable
            columns={domainColumns}
            rows={domainRows}
            emptyMessage="No extensions match your filters."
          />
        </TabsContent>

        <TabsContent value="addresses" className="mt-4">
          <PbxDataTable
            columns={addressColumns}
            rows={addressRows}
            emptyMessage="No E911 endpoints provisioned for this domain's phone numbers."
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
        loadExisting={editIsProvisioned}
        open={!!editPhone}
        onOpenChange={(open) => !open && setEditPhone(null)}
        onSuccess={refresh}
      />

      <E911EmergencyPoolSheet
        domain={domain}
        row={editPoolRow}
        open={!!editPoolRow}
        onOpenChange={(open) => !open && setEditPoolRow(null)}
        onSuccess={refresh}
      />

      <E911SubscriberCallerIdSheet
        domain={domain}
        subscriber={editSubscriber}
        open={!!editSubscriber}
        onOpenChange={(open) => !open && setEditSubscriber(null)}
        onSuccess={refresh}
      />
    </div>
  );
}
