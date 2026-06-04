import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading, PbxStatGrid } from '@/components/pbx/PbxShell';

export default function PBXDashboard() {
  return (
    <PbxShell title="PBX Dashboard" description="Live overview of your PBX environment">
      {({ domain }) => <DashboardContent domain={domain} />}
    </PbxShell>
  );
}

function DashboardContent({ domain }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-dashboard', domain],
    queryFn: () => pbxApi.dashboard(domain),
    enabled: !!domain,
  });

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-6">
      <PbxStatGrid
        stats={[
          { label: 'Domains', value: data.domains },
          { label: 'Subscribers', value: data.subscribers },
          { label: 'E911 endpoints', value: data.e911Endpoints },
          { label: 'Trunk groups', value: data.trunkGroups },
          { label: 'Phone numbers', value: data.phoneNumbers },
          { label: 'Auto attendants', value: data.autoAttendants },
        ]}
      />
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="font-semibold text-gray-900 mb-3">Viewing domain</h2>
        <p className="text-gray-700 font-mono text-sm">{data.domain}</p>
        <p className="text-sm text-gray-500 mt-4">Showing live data for the selected domain.</p>
      </div>
    </div>
  );
}
