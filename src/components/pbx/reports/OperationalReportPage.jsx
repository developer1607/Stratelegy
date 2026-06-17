import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Play } from 'lucide-react';
import { pbxApi } from '@/api/pbx';
import PbxShell, { PbxDataTable, PbxError, PbxLoading } from '@/components/pbx/PbxShell';
import PbxCompletedExports from '@/components/pbx/reports/PbxCompletedExports';
import QueueReportDialog from '@/components/pbx/reports/QueueReportDialog';
import PermissionGate from '@/components/PermissionGate';
import { Button } from '@/components/ui/button';
import { flattenReportTypes, describeReportFields } from '@/lib/reportTypes';
import { resolveReportTypesForPage, exportMatchForPage } from '@shared/pbxReportPages.js';
import { createPageUrl } from '@/utils';
import { usePermissions } from '@/hooks/usePermissions';

export default function OperationalReportPage({ config }) {
  return (
    <PbxShell title={config.title} description={config.description} requiresDomain={false}>
      <ReportContent config={config} />
    </PbxShell>
  );
}

function ReportContent({ config }) {
  const [queueType, setQueueType] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const { isPbxDomainRestricted, isLoading: permissionsLoading } = usePermissions();
  const canUseAccountReports = !isPbxDomainRestricted;

  const reportsQuery = useQuery({
    queryKey: ['pbx-report-types'],
    queryFn: () => pbxApi.reportTypes(),
    enabled: canUseAccountReports && !permissionsLoading,
  });

  const catalogRows = useMemo(
    () => flattenReportTypes(reportsQuery.data),
    [reportsQuery.data]
  );

  const reportTypes = useMemo(
    () => resolveReportTypesForPage(config, catalogRows),
    [config, catalogRows]
  );

  const typeRows = useMemo(
    () =>
      reportTypes.map((row) => ({
        ...row,
        parameters: describeReportFields(row.fields),
      })),
    [reportTypes]
  );

  if (permissionsLoading) return <PbxLoading />;

  if (!canUseAccountReports) {
    return (
      <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
        Account-wide report exports are not available for domain-scoped users.
        {config.livePage ? (
          <>
            {' '}
            Use{' '}
            <Link to={createPageUrl(config.livePage)} className="underline font-medium">
              {config.livePageLabel || config.title}
            </Link>{' '}
            for domain-specific data.
          </>
        ) : null}
      </p>
    );
  }

  if (reportsQuery.isLoading) return <PbxLoading />;
  if (reportsQuery.error) return <PbxError error={reportsQuery.error} />;

  return (
    <div className="space-y-8">
      {config.livePage ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to={createPageUrl(config.livePage)}>
              <ExternalLink className="h-4 w-4 mr-1.5" />
              {config.livePageLabel || 'Open live view'}
            </Link>
          </Button>
        </div>
      ) : null}

      {typeRows.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Queue export</h2>
          <PbxDataTable
            columns={[
              { key: 'label', label: 'Report' },
              { key: 'value', label: 'Type key' },
              { key: 'category', label: 'Category' },
              { key: 'parameters', label: 'Parameters' },
              {
                key: 'actions',
                label: 'Actions',
                render: (row) => (
                  <PermissionGate pbxAction="manageReports" fallback="—">
                    <Button
                      size="sm"
                      variant="default"
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
            rows={typeRows}
            emptyMessage="No export types available for this account."
          />
        </section>
      ) : (
        <p className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          No async export types are available for this report on your account.
          {config.livePage ? ' Use the live view link above for operational data.' : null}
        </p>
      )}

      {exportMatchForPage(config) ? (
        <PbxCompletedExports
          title="Completed exports"
          reportTypeMatch={exportMatchForPage(config)}
        />
      ) : null}

      <QueueReportDialog open={queueOpen} onOpenChange={setQueueOpen} reportType={queueType} />
    </div>
  );
}
