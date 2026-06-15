import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';
import { isPbxDomainRestricted } from '@/lib/permissions';
import { usePermissions } from '@/hooks/usePermissions';

export default function SIPTrunks() {
  return (
    <PbxShell title="SIP Trunks" description="SIP trunk groups" requiresDomain={false}>
      <TrunksContent />
    </PbxShell>
  );
}

function TrunksContent() {
  const { domain } = usePbxDomain();
  const { permissions } = usePermissions();
  const domainRestricted = isPbxDomainRestricted(permissions);

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['pbx-trunks', domain],
    queryFn: () => pbxApi.trunkGroups(domain),
    enabled: !domainRestricted || !!domain,
  });

  if (domainRestricted && !domain) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Select an assigned domain in the bar above to view trunk groups for that domain.
      </p>
    );
  }

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <PbxDataTable
      columns={[
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
      ]}
      rows={data}
      emptyMessage="No trunk groups found."
    />
  );
}
