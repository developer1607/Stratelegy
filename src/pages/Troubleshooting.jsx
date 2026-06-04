import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import { Badge } from '@/components/ui/badge';

export default function Troubleshooting() {
  return (
    <PbxShell title="Troubleshooting" description="Connectivity and domain health">
      {({ domain }) => <TroubleshootingContent domain={domain} />}
    </PbxShell>
  );
}

function TroubleshootingContent({ domain }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-troubleshooting', domain],
    queryFn: () => pbxApi.troubleshooting(domain),
    enabled: !!domain,
  });

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-gray-500">API connection</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">
            {data.status?.connected ? 'Connected' : 'Not connected'}
          </p>
          {data.status?.message && (
            <p className="text-sm text-gray-500 mt-1">{data.status.message}</p>
          )}
        </div>
        <Badge
          className={data.status?.connected ? 'bg-green-600 hover:bg-green-600' : ''}
          variant={data.status?.connected ? 'default' : 'destructive'}
        >
          {data.status?.connected ? 'Healthy' : 'Check credentials'}
        </Badge>
      </div>

      <PbxStatGrid
        stats={[
          { label: 'Domains', value: data.domains },
          { label: 'Subscribers', value: data.subscribers },
          { label: 'E911 endpoints', value: data.e911Endpoints },
          { label: 'Trunk groups', value: data.trunkGroups },
        ]}
      />

      <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
        <p>
          <span className="font-medium text-gray-900">Account:</span>{' '}
          {data.status?.accountId || '—'}
        </p>
        <p className="mt-2">
          <span className="font-medium text-gray-900">Domain:</span> {data.domain}
        </p>
        <p className="mt-2">
          <span className="font-medium text-gray-900">Checked at:</span> {data.checkedAt}
        </p>
      </div>
    </div>
  );
}
