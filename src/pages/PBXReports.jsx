import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePbxDomain } from "@/components/pbx/domain/PbxDomainContext";
import { PbxLoading } from "@/components/pbx/PbxShell";
import { PBX_REPORT_TAB_IDS } from "@/lib/navConfig";
import { cn } from "@/lib/utils";
import { OfflineEndpointsContent } from "@/pages/OfflineEndpoints";
import { EndpointControlContent } from "@/pages/EndpointControl";
import { E911Content } from "@/pages/E911Review";
import { SipAlgContent } from "@/pages/SIPALG";
import { SipTrunksContent } from "@/pages/SIPTrunks";
import { TroubleshootingContent } from "@/pages/Troubleshooting";
import { VoicemailContent } from "@/pages/Voicemail";
import DomainExportPanel from "@/components/pbx/reports/DomainExportPanel";

const REPORT_TABS = [
  { id: "offline-endpoint", label: "Offline Endpoint", needsDomain: false },
  { id: "device-monitoring", label: "Device Monitoring", needsDomain: true },
  { id: "domain-export", label: "Domain Export", needsDomain: false },
  { id: "e911-review", label: "E911 Review", needsDomain: false },
  { id: "sip-alg", label: "SIP ALG", needsDomain: false },
  { id: "sip-trunk", label: "SIP Trunk", needsDomain: false },
  { id: "vulnerability-check", label: "Vulnerability Check", needsDomain: false },
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">
          Scheduled email reports and live operational views.
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList
          className={cn(
            "h-auto w-full flex flex-wrap justify-start gap-1 rounded-none bg-transparent p-0",
            "border-b border-slate-200",
          )}
        >
          {REPORT_TABS.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium shadow-none",
                "text-slate-500 bg-transparent hover:text-slate-700",
                "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                "data-[state=active]:shadow-none data-[state=active]:hover:bg-blue-600",
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
      return <DomainExportPanel />;
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
