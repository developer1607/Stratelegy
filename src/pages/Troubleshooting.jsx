import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import { Badge } from '@/components/ui/badge';
import { usePermissions } from '@/hooks/usePermissions';
import {
  canAccessPbxDataScope,
  canViewPbxConnectionStatus,
  canViewPbxDomains,
  PBX_SUMMARY_STAT_SCOPES,
} from '@/lib/permissions';

export default function Troubleshooting() {
  return (
    <PbxShell title="Troubleshooting" description="Connectivity and domain health">
      {({ domain }) => <TroubleshootingContent domain={domain} />}
    </PbxShell>
  );
}

function TroubleshootingContent({ domain }) {
  const { permissions } = usePermissions();
  const showConnection = canViewPbxConnectionStatus(permissions);
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-troubleshooting', domain],
    queryFn: () => pbxApi.troubleshooting(domain),
    enabled: !!domain,
  });

  const stats = useMemo(() => {
    if (!data) return [];
    const defs = [
      { label: 'Domains', value: data.domains, field: 'domains' },
      { label: 'Subscribers', value: data.subscribers, field: 'subscribers' },
      { label: 'E911 endpoints', value: data.e911Endpoints, field: 'e911Endpoints' },
      { label: 'Trunk groups', value: data.trunkGroups, field: 'trunkGroups' },
    ];
    return defs.filter((stat) => {
      const scope = PBX_SUMMARY_STAT_SCOPES[stat.field];
      return scope && canAccessPbxDataScope(permissions, scope) && stat.value != null;
    });
  }, [data, permissions]);

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-6">
      {showConnection && data.status ? (
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
      ) : null}

      {stats.length > 0 ? <PbxStatGrid stats={stats} /> : null}

      <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
        {showConnection && data.status?.accountId ? (
          <p>
            <span className="font-medium text-gray-900">Account:</span> {data.status.accountId}
          </p>
        ) : null}
        {canViewPbxDomains(permissions) && data.domain ? (
          <p className={showConnection && data.status?.accountId ? 'mt-2' : ''}>
            <span className="font-medium text-gray-900">Domain:</span> {data.domain}
          </p>
        ) : null}
        {data.checkedAt ? (
          <p className="mt-2">
            <span className="font-medium text-gray-900">Checked at:</span> {data.checkedAt}
          </p>
        ) : null}
      </div>
    </div>
  );
}
