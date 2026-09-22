import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';
import DomainScopedReportPanel from '@/components/pbx/reports/DomainScopedReportPanel';

export default function SIPALG() {
  return (
    <PbxShell title="SIP ALG" description="Review SIP ALG settings for the selected domain">
      {({ domain }) => <SipAlgContent domain={domain} />}
    </PbxShell>
  );
}

export function SipAlgContent({ domain }) {
  return (
    <div className="space-y-6">
      <DomainScopedReportPanel
        scheduleType="sip_alg_same_ip"
        title="SIP ALG same IP"
        description="Email extensions where internal (contact) IP matches external (WAN) IP for the selected domain."
        resultNote="Email lists Ext · Name · Internal IP · External IP · MAC."
        requireDomain
        immediateApi={(body) => pbxApi.immediateSipAlgSameIp(body)}
      />
      <SipAlgSettingsLive domain={domain} />
    </div>
  );
}

function SipAlgSettingsLive({ domain }) {
  const [search, setSearch] = useState('');
  const [serverFilter, setServerFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-sip-alg', domain],
    queryFn: () => pbxApi.sipAlg(domain),
    enabled: !!domain,
  });

  const settings = data?.settings || [];
  const serverOptions = useMemo(() => uniqueFieldValues(settings, 'server_name'), [settings]);

  const rows = useMemo(() => {
    return settings.filter((row) => {
      if (
        !matchSearch(row, search, ['config_name', 'config_value', 'description', 'server_name'])
      ) {
        return false;
      }
      return matchSelect(row.server_name, serverFilter);
    });
  }, [settings, search, serverFilter]);

  if (!domain) {
    return (
      <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
        Select a domain to load SIP ALG settings.
      </p>
    );
  }
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search setting name or server…"
      >
        <PbxFilterSelect
          value={serverFilter}
          onValueChange={setServerFilter}
          options={serverOptions}
          allLabel="All servers"
        />
      </PbxListToolbar>
      <PbxDataTable
        columns={[
          { key: 'config_name', label: 'Setting' },
          { key: 'config_value', label: 'Value' },
          { key: 'description', label: 'Description' },
          { key: 'server_name', label: 'Server' },
        ]}
        rows={rows}
        emptyMessage="No SIP ALG settings are configured for this domain."
      />
      <p className="text-sm text-gray-500">
        Showing settings for: <span className="font-mono">{data.domain}</span>
      </p>
    </div>
  );
}
