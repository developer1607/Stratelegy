import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { daysAgo, todayInput } from '@/lib/listFilters';

export default function PBXMosScores() {
  return (
    <PbxShell
      title="MOS Scores"
      description="Call quality entries from activity journals"
      requiresDomain={false}
    >
      <MosContent />
    </PbxShell>
  );
}

function MosContent() {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(todayInput());

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-mos-scores', startDate, endDate],
    queryFn: () => pbxApi.mosScores({ start_date: startDate, end_date: endDate, per_page: 100 }),
    retry: false,
  });

  const rows = useMemo(() => {
    const list = data?.rows || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) =>
      [row.from, row.to, row.dialed, row.module, row.type, row.action, row.qos]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(q))
    );
  }, [data?.rows, search]);

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9 w-[140px] bg-white"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1 block">To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-9 w-[140px] bg-white"
          />
        </div>
      </div>

      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search from, to, QOS…"
      />

      {data?.rawCount != null && (
        <p className="text-sm text-gray-500">
          Showing {rows.length} MOS/QOS-related entries from {data.rawCount} journal records (
          {data.startDate} – {data.endDate}).
        </p>
      )}

      <PbxDataTable
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'from', label: 'From' },
          {
            key: 'qos',
            label: 'QOS',
            render: (row) =>
              row.qos != null ? (
                <span className="inline-flex px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-medium">
                  {row.qos}
                </span>
              ) : (
                '—'
              ),
          },
          { key: 'dialed', label: 'Dialed' },
          { key: 'to', label: 'To' },
          { key: 'duration', label: 'Duration' },
          { key: 'module', label: 'Module' },
        ]}
        rows={rows}
        emptyMessage="No MOS/QOS journal entries in this date range. Try widening dates or confirm log scope is enabled."
      />
    </div>
  );
}
