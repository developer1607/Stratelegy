import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxShell, {
  PbxDataTable,
  PbxError,
  PbxLoading,
} from "@/components/pbx/PbxShell";
import PbxListToolbar from "@/components/pbx/shared/PbxListToolbar";
import PbxFilterSelect from "@/components/pbx/shared/PbxFilterSelect";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  matchSearch,
  matchSelect,
  uniqueFieldValues,
  daysAgo,
  todayInput,
} from "@/lib/listFilters";

export default function CallLogs() {
  return (
    <PbxShell
      title="Call Logs"
      description="Audit and activity logs"
      requiresDomain={false}
    >
      <LogsContent />
    </PbxShell>
  );
}

function LogsContent() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(todayInput());
  const [resourceFilter, setResourceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pbx-audit-logs", startDate, endDate],
    queryFn: () =>
      pbxApi.auditLogs({ start_date: startDate, end_date: endDate, page: 1 }),
    retry: false,
  });

  const rawRows = useMemo(() => {
    return (Array.isArray(data) ? data : data?.data || []).map((item) => ({
      id: item.id,
      request_id: item.request_id,
      resource: item.resource,
      action: item.action,
      user_id: item.user_id,
      created_at: item.created_at,
      ip_address: item.ip_address,
    }));
  }, [data]);

  const resourceOptions = useMemo(
    () => uniqueFieldValues(rawRows, "resource"),
    [rawRows],
  );
  const actionOptions = useMemo(
    () => uniqueFieldValues(rawRows, "action"),
    [rawRows],
  );

  const rows = useMemo(() => {
    return rawRows.filter((row) => {
      if (
        !matchSearch(row, search, [
          "resource",
          "action",
          "user_id",
          "request_id",
          "ip_address",
        ])
      ) {
        return false;
      }
      if (!matchSelect(row.resource, resourceFilter)) return false;
      if (!matchSelect(row.action, actionFilter)) return false;
      return true;
    });
  }, [rawRows, search, resourceFilter, actionFilter]);

  if (isLoading) return <PbxLoading />;
  if (error) return <PbxError error={error} />;

  return (
    <div className="space-y-4">
      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search resource, action, user, IP…"
      >
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">From</Label>
            <Input
              id="call-logs-start-date"
              name="call-logs-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-[140px] bg-white"
            />
          </div>
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">To</Label>
            <Input
              id="call-logs-end-date"
              name="call-logs-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-[140px] bg-white"
            />
          </div>
          <PbxFilterSelect
            value={resourceFilter}
            onValueChange={setResourceFilter}
            options={resourceOptions}
            allLabel="All resources"
            className="w-[160px]"
          />
          <PbxFilterSelect
            value={actionFilter}
            onValueChange={setActionFilter}
            options={actionOptions}
            allLabel="All actions"
            className="w-[140px]"
          />
        </div>
      </PbxListToolbar>
      <PbxDataTable
        columns={[
          { key: "created_at", label: "Time" },
          { key: "resource", label: "Resource" },
          { key: "action", label: "Action" },
          { key: "user_id", label: "User" },
          { key: "request_id", label: "Request ID" },
          { key: "ip_address", label: "IP" },
        ]}
        rows={rows}
        emptyMessage="No audit logs match your filters."
      />
    </div>
  );
}
