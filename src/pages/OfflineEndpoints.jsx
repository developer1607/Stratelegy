import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { EndpointStatusCell } from '@/components/pbx/endpoints/EndpointCells';
import FaxAtaActions from '@/components/pbx/endpoints/FaxAtaActions';
import SubscriberDetailSheet from '@/components/pbx/endpoints/SubscriberDetailSheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { matchSearch } from '@/lib/listFilters';

export default function OfflineEndpoints() {
  return (
    <PbxShell
      title="Offline Endpoints"
      description="Extension downtime and fax ATA offline delivery"
    >
      {({ domain }) => <OfflineContent domain={domain} />}
    </PbxShell>
  );
}

function OfflineContent({ domain }) {
  const [search, setSearch] = useState('');
  const [offlineFilter, setOfflineFilter] = useState('all');
  const [showOfflineOnly, setShowOfflineOnly] = useState(false);
  const [detailSub, setDetailSub] = useState(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-offline-overview', domain],
    queryFn: () => pbxApi.offlineEndpointsOverview(domain),
    enabled: !!domain,
  });

  const filterAtaRows = (rows) =>
    (rows || []).filter((row) => {
      if (!matchSearch(row, search, ['mac_address', 'phone_number'])) return false;
      if (offlineFilter === 'yes' && !row.deliver_offline) return false;
      if (offlineFilter === 'no' && row.deliver_offline) return false;
      return true;
    });

  const extensionRows = useMemo(() => {
    return (data?.extensionOffline || []).filter((row) =>
      matchSearch(row, search, [
        'extension',
        'name',
        'email',
        'caller_id',
        'site',
        'notes',
        'mac_address',
      ])
    );
  }, [data?.extensionOffline, search]);

  const ataColumns = useMemo(
    () => [
      { key: 'mac_address', label: 'MAC address' },
      { key: 'phone_number', label: 'Phone number' },
      {
        key: 'deliver_offline',
        label: 'Offline delivery routing',
        render: (row) => (row.deliver_offline ? 'On' : 'Off'),
      },
      {
        key: 'actions',
        label: 'Actions',
        render: (row) => <FaxAtaActions macAddress={row.mac_address} />,
      },
    ],
    []
  );

  const offlineAtaRows = useMemo(
    () => filterAtaRows(data?.fax?.offlineFaxAtas || []),
    [data?.fax?.offlineFaxAtas, search, offlineFilter]
  );

  const allAtaRows = useMemo(() => {
    const source = showOfflineOnly ? data?.fax?.offlineFaxAtas || [] : data?.fax?.faxAtas || [];
    return filterAtaRows(source);
  }, [data?.fax, search, offlineFilter, showOfflineOnly]);

  if (!domain) return <PbxLoading />;
  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-6">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search extension, name, MAC…"
      >
        <PbxFilterSelect
          value={offlineFilter}
          onValueChange={setOfflineFilter}
          options={[
            { value: 'yes', label: 'Offline delivery on' },
            { value: 'no', label: 'Offline delivery off' },
          ]}
          allLabel="Any ATA delivery"
        />
      </PbxListToolbar>

      <Tabs defaultValue="extensions">
        <TabsList>
          <TabsTrigger value="extensions">
            Extensions offline ({extensionRows.length})
          </TabsTrigger>
          <TabsTrigger value="fax">
            Fax ATAs ({offlineAtaRows.length} offline delivery)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extensions" className="space-y-4 mt-4">
          <p className="text-sm text-gray-500">
            Unregistered extensions that still have a provisioned phone/MAC for this domain.
          </p>
          <PbxDataTable
            columns={[
              {
                key: 'detail',
                label: '',
                render: (row) => (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setDetailSub({
                        user: row.extension,
                        name: row.name,
                        email_address: row.email,
                        caller_id: row.caller_id,
                        site: row.site,
                        department: row.department,
                        notes: row.notes,
                        mac_address: row.mac_address,
                        online_status: row.online_status || 'offline',
                        downtime: row.downtime,
                      })
                    }
                  >
                    Detail
                  </Button>
                ),
              },
              { key: 'extension', label: 'Ext' },
              { key: 'name', label: 'Name' },
              {
                key: 'online_status',
                label: 'Status',
                render: (row) => <EndpointStatusCell row={{ online_status: row.online_status }} />,
              },
              { key: 'mac_address', label: 'MAC' },
              { key: 'email_report_status', label: 'Email report' },
              { key: 'filtered', label: 'Filtered' },
              { key: 'notes', label: 'Notes' },
              {
                key: 'downtime',
                label: 'Downtime',
                render: (row) =>
                  row.downtime && row.downtime !== '—' ? (
                    <span className="text-red-600 font-medium">{row.downtime}</span>
                  ) : (
                    '—'
                  ),
              },
            ]}
            rows={extensionRows}
            emptyMessage="No unregistered extensions with provisioned phones for this domain."
          />
        </TabsContent>

        <TabsContent value="fax" className="space-y-6 mt-4">
          <p className="text-sm text-gray-500">
            Fax ATA “offline delivery” is a routing flag (deliver when ATA is unreachable), not live
            device registration status.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-3 py-1.5 rounded-lg border text-sm ${showOfflineOnly ? 'bg-[#F07020] text-white border-[#F07020]' : 'bg-white text-gray-700'}`}
              onClick={() => setShowOfflineOnly((v) => !v)}
            >
              {showOfflineOnly ? 'Showing offline-delivery ATAs only' : 'Show all ATAs'}
            </button>
          </div>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Offline-delivery fax ATAs
            </h2>
            <PbxDataTable
              columns={ataColumns}
              rows={offlineAtaRows}
              emptyMessage="No offline-delivery fax ATAs match your filters."
            />
          </section>
          {!showOfflineOnly && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">All fax ATAs</h2>
              <PbxDataTable
                columns={ataColumns}
                rows={allAtaRows}
                emptyMessage="No fax ATAs match your filters."
              />
            </section>
          )}
        </TabsContent>
      </Tabs>

      <SubscriberDetailSheet
        domain={domain}
        subscriber={detailSub}
        open={!!detailSub}
        onOpenChange={(open) => !open && setDetailSub(null)}
      />
    </div>
  );
}
