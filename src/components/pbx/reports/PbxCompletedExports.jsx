import React, { useMemo, useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, RefreshCw } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { PbxDataTable, PbxError } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';
import { toast } from 'sonner';

function statusBadge(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed')
    return <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>;
  if (normalized === 'queued' || normalized === 'pending')
    return <Badge variant="secondary">Queued</Badge>;
  if (normalized === 'failed') return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status || '—'}</Badge>;
}

/**
 * Lists SkySwitch async report jobs (queued/completed). Supports download and cancel.
 */
export default function PbxCompletedExports({
  title = 'Completed exports',
  description = 'Queued and completed report files. Downloads appear when status is completed.',
  reportTypeMatch = null,
  enabled = true,
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const hasActiveFilters = Boolean(search.trim()) || statusFilter !== 'all';

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pbx-generated-reports', page],
    queryFn: () => pbxApi.listReports(page),
    enabled,
    refetchInterval: (query) => {
      if (!enabled) return false;
      const list = query.state.data?.data || [];
      const hasQueued = list.some((item) => /queued|pending/i.test(String(item.status || '')));
      return hasQueued ? 15000 : false;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (reportId) => pbxApi.cancelReport(reportId),
    onSuccess: () => {
      toast.success('Report cancelled');
      queryClient.invalidateQueries({ queryKey: ['pbx-generated-reports'] });
    },
    onError: (err) => toast.error(err.message || 'Failed to cancel report'),
  });

  const download = async (fileId) => {
    try {
      const result = await pbxApi.downloadReportFile(fileId);
      const url = result?.url || result?.download_url;
      if (!url) throw new Error('No download URL returned');
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      toast.error(err.message || 'Download failed');
    }
  };

  const { rows, statusOptions, hasQueued, currentPage } = useMemo(() => {
    const list = (data?.data || []).map((item) => ({
      id: item.id,
      report_type: item.report_type,
      status: item.status,
      created_at: item.created_at,
      error: item.error,
      file_id: item.file_id || item.file?.id,
      user: item.user?.name || item.user?.email,
      notes: item.notes,
    }));

    const typeFiltered = reportTypeMatch
      ? list.filter((row) => reportTypeMatch.test(String(row.report_type || '')))
      : list;

    const filtered = typeFiltered.filter((row) => {
      if (!matchSearch(row, search, ['id', 'report_type', 'status', 'user', 'error'])) return false;
      if (!matchSelect(row.status, statusFilter)) return false;
      return true;
    });

    return {
      statusOptions: uniqueFieldValues(typeFiltered, 'status'),
      hasQueued: typeFiltered.some((row) => /queued|pending/i.test(String(row.status || ''))),
      rows: filtered,
      currentPage: Number(data?.current_page) || page,
    };
  }, [data, search, statusFilter, page, reportTypeMatch]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'report_type', label: 'Type' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => statusBadge(row.status),
    },
    { key: 'created_at', label: 'Created' },
    { key: 'user', label: 'Requested by' },
    { key: 'error', label: 'Error' },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.file_id && (
            <Button size="sm" variant="outline" onClick={() => download(row.file_id)}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          )}
          {String(row.status || '').toLowerCase() === 'queued' && (
            <PermissionGate pbxAction="manageReports">
              <PbxDeleteDialog
                triggerLabel="Cancel"
                title="Cancel queued report?"
                description={`Cancel report #${row.id} (${row.report_type}).`}
                confirmLabel="Cancel report"
                loading={cancelMutation.isPending}
                onConfirm={() => cancelMutation.mutateAsync(row.id)}
              />
            </PermissionGate>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 py-4">Loading exports…</p>
      ) : error ? (
        <PbxError error={error} />
      ) : (
        <>
          <PbxListToolbar
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder="Search ID, type, status, or user…"
          >
            <PbxFilterSelect
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={statusOptions}
              allLabel="All statuses"
            />
            <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {hasQueued && (
              <span className="text-xs text-gray-500">
                Auto-refreshing queued reports every 15 seconds
              </span>
            )}
          </PbxListToolbar>

          {hasActiveFilters && (
            <p className="text-xs text-amber-700">
              Search and status filters apply to the current page of exports only.
            </p>
          )}

          <PbxDataTable
            columns={columns}
            rows={rows}
            emptyMessage={
              reportTypeMatch
                ? 'No matching exports yet. Queue a report above; completed files appear here.'
                : 'No exports yet. Queue a report from the catalog; completed files appear here.'
            }
          />

          {rows.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{rows.length} matching export(s) on page {currentPage}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="px-2 py-1">Page {currentPage}</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={(data?.data?.length || 0) < (Number(data?.per_page) || 25)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
