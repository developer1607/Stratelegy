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

function LiveSection({ title, children, livePage, livePageLabel, description }) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          {description ? <p className="text-sm text-gray-500 mt-1">{description}</p> : null}
        </div>
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
    queryKey: ['pbx-endpoint-inventory', domain],
    queryFn: () => pbxApi.endpointControlOverview(domain),
    enabled: !!domain,
  });

  if (!domain) return <DomainRequired />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const rows = (data?.subscribers || []).filter((row) =>
    matchSearch(row, search, [
      'user',
      'name',
      'subscriber_login',
      'caller_id',
      'site',
      'department',
      'mac_address',
      'model',
      'registration_status',
    ])
  );

  return (
    <LiveSection
      title="Registered devices"
      livePage={config.livePage}
      livePageLabel={config.livePageLabel}
      description="Hybrid PBX + Telco endpoint inventory. Use Generate export for the official SkySwitch user_device file."
    >
      <PbxDataTable
        columns={[
          {
            key: 'online_status',
            label: 'Status',
            render: (row) => <EndpointStatusCell row={row} />,
          },
          { key: 'user', label: 'Ext' },
          { key: 'name', label: 'Name' },
          { key: 'mac_address', label: 'MAC' },
          { key: 'model', label: 'Model' },
          { key: 'transport', label: 'Transport' },
          { key: 'registration_status', label: 'Registration' },
          { key: 'site', label: 'Site' },
          { key: 'caller_id', label: 'DID' },
          { key: 'user_agent', label: 'User agent' },
        ]}
        rows={rows}
        emptyMessage="No devices returned for this domain."
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

  const reviewRows = (data?.domainReview?.rows || []).filter((row) =>
    matchSearch(row, search, [
      'extension',
      'name',
      'caller_id',
      'e911_caller_id',
      'phone_number',
      'e911_status',
      'location',
    ])
  );
  const poolRows = (data?.emergencyPoolRows || []).filter((row) =>
    matchSearch(row, search, ['callid', 'tag', 'phone_number', 'e911_status', 'location'])
  );
  const addressRows = (data?.provisioned || []).map(formatE911Row).filter((row) =>
    matchSearch(row, search, ['phone_number', 'city', 'name', 'street', 'zip_code', 'routing_status'])
  );

  return (
    <div className="space-y-8">
      <LiveSection
        title="Extension E911 review"
        livePage={config.livePage}
        livePageLabel={config.livePageLabel}
        description="Hybrid PBX subscriber 911 caller ID and status. Telco civic addresses are listed below when provisioned."
      >
        <PbxDataTable
          columns={[
            { key: 'extension', label: 'Ext' },
            { key: 'name', label: 'Name' },
            { key: 'e911_caller_id', label: 'PBX 911 CID' },
            { key: 'phone_number', label: 'Effective DID' },
            { key: 'e911_status', label: 'Status' },
            { key: 'location', label: 'Location' },
          ]}
          rows={reviewRows}
          emptyMessage="No extension E911 rows for this scope."
        />
      </LiveSection>

      <LiveSection title="Emergency pool (callidemgr)">
        <PbxDataTable
          columns={[
            { key: 'callid', label: 'Emergency CID' },
            { key: 'tag', label: 'Tag' },
            { key: 'e911_status', label: 'Telco civic' },
            { key: 'location', label: 'Location' },
          ]}
          rows={poolRows}
          emptyMessage="No domain emergency pool numbers configured."
        />
      </LiveSection>

      <LiveSection title="Telco provisioned civic addresses">
        <PbxDataTable
          columns={E911_COLUMNS}
          rows={addressRows}
          emptyMessage="No Telco-provisioned E911 civic addresses for this scope."
        />
      </LiveSection>
    </div>
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
  e911: E911Live,
};

export default function PbxReportLiveData({ config }) {
  const { domain } = usePbxDomain();
  const [search, setSearch] = useState('');

  const Renderer = LIVE_RENDERERS[config.id];
  const searchPlaceholder = useMemo(() => {
    if (config.id === 'e911') return 'Search ext, phone, city, or address…';
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
