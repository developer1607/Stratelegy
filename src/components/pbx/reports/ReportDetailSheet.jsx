import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, Loader2 } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

function DetailRow({ label, value }) {
  if (value == null || value === '') return null;
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 last:border-0">
      <dt className="text-sm font-medium text-gray-500 col-span-1">{label}</dt>
      <dd className="text-sm text-gray-900 col-span-2 break-all">{value}</dd>
    </div>
  );
}

function statusBadge(status) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'completed') return <Badge className="bg-green-600 hover:bg-green-600">Completed</Badge>;
  if (normalized === 'queued' || normalized === 'pending') return <Badge variant="secondary">Queued</Badge>;
  if (normalized === 'failed') return <Badge variant="destructive">Failed</Badge>;
  return <Badge variant="outline">{status || '—'}</Badge>;
}

function formatJson(value) {
  if (value == null || value === '') return null;
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

export default function ReportDetailSheet({ reportId, open, onOpenChange, onDownload }) {
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['pbx-report-detail', reportId],
    queryFn: () => pbxApi.getReport(reportId),
    enabled: open && !!reportId,
  });

  const fileId = data?.file_id || data?.file?.id;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Report #{reportId}</SheetTitle>
          <SheetDescription>Report status and download details.</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Loading report details…
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 mt-6">
            <p className="font-medium">Failed to load report</p>
            <p className="text-sm mt-1">{error.message}</p>
          </div>
        ) : data ? (
          <dl className="mt-6">
            <div className="mb-4">{statusBadge(data.status)}</div>
            <DetailRow label="Report type" value={data.report_type} />
            <DetailRow label="Created" value={data.created_at} />
            <DetailRow label="Notes" value={data.notes} />
            <DetailRow label="Error" value={data.error} />
            <DetailRow label="File ID" value={fileId} />
            <DetailRow label="File path" value={data.file?.file_path} />
            <DetailRow label="Requested by" value={data.user?.name || data.user?.email} />
            <DetailRow label="User email" value={data.user?.email} />
            <DetailRow label="Account ID" value={data.account_id} />
            {formatJson(data.parameters) ? (
              <div className="py-2">
                <p className="text-sm font-medium text-gray-500 mb-1">Parameters</p>
                <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto">{formatJson(data.parameters)}</pre>
              </div>
            ) : null}
          </dl>
        ) : null}

        <SheetFooter className="mt-6 gap-2 sm:justify-between">
          <Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh status'}
          </Button>
          {fileId && onDownload ? (
            <Button type="button" onClick={() => onDownload(fileId)}>
              <Download className="h-4 w-4 mr-1.5" />
              Download
            </Button>
          ) : null}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
