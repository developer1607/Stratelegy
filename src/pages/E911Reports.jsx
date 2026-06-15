import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import { flattenReportTypes } from '@/lib/reportTypes';
import { usePermissions } from '@/hooks/usePermissions';
import { canAccessPbxDataScope, isPbxDomainRestricted } from '@/lib/permissions';
import { usePbxDomain } from '@/components/pbx/domain/PbxDomainContext';

export default function E911Reports() {
  return (
    <PbxShell
      title="E911 Reports"
      description="E911 endpoint inventory and emergency location data"
      requiresDomain={false}
    >
      <ReportsContent />
    </PbxShell>
  );
}

function ReportsContent() {
  const { permissions } = usePermissions();
  const { domain } = usePbxDomain();
  const domainRestricted = isPbxDomainRestricted(permissions);
  const canViewE911Endpoints = canAccessPbxDataScope(permissions, 'e911Review');

  const e911Query = useQuery({
    queryKey: ['pbx-e911', domain],
    queryFn: () => pbxApi.e911(domain),
    enabled: canViewE911Endpoints && (!domainRestricted || !!domain),
  });
  const reportsQuery = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
    enabled: !domainRestricted,
  });

  const reportRows = useMemo(
    () =>
      flattenReportTypes(reportsQuery.data).filter((item) =>
        /e911|911|emergency/i.test(`${item.label} ${item.value}`)
      ),
    [reportsQuery.data]
  );

  if (domainRestricted && !domain && canViewE911Endpoints) {
    return (
      <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
        Select an assigned domain in the bar above to view E911 endpoints for that domain.
      </p>
    );
  }

  if ((canViewE911Endpoints && e911Query.isLoading) || reportsQuery.isLoading) return <PbxLoading />;
  if (canViewE911Endpoints && e911Query.error) return <PbxError error={e911Query.error} />;
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
      {canViewE911Endpoints ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            E911 endpoint summary ({e911Rows.length})
          </h2>
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
      ) : null}
      {!domainRestricted && (
        <>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">E911-related report types</h2>
            <PbxDataTable
              columns={[
                { key: 'category', label: 'Category' },
                { key: 'label', label: 'Report' },
                { key: 'value', label: 'Type key' },
              ]}
              rows={reportRows}
              emptyMessage="No E911 reports for this account."
            />
          </section>
          <PbxCompletedExports title="Completed report exports" />
        </>
      )}
      {domainRestricted && (
        <p className="text-sm text-gray-500">
          Account-wide E911 report exports are not available for domain-scoped users. Use E911 Review
          for domain-specific endpoint details.
        </p>
      )}
    </div>
  );
}
