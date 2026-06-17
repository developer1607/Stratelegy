import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Play } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import QueueReportDialog from '@/components/pbx/reports/QueueReportDialog';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { flattenReportTypes, filterReportTypes, describeReportFields } from '@/lib/reportTypes';
import { uniqueFieldValues } from '@/lib/listFilters';
import { usePermissions } from '@/hooks/usePermissions';

export default function PBXReports() {
  return (
    <PbxShell
      title="Report catalog"
      description="All async export types available for your account"
      requiresDomain={false}
    >
      <ReportsCatalog />
    </PbxShell>
  );
}

function ReportsCatalog() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [queueType, setQueueType] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const { isPbxDomainRestricted, isLoading: permissionsLoading } = usePermissions();
  const canUseAccountReports = !isPbxDomainRestricted;

  const reportsQuery = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
    enabled: canUseAccountReports && !permissionsLoading,
  });

  const allRows = useMemo(() => flattenReportTypes(reportsQuery.data), [reportsQuery.data]);

  const categoryOptions = useMemo(() => uniqueFieldValues(allRows, 'category'), [allRows]);

  const rows = useMemo(() => {
    let list = filterReportTypes(allRows, search);
    if (categoryFilter !== 'all') {
      list = list.filter((row) => row.category === categoryFilter);
    }
    return list.map((row) => ({
      ...row,
      parameters: describeReportFields(row.fields),
    }));
  }, [allRows, search, categoryFilter]);

  if (permissionsLoading) return <PbxLoading />;

  if (!canUseAccountReports) {
    return (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        Account-wide PBX report exports are not available for domain-scoped users. Use the
        individual report pages under Reports for domain-specific live views where available.
      </p>
    );
  }

  if (reportsQuery.isLoading) return <PbxLoading />;
  if (reportsQuery.error) return <PbxError error={reportsQuery.error} />;

  return (
    <div className="space-y-8">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search report name or category…"
      >
        <PbxFilterSelect
          value={categoryFilter}
          onValueChange={setCategoryFilter}
          options={categoryOptions}
          allLabel="All categories"
        />
      </PbxListToolbar>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          All report types ({rows.length})
        </h2>
        <PbxDataTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'label', label: 'Report' },
            { key: 'value', label: 'Type key' },
            { key: 'parameters', label: 'Parameters' },
            {
              key: 'actions',
              label: 'Actions',
              render: (row) => (
                <PermissionGate pbxAction="manageReports" fallback="—">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setQueueType(row);
                      setQueueOpen(true);
                    }}
                  >
                    <Play className="h-3.5 w-3.5 mr-1" />
                    Queue
                  </Button>
                </PermissionGate>
              ),
            },
          ]}
          rows={rows}
          emptyMessage="No report types returned for this account."
        />
      </section>

      <PbxCompletedExports title="All report exports" />

      <QueueReportDialog open={queueOpen} onOpenChange={setQueueOpen} reportType={queueType} />
    </div>
  );
}
