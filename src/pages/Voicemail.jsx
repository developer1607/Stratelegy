import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';

const aaColumns = [
  { key: 'user', label: 'User' },
  { key: 'name', label: 'Name' },
  { key: 'srv_code', label: 'Service' },
  { key: 'email_address', label: 'Email' },
];

function filterSection(rows, search, serviceFilter) {
  return (rows || []).filter((row) => {
    if (!matchSearch(row, search, ['user', 'name', 'email_address', 'srv_code'])) return false;
    return matchSelect(row.srv_code, serviceFilter);
  });
}

export default function Voicemail() {
  return (
    <PbxShell title="Voicemail" description="Auto attendants, call queues, and subscriber services">
      {({ domain }) => <VoicemailContent domain={domain} />}
    </PbxShell>
  );
}

function VoicemailContent({ domain }) {
  const [search, setSearch] = useState('');
  const [serviceFilter, setServiceFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-voicemail', domain],
    queryFn: () => pbxApi.voicemail(domain),
    enabled: !!domain,
  });

  const allRows = [
    ...(data?.autoAttendants || []),
    ...(data?.callQueues || []),
    ...(data?.allSubscribers || []),
  ];
  const serviceOptions = useMemo(() => uniqueFieldValues(allRows, 'srv_code'), [allRows]);

  const autoAttendants = useMemo(
    () => filterSection(data?.autoAttendants, search, serviceFilter),
    [data?.autoAttendants, search, serviceFilter]
  );
  const callQueues = useMemo(
    () => filterSection(data?.callQueues, search, serviceFilter),
    [data?.callQueues, search, serviceFilter]
  );
  const allSubscribers = useMemo(
    () => filterSection(data?.allSubscribers, search, serviceFilter),
    [data?.allSubscribers, search, serviceFilter]
  );

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-8">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search user, name, or email…"
      >
        <PbxFilterSelect
          value={serviceFilter}
          onValueChange={setServiceFilter}
          options={serviceOptions}
          allLabel="All services"
        />
      </PbxListToolbar>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Auto attendants</h2>
        <PbxDataTable
          columns={aaColumns}
          rows={autoAttendants}
          emptyMessage="No auto attendants match your filters."
        />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Call queues</h2>
        <PbxDataTable
          columns={aaColumns}
          rows={callQueues}
          emptyMessage="No call queues match your filters."
        />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">All subscribers</h2>
        <PbxDataTable
          columns={aaColumns}
          rows={allSubscribers}
          emptyMessage="No subscribers match your filters."
        />
      </section>
    </div>
  );
}
