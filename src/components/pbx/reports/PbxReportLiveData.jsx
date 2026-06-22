import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { formatE911Row, E911_COLUMNS } from '@/lib/pbxTable';
import { matchSearch } from '@/lib/listFilters';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

function LiveSection({ title, children, livePage, livePageLabel }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {livePage ? (
          <Button variant="ghost" size="sm" asChild>
            <Link to={createPageUrl(livePage)}>
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              {livePageLabel || 'Open full view'}
            </Link>
          </Button>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function OfflineEndpointsLive({ config, domain, search }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-offline-overview', domain],
    queryFn: () => pbxApi.offlineEndpointsOverview(domain),
    enabled: !!domain,
  });

  if (!domain) return <DomainRequired />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const extensions = (data?.extensionOffline || []).filter((row) =>
    matchSearch(row, search, ['extension', 'name', 'email', 'caller_id', 'notes'])
  );
  const faxAtas = (data?.fax?.faxAtas || []).filter((row) =>
    matchSearch(row, search, ['mac_address', 'phone_number'])
  );

  return (
    <div className="space-y-8">
      <LiveSection title="Offline extensions" livePage={config.livePage} livePageLabel={config.livePageLabel}>
        <PbxDataTable
          columns={[
            { key: 'extension', label: 'Ext' },
            { key: 'name', label: 'Name' },
            { key: 'email_report_status', label: 'Email report' },
            { key: 'downtime', label: 'Downtime' },
            { key: 'notes', label: 'Notes' },
          ]}
          rows={extensions}
          emptyMessage="No offline extensions for this domain."
        />
      </LiveSection>
      <LiveSection title="Fax ATA routing">
        <PbxDataTable
          columns={[
            { key: 'mac_address', label: 'MAC address' },
            { key: 'phone_number', label: 'Phone number' },
            { key: 'deliver_offline', label: 'Deliver offline' },
          ]}
          rows={faxAtas}
          emptyMessage="No fax ATA records for this domain."
        />
      </LiveSection>
    </div>
  );
}

function DeviceMonitoringLive({ config, domain, search }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-endpoint-control', domain],
    queryFn: () => pbxApi.endpointControlOverview(domain),
    enabled: !!domain,
  });

  if (!domain) return <DomainRequired />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = (data?.subscribers || []).filter((row) =>
    matchSearch(row, search, ['user', 'name', 'subscriber_login', 'caller_id', 'site', 'department'])
  );

  return (
    <LiveSection title="Registered devices" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable
        columns={[
          {
            key: 'online_status',
            label: 'Status',
            render: (row) => <EndpointStatusCell row={row} />,
          },
          { key: 'user', label: 'Ext' },
          { key: 'name', label: 'Name' },
          { key: 'transport', label: 'Transport' },
          { key: 'site', label: 'Site' },
          { key: 'caller_id', label: 'DID' },
        ]}
        rows={rows}
        emptyMessage="No devices returned for this domain."
      />
    </LiveSection>
  );
}

function DomainExportLive({ config, search }) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['pbx-domains'],
    queryFn: () => pbxApi.domains(),
  });

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = data.filter((row) =>
    matchSearch(row, search, ['domain', 'description', 'name', 'reseller'])
  );

  return (
    <LiveSection title="Domains" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable
        columns={[
          { key: 'domain', label: 'Domain' },
          { key: 'description', label: 'Description' },
          { key: 'reseller', label: 'Reseller' },
        ]}
        rows={rows}
        emptyMessage="No domains returned for this account."
      />
    </LiveSection>
  );
}

function E911Live({ config, domain, search }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-e911-review', domain],
    queryFn: () => pbxApi.e911ReviewOverview(domain || undefined),
  });

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = (data?.provisioned || []).map(formatE911Row).filter((row) =>
    matchSearch(row, search, ['phone_number', 'city', 'name', 'street', 'zip_code', 'routing_status'])
  );

  return (
    <LiveSection title="Provisioned E911 addresses" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable columns={E911_COLUMNS} rows={rows} emptyMessage="No provisioned E911 addresses found." />
    </LiveSection>
  );
}

