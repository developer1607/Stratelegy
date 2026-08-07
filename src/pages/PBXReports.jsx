import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Play } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { usePbxDomain } from "@/components/pbx/domain/PbxDomainContext";
import { PbxDataTable, PbxError, PbxLoading } from "@/components/pbx/PbxShell";
import PbxCompletedExports from "@/components/pbx/reports/PbxCompletedExports";
import QueueReportDialog from "@/components/pbx/reports/QueueReportDialog";
import PbxListToolbar from "@/components/pbx/shared/PbxListToolbar";
import PbxFilterSelect from "@/components/pbx/shared/PbxFilterSelect";
import PermissionGate from "@/components/PermissionGate";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  flattenReportTypes,
  filterReportTypes,
  describeReportFields,
} from "@/lib/reportTypes";
import { uniqueFieldValues } from "@/lib/listFilters";
import { usePermissions } from "@/hooks/usePermissions";
import { PBX_REPORT_TAB_IDS } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { OfflineEndpointsContent } from "@/pages/OfflineEndpoints";
import { EndpointControlContent } from "@/pages/EndpointControl";
import { E911Content } from "@/pages/E911Review";
import { SipAlgContent } from "@/pages/SIPALG";
import { SipTrunksContent } from "@/pages/SIPTrunks";
import { TroubleshootingContent } from "@/pages/Troubleshooting";
import { VoicemailContent } from "@/pages/Voicemail";

const REPORT_TABS = [
  { id: "offline-endpoint", label: "Offline Endpoint", needsDomain: true },
  { id: "device-monitoring", label: "Device Monitoring", needsDomain: true },
  { id: "domain-export", label: "Domain Export", needsDomain: false },
  { id: "e911-review", label: "E911 Review", needsDomain: true },
  { id: "sip-alg", label: "SIP ALG", needsDomain: true },
  { id: "sip-trunk", label: "SIP Trunk", needsDomain: false },
  { id: "vulnerability-check", label: "Vulnerability Check", needsDomain: true },
  { id: "voicemail", label: "Voicemail", needsDomain: true },
];

function resolveTabId(raw) {
  const value = String(raw || "").trim();
  if (PBX_REPORT_TAB_IDS.includes(value)) return value;
  return REPORT_TABS[0].id;
}

export default function PBXReports() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { domain, isLoading: domainLoading } = usePbxDomain();
  const tab = resolveTabId(searchParams.get("tab"));

  const setTab = (nextTab) => {
    const id = resolveTabId(nextTab);
    const next = new URLSearchParams(searchParams);
    if (id === REPORT_TABS[0].id) next.delete("tab");
    else next.set("tab", id);
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    const raw = searchParams.get("tab");
    if (raw && !PBX_REPORT_TAB_IDS.includes(raw)) {
      const next = new URLSearchParams(searchParams);
      next.delete("tab");
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-4 sm:p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Reports</h1>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList
          className={cn(
            "h-auto w-full flex flex-wrap justify-start gap-1 rounded-none bg-transparent p-0",
            "border-b border-gray-200"
          )}
        >
          {REPORT_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium shadow-none",
                "text-gray-500 bg-transparent hover:text-gray-700",
                "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                "data-[state=active]:shadow-none data-[state=active]:hover:bg-blue-600"
              )}
            >
              {item.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {REPORT_TABS.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-6">
            <ReportTabBody
              tabId={item.id}
              needsDomain={item.needsDomain}
              domain={domain}
              domainLoading={domainLoading}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function DomainRequired() {
  return (
    <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
      Select a domain in the bar above to load this report.
    </p>
  );
}

function ReportTabBody({ tabId, needsDomain, domain, domainLoading }) {
  if (needsDomain) {
    if (domainLoading) return <PbxLoading />;
    if (!domain) return <DomainRequired />;
  }

  switch (tabId) {
    case "offline-endpoint":
      return <OfflineEndpointsContent domain={domain} />;
    case "device-monitoring":
      return <EndpointControlContent domain={domain} />;
    case "domain-export":
      return <ReportsCatalog />;
    case "e911-review":
      return <E911Content domain={domain} />;
    case "sip-alg":
      return <SipAlgContent domain={domain} />;
    case "sip-trunk":
      return <SipTrunksContent />;
    case "vulnerability-check":
      return <TroubleshootingContent domain={domain} />;
    case "voicemail":
      return <VoicemailContent domain={domain} />;
    default:
      return null;
  }
}

/** Account-wide async export catalog (Domain Export tab). */
function ReportsCatalog() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [queueType, setQueueType] = useState(null);
  const [queueOpen, setQueueOpen] = useState(false);
  const { isPbxDomainRestricted, isLoading: permissionsLoading } = usePermissions();
  const canUseAccountReports = !isPbxDomainRestricted;

  const reportsQuery = useQuery({
    queryKey: ["pbx-report-types"],
    queryFn: () => pbxApi.reportTypes(),
    enabled: canUseAccountReports && !permissionsLoading,
  });

  const allRows = useMemo(
    () => flattenReportTypes(reportsQuery.data),
    [reportsQuery.data]
  );

  const categoryOptions = useMemo(
    () => uniqueFieldValues(allRows, "category"),
    [allRows]
  );

  const rows = useMemo(() => {
    let list = filterReportTypes(allRows, search);
    if (categoryFilter !== "all") {
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
        Account-wide PBX report exports are not available for domain-scoped users.
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
            { key: "category", label: "Category" },
            { key: "label", label: "Report" },
            { key: "value", label: "Type key" },
            { key: "parameters", label: "Parameters" },
            {
              key: "actions",
              label: "Actions",
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

      <QueueReportDialog
        open={queueOpen}
        onOpenChange={setQueueOpen}
        reportType={queueType}
      />
    </div>
  );
}
