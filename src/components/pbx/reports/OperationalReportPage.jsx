import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxShell, { PbxError, PbxLoading } from "@/components/pbx/PbxShell";
import PbxCompletedExports from "@/components/pbx/reports/PbxCompletedExports";
import PbxReportExportActions from "@/components/pbx/reports/PbxReportExportActions";
import PbxReportLiveData from "@/components/pbx/reports/PbxReportLiveData";
import { flattenReportTypes } from "@/lib/reportTypes";
import {
  resolveReportTypesForPage,
  exportMatchForPage,
} from "@shared/pbxReportPages.js";
import { usePermissions } from "@/hooks/usePermissions";

export default function OperationalReportPage({ config, embedded = false }) {
  const { isPbxDomainRestricted, isLoading: permissionsLoading } =
    usePermissions();
  const canUseAccountReports = !isPbxDomainRestricted;

  const reportsQuery = useQuery({
    queryKey: ["pbx-report-types"],
    queryFn: () => pbxApi.reportTypes(),
    enabled: canUseAccountReports && !permissionsLoading,
  });

  const reportTypes = useMemo(() => {
    const catalogRows = flattenReportTypes(reportsQuery.data);
    return resolveReportTypesForPage(config, catalogRows);
  }, [config, reportsQuery.data]);

  const requiresDomain = config.requiresDomain !== false;

  const wrap = (body, { actions, description } = {}) => {
    if (embedded) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{config.title}</h2>
              {description ? (
                <p className="text-sm text-gray-500 mt-1">{description}</p>
              ) : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
          </div>
          {body}
        </div>
      );
    }

    return (
      <PbxShell
        title={config.title}
        description={description ?? config.description}
        requiresDomain={requiresDomain}
        actions={actions}
      >
        {body}
      </PbxShell>
    );
  };

  if (permissionsLoading) {
    return wrap(<PbxLoading />);
  }

  if (!canUseAccountReports) {
    return wrap(
      <>
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          Account-wide report exports are not available for domain-scoped users.
          Live data below uses your assigned domain when selected above.
        </p>
        <div className="mt-6">
          <PbxReportLiveData config={config} />
        </div>
      </>
    );
  }

  if (reportsQuery.isLoading) {
    return wrap(<PbxLoading />, {
      actions: <PbxReportExportActions reportTypes={[]} />,
    });
  }

  if (reportsQuery.error) {
    return wrap(<PbxError error={reportsQuery.error} />);
  }

  return wrap(
    <div className="space-y-10">
      <PbxReportLiveData config={config} />

      {exportMatchForPage(config) ? (
        <PbxCompletedExports
          title="Export history"
          description="Previously generated files. Downloads are available when status is completed."
          reportTypeMatch={exportMatchForPage(config)}
        />
      ) : null}
    </div>,
    {
      description:
        "Live data for your account. Use Generate export for a downloadable file.",
      actions: <PbxReportExportActions reportTypes={reportTypes} />,
    }
  );
}
