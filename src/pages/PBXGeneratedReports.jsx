import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Eye, FileArchive, RefreshCw } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import ReportDetailSheet from '@/components/pbx/reports/ReportDetailSheet';
import ReportTypesPanel from '@/components/pbx/reports/ReportTypesPanel';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { matchSearch, matchSelect, uniqueFieldValues } from '@/lib/listFilters';
import { toast } from 'sonner';

function statusBadge(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>;
  if (normalized === 'queued' || normalized === 'pending') return <Badge variant="secondary">Queued</Badge>;
  if (normalized === 'failed') return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status || '—'}</Badge>;
}

export default function PBXGeneratedReports() {
  return (
    <PbxShell
      title="Generated Reports"
      description="View, download, and manage exported reports"
      requiresDomain={false}
    >
      <Tabs defaultValue="generated" className="space-y-4">
        <TabsList>
          <TabsTrigger value="generated">Generated</TabsTrigger>
          <TabsTrigger value="catalog">Report catalog</TabsTrigger>
        </TabsList>
        <TabsContent value="generated">
          <GeneratedReportsContent />
        </TabsContent>
        <TabsContent value="catalog">
          <ReportTypesPanel />
        </TabsContent>
      </Tabs>
    </PbxShell>
  );
}

function GeneratedReportsContent() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pbx-generated-reports', page],
    queryFn: () => pbxApi.listReports(page),
    refetchInterval: (query) => {
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
      queryClient.invalidateQueries({ queryKey: ['pbx-report-detail'] });
      setDetailId(null);
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

  const { rows, statusOptions, typeOptions, hasQueued } = useMemo(() => {
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

    return {
      statusOptions: uniqueFieldValues(list, 'status'),
      typeOptions: uniqueFieldValues(list, 'report_type'),
      hasQueued: list.some((row) => /queued|pending/i.test(String(row.status || ''))),
      rows: list.filter((row) => {
        if (!matchSearch(row, search, ['id', 'report_type', 'status', 'user', 'error'])) return false;
        if (!matchSelect(row.status, statusFilter)) return false;
        if (!matchSelect(row.report_type, typeFilter)) return false;
        return true;
      }),
    };
  }, [data, search, statusFilter, typeFilter]);

  if (isLoading) return <PbxLoading />;
  if (error) {
    return (
      <div className="space-y-4">
        <PbxError error={error} />
      </div>
    );
  }

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
          <Button size="sm" variant="outline" onClick={() => setDetailId(row.id)}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
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

  const total = Number(data?.total) || rows.length;
  const currentPage = Number(data?.current_page) || page;

  return (
    <div className="space-y-4">
      {rows.length === 0 && !search && statusFilter === 'all' && typeFilter === 'all' && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <FileArchive className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="font-medium text-gray-900">No generated reports yet</p>
            <p className="text-sm text-gray-500 mt-2 max-w-lg mx-auto">
              No reports have been generated yet. Reports will appear here once they are queued and completed.
            </p>
          </CardContent>
        </Card>
      )}

      <PbxListToolbar search={search} onSearchChange={setSearch} searchPlaceholder="Search ID, type, status, or user…">
        <PbxFilterSelect
          value={statusFilter}
          onValueChange={setStatusFilter}
          options={statusOptions}
          allLabel="All statuses"
        />
        <PbxFilterSelect
          value={typeFilter}
          onValueChange={setTypeFilter}
          options={typeOptions}
          allLabel="All types"
          className="w-[180px]"
        />
        <Button size="sm" variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        {hasQueued && (
          <span className="text-xs text-gray-500">Auto-refreshing queued reports every 15 seconds</span>
        )}
      </PbxListToolbar>

      <PbxDataTable columns={columns} rows={rows} emptyMessage="No generated reports match your filters." />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{total} total report(s)</span>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={currentPage <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="px-2 py-1">Page {currentPage}</span>
          <Button
            size="sm"
            variant="outline"
            disabled={rows.length === 0 || (data?.data?.length || 0) < (Number(data?.per_page) || 25)}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ReportDetailSheet
        reportId={detailId}
        open={!!detailId}
        onOpenChange={(open) => !open && setDetailId(null)}
        onDownload={download}
      />
    </div>
  );
}
