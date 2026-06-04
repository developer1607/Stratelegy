import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch } from '@/lib/listFilters';

const ataColumns = [
  { key: 'mac_address', label: 'MAC address' },
  { key: 'phone_number', label: 'Phone number' },
  { key: 'deliver_offline', label: 'Deliver offline' },
];

export default function OfflineEndpoints() {
  return (
    <PbxShell
      title="Offline Endpoints"
      description="Fax ATAs with offline delivery and messaging endpoints"
    >
      {({ domain }) => <OfflineContent domain={domain} />}
    </PbxShell>
  );
}

function OfflineContent({ domain }) {
  const [search, setSearch] = useState('');
  const [offlineFilter, setOfflineFilter] = useState('all');
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-offline', domain],
    queryFn: () => pbxApi.offlineEndpoints(domain),
    enabled: !!domain,
  });

  const filterRows = (rows) =>
    (rows || []).filter((row) => {
      if (!matchSearch(row, search, ['mac_address', 'phone_number'])) return false;
      if (offlineFilter === 'yes' && !row.deliver_offline) return false;
      if (offlineFilter === 'no' && row.deliver_offline) return false;
      return true;
    });

  const offlineRows = useMemo(
    () => filterRows(data?.offlineFaxAtas || []),
    [data?.offlineFaxAtas, search, offlineFilter]
  );

  const allRows = useMemo(() => {
    const source = showOfflineOnly ? data?.offlineFaxAtas || [] : data?.faxAtas || [];
    return filterRows(source);
  }, [data, search, offlineFilter, showOfflineOnly]);

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-8">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search MAC or phone…"
      >
        <PbxFilterSelect
          value={offlineFilter}
          onValueChange={setOfflineFilter}
          options={[
            { value: 'yes', label: 'Offline delivery on' },
            { value: 'no', label: 'Offline delivery off' },
          ]}
          allLabel="Any delivery"
        />
        <button
          type="button"
          className={`px-3 py-1.5 rounded-lg border text-sm ${showOfflineOnly ? 'bg-[#F07020] text-white border-[#F07020]' : 'bg-white text-gray-700'}`}
          onClick={() => setShowOfflineOnly((v) => !v)}
        >
          {showOfflineOnly ? 'Showing offline only' : 'Show all ATAs'}
        </button>
      </PbxListToolbar>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Offline fax ATAs</h2>
        <PbxDataTable
          columns={ataColumns}
          rows={offlineRows}
          emptyMessage="No offline fax ATAs match your filters."
        />
      </section>
      {!showOfflineOnly && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">All fax ATAs</h2>
          <PbxDataTable
            columns={ataColumns}
            rows={allRows}
            emptyMessage="No fax ATAs match your filters."
          />
        </section>
      )}
    </div>
  );
}