function SipAlgLive({ config, domain, search }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-sip-alg', domain],
    queryFn: () => pbxApi.sipAlg(domain),
    enabled: !!domain,
  });

  if (!domain) return <DomainRequired />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = (data?.settings || []).filter((row) =>
    matchSearch(row, search, ['config_name', 'config_value', 'description', 'server_name'])
  );

  return (
    <LiveSection title="SIP ALG settings" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable
        columns={[
          { key: 'config_name', label: 'Setting' },
          { key: 'config_value', label: 'Value' },
          { key: 'description', label: 'Description' },
          { key: 'server_name', label: 'Server' },
        ]}
        rows={rows}
        emptyMessage="No SIP ALG settings for this domain."
      />
    </LiveSection>
  );
}

function SipTrunkLive({ config, domain, search }) {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['pbx-trunks', domain],
    queryFn: () => pbxApi.trunkGroups(domain),
  });

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = data.filter((row) => matchSearch(row, search, ['id', 'name']));

  return (
    <LiveSection title="SIP trunk groups" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'name', label: 'Name' },
        ]}
        rows={rows}
        emptyMessage="No trunk groups found."
      />
    </LiveSection>
  );
}

function VoicemailLive({ config, domain, search }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-voicemail', domain],
    queryFn: () => pbxApi.voicemail(domain),
    enabled: !!domain,
  });

  if (!domain) return <DomainRequired />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = [
    ...(data?.autoAttendants || []).map((r) => ({ ...r, section: 'Auto attendant' })),
    ...(data?.callQueues || []).map((r) => ({ ...r, section: 'Call queue' })),
    ...(data?.allSubscribers || []).map((r) => ({ ...r, section: 'Subscriber' })),
  ].filter((row) => matchSearch(row, search, ['user', 'name', 'email_address', 'srv_code', 'section']));

  return (
    <LiveSection title="Voicemail services" livePage={config.livePage} livePageLabel={config.livePageLabel}>
      <PbxDataTable
        columns={[
          { key: 'section', label: 'Type' },
          { key: 'user', label: 'User' },
          { key: 'name', label: 'Name' },
          { key: 'srv_code', label: 'Service' },
          { key: 'email_address', label: 'Email' },
        ]}
        rows={rows}
        emptyMessage="No voicemail records for this domain."
      />
    </LiveSection>
  );
}

function DomainRequired() {
  return (
    <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      Select a domain in the bar above to load live report data.
    </p>
  );
}

function NoLiveData({ config }) {
  return (
    <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
      Live data is not available for this report in the portal.
      {config.livePage ? (
        <>
          {' '}
          Use{' '}
          <Link to={createPageUrl(config.livePage)} className="underline font-medium">
            {config.livePageLabel || config.title}
          </Link>{' '}
          for related operational data.
        </>
      ) : null}
    </p>
  );
}

const LIVE_RENDERERS = {
  offlineEndpoints: OfflineEndpointsLive,
  deviceMonitoring: DeviceMonitoringLive,
  domainExport: DomainExportLive,
  e911: E911Live,
  sipAlg: SipAlgLive,
  sipTrunk: SipTrunkLive,
  voicemail: VoicemailLive,
};

export default function PbxReportLiveData({ config }) {
  const { domain } = usePbxDomain();
  const [search, setSearch] = useState('');

  const Renderer = LIVE_RENDERERS[config.id];
  const searchPlaceholder = useMemo(() => {
    if (config.id === 'domainExport') return 'Search domain or reseller…';
    if (config.id === 'e911') return 'Search phone, city, or address…';
    return 'Search this report…';
  }, [config.id]);

  if (!Renderer) return <NoLiveData config={config} />;

  return (
    <div className="space-y-4">
      <PbxListToolbar search={search} onSearchChange={setSearch} searchPlaceholder={searchPlaceholder} />
      <Renderer config={config} domain={domain} search={search} />
    </div>
  );
}
