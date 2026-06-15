import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessPbxDataScope, PBX_SUMMARY_STAT_SCOPES } from '@/lib/permissions';

export default function PBXDashboard() {
  return (
    <PbxShell title="PBX Dashboard" description="Live overview of your PBX environment" requiresDomain={false}>
      <DashboardContent />
    </PbxShell>
  );
}

function domainNamesFromSummary(data) {
  if (!data) return [];
  if (Array.isArray(data.assignedDomains) && data.assignedDomains.length) {
    return data.assignedDomains;
  }
  if (Array.isArray(data.scopeDomains) && data.scopeDomains.length) {
    return data.scopeDomains;
  }
  if (Array.isArray(data.domainList) && data.domainList.length) {
    return data.domainList.map((d) => (typeof d === 'string' ? d : d?.domain)).filter(Boolean);
  }
  return [];
}

function DashboardContent() {
  const { permissions } = usePermissions();

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-dashboard', 'overview'],
    queryFn: () => pbxApi.dashboard(undefined),
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

  const scopeDomains = domainNamesFromSummary(data);
  const isAssignedScope = data?.scope === 'assigned';
  const domainCount = scopeDomains.length || data?.domains || 0;

  return (
    <div className="space-y-6">
      {stats.length > 0 ? (
        <PbxStatGrid stats={stats} />
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-600">
          No summary metrics are available for your PBX permissions.
        </div>
      )}
      {scopeDomains.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-semibold text-gray-900 mb-3">
            {isAssignedScope ? 'Assigned domains' : 'PBX domains in scope'}
          </h2>
          <ul className="text-sm text-gray-700 font-mono space-y-1">
            {scopeDomains.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 mt-4">
            Totals above combine data across{' '}
            {domainCount === 1 ? 'your domain' : `all ${domainCount} domains`}. Use the domain
            selector on other PBX pages to drill into a single domain.
          </p>
        </div>
      ) : null}
    </div>
  );
}
