import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import { flattenReportTypes } from '@/lib/reportTypes';

export default function E911Reports() {
  return (
    <PbxShell title="E911 Reports" description="E911 endpoint inventory and emergency location data" requiresDomain={false}>
      <ReportsContent />
    </PbxShell>
  );
}

function ReportsContent() {
  const e911Query = useQuery({ queryKey: ['pbx-e911'], queryFn: () => pbxApi.e911() });
  const reportsQuery = useQuery({ queryKey: ['pbx-report-types'], queryFn: () => pbxApi.reportTypes() });

  const reportRows = useMemo(
    () =>
      flattenReportTypes(reportsQuery.data).filter((item) =>
        /e911|911|emergency/i.test(`${item.label} ${item.value}`)
      ),
    [reportsQuery.data]
  );

  if (e911Query.isLoading || reportsQuery.isLoading) return <PbxLoading />;
  if (e911Query.error) return <PbxError error={e911Query.error} />;
  if (reportsQuery.error) return <PbxError error={reportsQuery.error} />;

  const e911Rows = (e911Query.data || []).map((item) => ({
    phone_number: item.phone_number,
    state: item.location?.address?.civic_address?.state,
    msag_status: item.location?.level_of_service?.msag_status,
    position_status: item.location?.level_of_service?.position_status,
    delivery: item.location?.delivery,
  }));

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">E911 endpoint summary ({e911Rows.length})</h2>
        <PbxDataTable
          columns={[
            { key: 'phone_number', label: 'Phone' },
            { key: 'state', label: 'State' },
            { key: 'msag_status', label: 'MSAG' },
            { key: 'position_status', label: 'Position' },
            { key: 'delivery', label: 'Delivery' },
          ]}
          rows={e911Rows}
        />
      </section>
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">E911-related report types</h2>
        <PbxDataTable
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'label', label: 'Report' },
            { key: 'value', label: 'Type key' },
          ]}
          rows={reportRows}
          emptyMessage="No E911 reports are available for this account."
        />
      </section>
      <PbxCompletedExports title="Completed report exports" />
    </div>
  );
}
