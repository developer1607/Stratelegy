import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { PbxDataTable } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import PbxFilterSelect from '@/components/pbx/shared/PbxFilterSelect';
import { describeReportFields, filterReportTypes, flattenReportTypes } from '@/lib/reportTypes';
import { uniqueFieldValues } from '@/lib/listFilters';

export default function ReportTypesPanel() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
    staleTime: 10 * 60 * 1000,
  });

  const allRows = useMemo(() => flattenReportTypes(data), [data]);

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

  if (isLoading) {
    return <p className="text-sm text-gray-500 py-8 text-center">Loading report catalog…</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
        {error.message || 'Failed to load report types'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search report name or type key…"
      >
        {categoryOptions.length > 0 && (
          <PbxFilterSelect
            value={categoryFilter}
            onValueChange={setCategoryFilter}
            options={categoryOptions}
            allLabel="All categories"
            className="w-[200px]"
          />
        )}
        <span className="text-sm text-gray-500 whitespace-nowrap">{rows.length} type(s)</span>
      </PbxListToolbar>

      <PbxDataTable
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'label', label: 'Report name' },
          { key: 'value', label: 'Type key' },
          { key: 'parameters', label: 'Parameters' },
        ]}
        rows={rows}
        emptyMessage="No report types are available for this account."
      />
    </div>
  );
}
