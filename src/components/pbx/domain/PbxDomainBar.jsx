import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { usePbxDomain } from "@/components/pbx/domain/PbxDomainContext";
import { usePermissions } from "@/hooks/usePermissions";
import { canViewPbxDomains } from "@/lib/permissions";
import { PBX_NAV, flattenPbxNav } from "@/lib/navConfig";
import { buildPalettePageUrl } from "@/lib/commandPaletteNav";
import { findDomainRecord } from "@/lib/pbxDomain";
import PbxDomainSearchSelect from "@/components/pbx/domain/PbxDomainSearchSelect";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe, Loader2, RefreshCw } from "lucide-react";

export default function PbxDomainBar({ currentPageName }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { domain, setDomain, domains, isLoading, error, isDomainRestricted } =
    usePbxDomain();
  const { permissions, canAccessPage } = usePermissions();
  const [refreshing, setRefreshing] = useState(false);

  const onDomainsPage = currentPageName === "PBXDomains";
  const showDomainsLink =
    !onDomainsPage &&
    canViewPbxDomains(permissions) &&
    canAccessPage("PBXDomains") &&
    !isDomainRestricted;

  const moduleOptions = useMemo(
    () => flattenPbxNav(PBX_NAV).filter((item) => canAccessPage(item.path)),
    [canAccessPage],
  );

  const domainLabel = useMemo(() => {
    if (!domain) return "";
    const record = findDomainRecord(domains, domain);
    return record?.description || record?.name || domain;
  }, [domains, domain]);

  const handleModuleChange = (pagePath) => {
    if (!pagePath || pagePath === currentPageName) return;
    navigate(buildPalettePageUrl(pagePath));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey?.[0];
          return typeof key === "string" && key.startsWith("pbx-");
        },
      });
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="bg-[#0D1B2E]/95 border-b border-white/10 px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider font-semibold shrink-0">
        <Globe className="h-3.5 w-3.5" />
        {isDomainRestricted ? "Assigned domain" : "Selected domain"}
      </div>
      {isDomainRestricted && (
        <span className="text-[11px] text-amber-200/90 sm:ml-1">
          View-only — data is limited to your assigned domain(s)
        </span>
      )}
      <p className="text-[10px] text-white/50 sm:hidden -mt-2">
        {isDomainRestricted
          ? "Choose one of your assigned domains"
          : "Your portal choice — not from SkySwitch"}
      </p>

      <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-2 min-w-0">
        {isLoading ? (
          <span className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading domains…
          </span>
        ) : error ? (
          <span className="text-sm text-red-300">Failed to load domains</span>
        ) : isDomainRestricted && domains.length === 1 ? (
          <span className="text-sm text-white font-mono truncate">
            {domain || domains[0]?.domain}
          </span>
        ) : (
          <PbxDomainSearchSelect
            domains={domains}
            value={domain}
            onValueChange={setDomain}
            disabled={!domains.length}
          />
        )}

        {showDomainsLink && (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-white/80 hover:text-white hover:bg-white/10 shrink-0"
          >
            <Link to={createPageUrl("PBXDomains")}>Browse all domains</Link>
          </Button>
        )}

        {moduleOptions.length > 0 && (
          <Select
            value={
              moduleOptions.some((item) => item.path === currentPageName)
                ? currentPageName
                : undefined
            }
            onValueChange={handleModuleChange}
          >
            <SelectTrigger className="h-9 min-w-[200px] max-w-[280px] border-white/20 bg-white/10 text-white text-sm shadow-none focus:ring-white/30 [&>span]:text-white">
              <SelectValue
                placeholder={
                  domainLabel
                    ? `Jump to module (${domainLabel})`
                    : "Jump to module"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {moduleOptions.map((item) => (
                <SelectItem key={item.path} value={item.path}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="text-white/80 hover:text-white hover:bg-white/10 shrink-0 gap-1.5"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>
    </div>
  );
}
