import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessPbxDataScope, PBX_SUMMARY_STAT_SCOPES, canViewPbxDomains } from '@/lib/permissions';

export default function PBXDashboard() {
  return (
    <PbxShell title="PBX Dashboard" description="Live overview of your PBX environment">
      {({ domain }) => <DashboardContent domain={domain} />}
    </PbxShell>
  );
}

function DashboardContent({ domain }) {
  const { permissions } = usePermissions();
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-dashboard', domain || ''],
    queryFn: () => pbxApi.dashboard(domain || undefined),
    enabled: true,
  });

  const stats = useMemo(() => {
    if (!data) return [];
    const defs = [
      { label: 'Domains', value: data.domains, field: 'domains' },
      { label: 'Subscribers', value: data.subscribers, field: 'subscribers' },
      { label: 'E911 endpoints', value: data.e911Endpoints, field: 'e911Endpoints' },
      { label: 'Trunk groups', value: data.trunkGroups, field: 'trunkGroups' },
      { label: 'Phone numbers', value: data.phoneNumbers, field: 'phoneNumbers' },
      { label: 'Auto attendants', value: data.autoAttendants, field: 'autoAttendants' },
    ];
    return defs.filter((stat) => {
      const scope = PBX_SUMMARY_STAT_SCOPES[stat.field];
      return scope && canAccessPbxDataScope(permissions, scope) && stat.value != null;
    });
  }, [data, permissions]);

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  const showDomainName = canViewPbxDomains(permissions) && data?.domain;

  return (
    <div className="space-y-6">
      {stats.length > 0 ? (
        <PbxStatGrid stats={stats} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
          No summary metrics are available for your PBX permissions.
        </div>
      )}
      {showDomainName ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-3">Viewing domain</h2>
          <p className="text-gray-700 font-mono text-sm">{data.domain}</p>
          <p className="text-sm text-gray-500 mt-4">Showing live data for the selected domain.</p>
        </div>
      ) : null}
    </div>
  );
}
