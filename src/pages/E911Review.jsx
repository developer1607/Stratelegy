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
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

/** SkySwitch E911 routes expect an 11-digit US number (leading 1). */
function normalizeE911Phone(value) {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length >= 11) return digits.slice(-11);
  if (digits.length === 10) return `1${digits}`;
  return '';
}

function findProvisionedRecord(provisioned, phone) {
  const key = normalizeE911Phone(phone);
  if (!key) return null;
  return provisioned.find((item) => normalizeE911Phone(item.phone_number) === key) || null;
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
  const [activeTab, setActiveTab] = useState('phones');

  const overviewQ = useQuery({
    queryKey: ['pbx-e911-review', domain],
    queryFn: () => pbxApi.e911ReviewOverview(domain),
    enabled: Boolean(domain),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['pbx-e911-review'] });

  const provisioned = overviewQ.data?.provisioned || [];
  const domainReview = overviewQ.data?.domainReview;
  const domainPhones = overviewQ.data?.domainPhones || [];

  React.useEffect(() => {
    if (!domain) return;
    if (domainPhones.length > 0) setActiveTab('phones');
    else setActiveTab('domain');
  }, [domain, domainPhones.length]);

  const editRecord = editPhone ? findProvisionedRecord(provisioned, editPhone) : null;
  const editIsProvisioned = Boolean(editRecord);

  const renderE911Actions = (row, { phoneSource = 'phone_number', isProvisioned } = {}) => {
    const phone = normalizeE911Phone(row[phoneSource] ?? row.caller_id);
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
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setEditPhone(phone)}>
            {provisionedRow ? 'Edit' : 'Provision'}
          </Button>
          {provisionedRow ? (
            <E911UnprovisionAction phoneNumber={phone} onSuccess={refresh} />
          ) : null}
        </div>
      </PermissionGate>
    );
  };

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

  const domainPhoneRows = useMemo(() => {
    return domainPhones.filter((row) => {
      if (!matchSearch(row, search, ['phone_number', 'name', 'location', 'routing_status']))
        return false;
      if (!matchSelect(row.routing_status, routingFilter)) return false;
      return true;
    });
  }, [domainPhones, search, routingFilter]);

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

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Reviewing domain <span className="font-mono font-medium text-gray-900">{domain}</span>
      </p>

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="phones">Domain phone numbers</TabsTrigger>
          <TabsTrigger value="domain">Domain extensions</TabsTrigger>
          <TabsTrigger value="addresses">Provisioned addresses</TabsTrigger>
          {domainReview?.wanGroups?.length ? (
            <TabsTrigger value="wan">WAN groups</TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="phones" className="mt-4">
          <p className="text-sm text-gray-600 mb-3">
            E911 is provisioned per phone number (DID). Extensions with Caller ID{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">[*]</code> rely on these domain numbers
            for emergency routing.
          </p>
          <PbxDataTable
            columns={domainPhoneColumns}
            rows={domainPhoneRows}
            emptyMessage="No phone numbers are assigned to this domain in SkySwitch."
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
    </div>
  );
}
