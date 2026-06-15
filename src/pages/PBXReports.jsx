import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { flattenReportTypes, filterReportTypes, describeReportFields } from '@/lib/reportTypes';
import { createPageUrl } from '@/utils';
import { uniqueFieldValues } from '@/lib/listFilters';

export default function PBXReports() {
  return (
    <PbxShell
      title="PBX Reports"
      description="Report catalog and completed exports from SkySwitch"
      requiresDomain={false}
    >
      <ReportsHub />
    </PbxShell>
  );
}

function ReportsHub() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const reportsQuery = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
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
          Available report types ({rows.length})
        </h2>
        <PbxDataTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'label', label: 'Report' },
            { key: 'value', label: 'Type key' },
            { key: 'parameters', label: 'Parameters' },
          ]}
          rows={rows}
          emptyMessage="No report types returned for this account."
        />
        <p className="text-xs text-gray-500 mt-3">
          Queue new reports in SkySwitch back-office. Download completed files below or on{' '}
          <Link to={createPageUrl('E911Reports')} className="underline font-medium">
            E911 Reports
          </Link>
          .
        </p>
      </section>

      <PbxCompletedExports title="Completed report exports" />
    </div>
  );
}
