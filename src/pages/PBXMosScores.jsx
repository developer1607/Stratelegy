import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { daysAgo, todayInput } from '@/lib/listFilters';
import { formatPbxDisplayValue } from '@/lib/pbxEndpointUtils';

function QosBadge({ value }) {
  if (value == null || value === '') return '—';
  const num = Number(value);
  const poor = Number.isFinite(num) && num < 3.5;
  return (
    <span
      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
        poor ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
      }`}
    >
      {value}
    </span>
  );
}

function formatMosDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function PBXMosScores() {
  return (
    <PbxShell
      title="MOS Scores"
      description="Call quality (MOS/QOS) from domain CDRs"
    >
      {({ domain }) => <MosContent domain={domain} />}
    </PbxShell>
  );
}

function MosContent({ domain }) {
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(todayInput());

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-mos-scores', startDate, endDate, domain],
    queryFn: () =>
      pbxApi.mosScores({
        start_date: startDate,
        end_date: endDate,
        per_page: 100,
        domain,
      }),
    retry: false,
    enabled: !!domain,
  });

  const rows = useMemo(() => {
    const list = data?.rows || [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((row) =>
      [row.from_name, row.from, row.to, row.dialed, row.qos, row.qos_orig, row.qos_term]
        .filter((part) => part != null && part !== '')
        .some((part) => String(part).toLowerCase().includes(q))
    );
  }, [data?.rows, search]);

  if (!domain) return <PbxLoading />;
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
          Showing {rows.length} call{rows.length === 1 ? '' : 's'}
          {data.qosCount != null ? ` (${data.qosCount} with QOS/MOS)` : ''} from {data.rawCount}{' '}
          CDR records ({data.startDate} – {data.endDate}).
        </p>
      )}

      <PbxDataTable
        columns={[
          {
            key: 'from_name',
            label: 'From Name',
            render: (row) => row.from_name || row.from || '—',
          },
          {
            key: 'date',
            label: 'Date',
            render: (row) => formatMosDate(row.date),
          },
          {
            key: 'from',
            label: 'From',
            render: (row) => formatPbxDisplayValue(row.from),
          },
          {
            key: 'qos_orig',
            label: 'QOS',
            render: (row) => <QosBadge value={row.qos_orig ?? row.qos} />,
          },
          {
            key: 'dialed',
            label: 'Dialed',
            render: (row) => formatPbxDisplayValue(row.dialed),
          },
          {
            key: 'to',
            label: 'To',
            render: (row) => formatPbxDisplayValue(row.to),
          },
          {
            key: 'qos_term',
            label: 'QOS',
            render: (row) => <QosBadge value={row.qos_term ?? row.qos} />,
          },
          {
            key: 'duration',
            label: 'Duration',
            render: (row) => row.duration || '—',
          },
        ]}
        rows={rows}
        emptyMessage="No CDR rows in this date range for the selected domain. Try widening dates or confirm call logging/QOS is enabled."
      />
    </div>
  );
}
