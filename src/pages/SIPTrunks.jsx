import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';

export default function SIPTrunks() {
  return (
    <PbxShell title="SIP Trunks" description="SIP trunk groups" requiresDomain={false}>
      <TrunksContent />
    </PbxShell>
  );
}

function TrunksContent() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['pbx-trunks'],
    queryFn: () => pbxApi.trunkGroups(),
  });

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
