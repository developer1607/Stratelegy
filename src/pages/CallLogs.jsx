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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

function DateRange({ startDate, endDate, onStartChange, onEndChange }) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <div>
        <Label className="text-xs text-gray-500 mb-1 block">From</Label>
        <Input
          id="call-logs-start-date"
          name="call-logs-start-date"
          type="date"
          value={startDate}
          onChange={(e) => onStartChange(e.target.value)}
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
          onChange={(e) => onEndChange(e.target.value)}
          className="h-9 w-[140px] bg-white"
        />
      </div>
    </div>
  );
}

function AuditTab({ search, startDate, endDate }) {
  const [resourceFilter, setResourceFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const actionsQ = useQuery({
    queryKey: ["pbx-audit-actions"],
    queryFn: () => pbxApi.auditActions(),
    retry: false,
  });

  const auditQ = useQuery({
    queryKey: ["pbx-audit-logs", startDate, endDate],
    queryFn: () =>
      pbxApi.auditLogs({ start_date: startDate, end_date: endDate, page: 1 }),
    retry: false,
  });

  const rawRows = useMemo(() => {
    const data = auditQ.data;
    return (Array.isArray(data) ? data : data?.data || []).map((item) => ({
      id: item.id,
      request_id: item.request_id,
      resource: item.resource,
      action: item.action,
      user_id: item.user_id,
      created_at: item.created_at,
      ip_address: item.ip_address,
    }));
  }, [auditQ.data]);

  const resourceOptions = useMemo(() => {
    const fromApi = (actionsQ.data || []).map((item) => item.resource);
    const fromRows = uniqueFieldValues(rawRows, "resource");
    return [...new Set([...fromApi, ...fromRows].filter(Boolean))].sort();
  }, [actionsQ.data, rawRows]);

  const actionOptions = useMemo(() => {
    const fromApi = (actionsQ.data || []).map((item) => item.action);
    const fromRows = uniqueFieldValues(rawRows, "action");
    return [...new Set([...fromApi, ...fromRows].filter(Boolean))].sort();
  }, [actionsQ.data, rawRows]);

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

  if (auditQ.isLoading) return <PbxLoading />;
  if (auditQ.error) return <PbxError error={auditQ.error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
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

function JournalTab({ search, startDate, endDate }) {
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const journalQ = useQuery({
    queryKey: ["pbx-journals", startDate, endDate],
    queryFn: () =>
      pbxApi.journals({ start_date: startDate, end_date: endDate, page: 1 }),
    retry: false,
  });

  const typesQ = useQuery({
    queryKey: ["pbx-journal-types"],
    queryFn: () => pbxApi.journalMeta(),
    retry: false,
  });

  const rawRows = useMemo(() => {
    const data = journalQ.data;
    return (Array.isArray(data) ? data : data?.data || []).map((item) => ({
      id: item.id,
      created_at: item.created_at,
      module: item.module,
      type: item.type,
      action: item.action,
      identifier: item.identifier,
      notes: item.notes,
      created_by: item.user?.name || item.created_by,
    }));
  }, [journalQ.data]);

  const moduleOptions = useMemo(() => {
    const fromMeta = Array.isArray(typesQ.data)
      ? typesQ.data.map((item) => item.module)
      : [];
    return [...new Set([...fromMeta, ...uniqueFieldValues(rawRows, "module")])].filter(
      Boolean
    );
  }, [typesQ.data, rawRows]);

  const actionOptions = useMemo(
    () => uniqueFieldValues(rawRows, "action"),
    [rawRows]
  );

  const rows = useMemo(() => {
    return rawRows.filter((row) => {
      if (
        !matchSearch(row, search, [
          "module",
          "type",
          "action",
          "identifier",
          "notes",
          "created_by",
        ])
      ) {
        return false;
      }
      if (!matchSelect(row.module, moduleFilter)) return false;
      if (!matchSelect(row.action, actionFilter)) return false;
      return true;
    });
  }, [rawRows, search, moduleFilter, actionFilter]);

  if (journalQ.isLoading) return <PbxLoading />;
  if (journalQ.error) return <PbxError error={journalQ.error} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <PbxFilterSelect
          value={moduleFilter}
          onValueChange={setModuleFilter}
          options={moduleOptions}
          allLabel="All modules"
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
      <PbxDataTable
        columns={[
          { key: "created_at", label: "Time" },
          { key: "module", label: "Module" },
          { key: "type", label: "Type" },
          { key: "action", label: "Action" },
          { key: "identifier", label: "Identifier" },
          { key: "created_by", label: "User" },
          { key: "notes", label: "Notes" },
        ]}
        rows={rows}
        emptyMessage="No journal entries match your filters."
      />
    </div>
  );
}

function LogsContent() {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(daysAgo(7));
  const [endDate, setEndDate] = useState(todayInput());

  return (
    <Tabs defaultValue="audit" className="space-y-4">
      <TabsList>
        <TabsTrigger value="audit">Audit logs</TabsTrigger>
        <TabsTrigger value="journals">Journals</TabsTrigger>
      </TabsList>

      <PbxListToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search resource, action, user, IP…"
      >
        <DateRange
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </PbxListToolbar>

      <TabsContent value="audit">
        <AuditTab search={search} startDate={startDate} endDate={endDate} />
      </TabsContent>

      <TabsContent value="journals">
        <JournalTab search={search} startDate={startDate} endDate={endDate} />
      </TabsContent>
    </Tabs>
  );
}
