import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import { flattenReportTypes } from '@/lib/reportTypes';

export default function MOSScores() {
  return (
    <PbxShell
      title="MOS Scores"
      description="MOS scores and voice quality metrics"
      requiresDomain={false}
    >
      <MosContent />
    </PbxShell>
  );
}

function MosContent() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['pbx-mos-reports'],
    queryFn: () => pbxApi.mosReports(),
  });

  const { rows, usedFallback } = useMemo(() => {
    const mosRelated = data?.mosRelated || [];
    if (mosRelated.length) {
      return {
        rows: mosRelated.map((item) => ({
          category: item.category,
          label: item.label,
          value: item.value,
        })),
        usedFallback: false,
      };
    }
    const fallback = flattenReportTypes(data?.raw)
      .filter((item) => /mos|quality|voice/i.test(`${item.label} ${item.value}`))
      .slice(0, 20);
    return { rows: fallback, usedFallback: fallback.length > 0 };
  }, [data]);

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        Voice quality reports for this account. Download completed exports from{' '}
        <Link to={createPageUrl('PBXGeneratedReports')} className="text-[#F07020] hover:underline">
          Generated Reports
        </Link>
        .
      </p>
      <PbxDataTable
        columns={[
          { key: 'category', label: 'Category' },
          { key: 'label', label: 'Report' },
          { key: 'value', label: 'Type key' },
        ]}
        rows={rows}
        emptyMessage="No voice quality reports are available for this account."
      />
      {usedFallback && (
        <p className="text-sm text-gray-500">Showing the closest matching reports for this account.</p>
      )}
    </div>
  );
}
