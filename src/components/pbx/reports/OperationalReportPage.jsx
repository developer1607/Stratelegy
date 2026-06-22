import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import PbxReportExportActions from '@/components/pbx/reports/PbxReportExportActions';
import PbxReportLiveData from '@/components/pbx/reports/PbxReportLiveData';
import { flattenReportTypes } from '@/lib/reportTypes';
import { resolveReportTypesForPage, exportMatchForPage } from '@shared/pbxReportPages.js';
import { usePermissions } from '@/hooks/usePermissions';

export default function OperationalReportPage({ config }) {
  const { isPbxDomainRestricted, isLoading: permissionsLoading } = usePermissions();
  const canUseAccountReports = !isPbxDomainRestricted;

  const reportsQuery = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
    enabled: canUseAccountReports && !permissionsLoading,
  });

  const reportTypes = useMemo(() => {
    const catalogRows = flattenReportTypes(reportsQuery.data);
    return resolveReportTypesForPage(config, catalogRows);
  }, [config, reportsQuery.data]);

  const requiresDomain = config.requiresDomain !== false;

  if (permissionsLoading) {
    return (
      <PbxShell title={config.title} description={config.description} requiresDomain={requiresDomain}>
        <PbxLoading />
      </PbxShell>
    );
  }

  if (!canUseAccountReports) {
    return (
      <PbxShell title={config.title} description={config.description} requiresDomain={requiresDomain}>
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          Account-wide report exports are not available for domain-scoped users. Live data below uses
          your assigned domain when selected above.
        </p>
        <div className="mt-6">
          <PbxReportLiveData config={config} />
        </div>
      </PbxShell>
    );
  }

  if (reportsQuery.isLoading) {
    return (
      <PbxShell
        title={config.title}
        description={config.description}
        requiresDomain={requiresDomain}
        actions={<PbxReportExportActions reportTypes={[]} />}
      >
        <PbxLoading />
      </PbxShell>
    );
  }

  if (reportsQuery.error) {
    return (
      <PbxShell title={config.title} description={config.description} requiresDomain={requiresDomain}>
        <PbxError error={reportsQuery.error} />
      </PbxShell>
    );
  }

  return (
    <PbxShell
      title={config.title}
      description="Live data for your account. Use Generate export for a downloadable file."
      requiresDomain={requiresDomain}
      actions={<PbxReportExportActions reportTypes={reportTypes} />}
    >
      <div className="space-y-10">
        <PbxReportLiveData config={config} />

        {exportMatchForPage(config) ? (
          <PbxCompletedExports
            title="Export history"
            description="Previously generated files. Downloads are available when status is completed."
            reportTypeMatch={exportMatchForPage(config)}
          />
        ) : null}
      </div>
    </PbxShell>
  );
}
