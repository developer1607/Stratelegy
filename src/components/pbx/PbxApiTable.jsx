import React, { useMemo, useState } from 'react';
import { PbxDataTable } from '@/components/pbx/PbxShell';
import PbxListToolbar from '@/components/pbx/shared/PbxListToolbar';
import { matchSearch } from '@/lib/listFilters';
import { columnsFromRecords, formatPbxCell, preparePbxRows } from '@/lib/pbxTable';

export default function PbxApiTable({
  rows,
  columns: fixedColumns,
  emptyMessage = 'No records returned.',
  maxCols = 16,
  exclude = [],
  searchable = true,
  searchPlaceholder = 'Filter…',
  toolbar,
  showCount = true,
}) {
  const [search, setSearch] = useState('');

  const flatRows = useMemo(() => {
    if (!rows?.length) return [];
    if (fixedColumns) return rows;
    return preparePbxRows(rows);
  }, [rows, fixedColumns]);

  const filteredRows = useMemo(() => {
    if (!searchable || !search.trim()) return flatRows;
    const q = search.trim().toLowerCase();
    return flatRows.filter((row) => matchSearch(row, q, Object.keys(row)));
  }, [flatRows, search, searchable]);

  const columns = useMemo(() => {
    if (fixedColumns) {
      return fixedColumns.map((col) =>
        col.render ? col : { ...col, render: (row) => formatPbxCell(row[col.key]) }
      );
    }
    return columnsFromRecords(flatRows, { maxCols, exclude });
  }, [flatRows, fixedColumns, maxCols, exclude]);

  const showToolbar = searchable || toolbar;

  return (
    <div className="space-y-3">
      {showToolbar && (
        <PbxListToolbar
          search={searchable ? search : undefined}
          onSearchChange={searchable ? setSearch : undefined}
          searchPlaceholder={searchPlaceholder}
        >
          {toolbar}
        </PbxListToolbar>
      )}
      {showCount && flatRows.length > 0 && (
        <p className="text-xs text-gray-500">
          {filteredRows.length === flatRows.length
            ? `${flatRows.length} record(s)`
            : `${filteredRows.length} of ${flatRows.length} record(s)`}
        </p>
      )}
      <PbxDataTable columns={columns} rows={filteredRows} emptyMessage={emptyMessage} />
    </div>
  );
}
