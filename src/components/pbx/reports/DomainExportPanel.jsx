import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pbxApi } from "@/api/pbx";
import PermissionGate from "@/components/PermissionGate";
import { usePbxDomain } from "@/components/pbx/domain/PbxDomainContext";
import DomainSearchSelect from "@/components/pbx/reports/DomainSearchSelect";
import ReportScheduleRecipients, {
  emptyRecipients,
  recipientsForApi,
  validateRecipients,
} from "@/components/pbx/reports/ReportScheduleRecipients";
import {
  ReportField,
  ReportResultPanel,
  ReportScheduleSection,
} from "@/components/pbx/reports/ReportScheduleSection";
import PbxCompletedExports from "@/components/pbx/reports/PbxCompletedExports";
import { PbxDataTable, PbxError, PbxLoading } from "@/components/pbx/PbxShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  describeReportFields,
  flattenReportTypes,
} from "@/lib/reportTypes";
import { usePermissions } from "@/hooks/usePermissions";
import { cn } from "@/lib/utils";

const WEEKDAYS = [
  { value: "everyday", label: "Every day" },
  { value: "0", label: "Sunday" },
  { value: "1", label: "Monday" },
  { value: "2", label: "Tuesday" },
  { value: "3", label: "Wednesday" },
  { value: "4", label: "Thursday" },
  { value: "5", label: "Friday" },
  { value: "6", label: "Saturday" },
];

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

function formatDateOnly(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return String(iso);
  }
}

function formatScheduleDay(days) {
  if (!Array.isArray(days) || days.length === 0) return "Every day";
  return days
    .map((d) => WEEKDAYS.find((w) => w.value === String(d))?.label || String(d))
    .join(", ");
}

function formatScheduleTime(times) {
  if (!Array.isArray(times) || !times.length) return "—";
  return times
    .map((t) => {
      const [h, m] = String(t).split(":");
      const hour = Number(h);
      if (!Number.isFinite(hour)) return t;
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12}:${m || "00"} ${ampm}`;
    })
    .join(", ");
}

/**
 * Domain Export — James fields + Insight layout + selectable report list.
 * Prefills Domains from the page domain / top domain bar when present.
 */
export default function DomainExportPanel({ domain: domainProp }) {
  const queryClient = useQueryClient();
  const { domain: contextDomain } = usePbxDomain();
  const barDomain = domainProp || contextDomain || "";
  const { canPbxAction, isAdmin, isLoading: permsLoading } = usePermissions();
  const canManage = isAdmin || canPbxAction("manageReports");

  const [immediateDomain, setImmediateDomain] = useState(barDomain);
  const [immediateRecipients, setImmediateRecipients] = useState(
    emptyRecipients(),
  );
  const [selectedReportType, setSelectedReportType] = useState("");

  const [dailyDomain, setDailyDomain] = useState(barDomain);
  const [dailyDay, setDailyDay] = useState("everyday");
  const [dailyTime, setDailyTime] = useState("08:00");
  const [dailyRecipients, setDailyRecipients] = useState(emptyRecipients());

  // Keep schedule domain pickers aligned with the domain-based page / top bar.
  useEffect(() => {
    if (!barDomain) return;
    setImmediateDomain(barDomain);
    setDailyDomain(barDomain);
  }, [barDomain]);

  const domainsQuery = useQuery({
    queryKey: ["pbx-domains"],
    queryFn: () => pbxApi.domains(),
  });

  const reportTypesQuery = useQuery({
    queryKey: ["pbx-report-types"],
    queryFn: () => pbxApi.reportTypes(),
  });

  const schedulesQuery = useQuery({
    queryKey: ["pbx-report-schedules", "domain_export"],
    queryFn: () => pbxApi.listReportSchedules({ type: "domain_export" }),
  });

  const domains = useMemo(() => {
    const list = domainsQuery.data || [];
    return list
      .map((row) => (typeof row === "string" ? row : row?.domain))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [domainsQuery.data]);

  const reportTypeRows = useMemo(() => {
    return flattenReportTypes(reportTypesQuery.data).map((row) => ({
      ...row,
      parameters: describeReportFields(row.fields),
    }));
  }, [reportTypesQuery.data]);

  const schedules = schedulesQuery.data?.schedules || [];

  const immediateMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(immediateRecipients);
      if (recipientError) throw new Error(recipientError);
      if (!immediateDomain) throw new Error("Please select a domain first");
      if (!selectedReportType) {
        throw new Error("Select which report type to export from the list below");
      }
      return pbxApi.immediateDomainExport({
        domain: immediateDomain,
        recipients: recipientsForApi(immediateRecipients),
        report_type: selectedReportType,
      });
    },
    onSuccess: (result) => {
      toast.success(
        result?.message ||
          "Domain Export queued — email arrives when the file is ready (~5 min).",
      );
      queryClient.invalidateQueries({ queryKey: ["pbx-generated-reports"] });
    },
    onError: (err) => {
      toast.error(err?.message || "Domain Export failed");
    },
  });

  const saveDailyMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(dailyRecipients);
      if (recipientError) throw new Error(recipientError);
      if (!dailyDomain) throw new Error("Please select a domain first");
      if (!selectedReportType) {
        throw new Error("Select which report type to export from the list below");
      }
      if (!String(dailyTime || "").trim()) {
        throw new Error("Schedule time is required");
      }
      const days = dailyDay === "everyday" ? null : [Number(dailyDay)];
      return pbxApi.createReportSchedule({
        type: "domain_export",
        domain: dailyDomain,
        times: [dailyTime],
        days,
        recipients: recipientsForApi(dailyRecipients),
        options: { report_type: selectedReportType },
        enabled: true,
      });
    },
    onSuccess: () => {
      toast.success("Daily Domain Export schedule saved");
      setDailyRecipients(emptyRecipients());
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "domain_export"],
      });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save schedule");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pbxApi.deleteReportSchedule(id),
    onSuccess: () => {
      toast.success("Schedule removed");
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "domain_export"],
      });
    },
    onError: (err) => toast.error(err?.message || "Delete failed"),
  });

  if (permsLoading) return <PbxLoading />;

  const selectedLabel =
    reportTypeRows.find((r) => r.value === selectedReportType)?.label ||
    selectedReportType;

  return (
    <div className="space-y-6">
      <ReportScheduleSection
        title="Immediate Domain Export"
        description="Sends the selected report type for one domain to the chosen recipients within about five minutes."
        footer={
          <PermissionGate pbxAction="manageReports" fallback={null}>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                disabled={
                  immediateMutation.isPending ||
                  !immediateDomain ||
                  !selectedReportType
                }
                onClick={() => immediateMutation.mutate()}
              >
                {immediateMutation.isPending
                  ? "Queuing…"
                  : "Send Domain Export"}
              </Button>
              {selectedReportType ? (
                <span className="text-xs text-slate-500">
                  Selected report:{" "}
                  <span className="font-medium text-slate-800">
                    {selectedLabel}
                  </span>
                </span>
              ) : (
                <span className="text-xs text-amber-700">
                  Select a report from the list below first.
                </span>
              )}
            </div>
          </PermissionGate>
        }
      >
        <ReportField label="Domains" htmlFor="domain-export-immediate-domain">
          {domainsQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading domains…</p>
          ) : domainsQuery.error ? (
            <PbxError error={domainsQuery.error} />
          ) : (
            <DomainSearchSelect
              id="domain-export-immediate-domain"
              domains={domains}
              value={immediateDomain}
              disabled={!canManage}
              onChange={setImmediateDomain}
            />
          )}
        </ReportField>

        {!immediateDomain ? (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Please select a domain first.
          </p>
        ) : null}

        <ReportScheduleRecipients
          idPrefix="domain-export-immediate"
          value={immediateRecipients}
          disabled={!canManage}
          onChange={setImmediateRecipients}
        />
      </ReportScheduleSection>

      <ReportScheduleSection
        title="Daily Domain Export"
        description="Send the selected report type for a domain at the chosen day and time."
        footer={
          <PermissionGate pbxAction="manageReports" fallback={null}>
            <Button
              type="button"
              disabled={
                saveDailyMutation.isPending ||
                !dailyDomain ||
                !selectedReportType
              }
              onClick={() => saveDailyMutation.mutate()}
            >
              {saveDailyMutation.isPending
                ? "Saving…"
                : "Add Domain Export schedule"}
            </Button>
          </PermissionGate>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <ReportField label="Domains" htmlFor="domain-export-daily-domain">
            <DomainSearchSelect
              id="domain-export-daily-domain"
              domains={domains}
              value={dailyDomain}
              disabled={!canManage}
              onChange={setDailyDomain}
            />
          </ReportField>
          <ReportField label="Date schedule">
            <Select
              value={dailyDay}
              disabled={!canManage}
              onValueChange={setDailyDay}
            >
              <SelectTrigger className="bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WEEKDAYS.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </ReportField>
          <ReportField label="Time schedule" htmlFor="domain-export-daily-time">
            <Input
              id="domain-export-daily-time"
              type="time"
              value={dailyTime}
              disabled={!canManage}
              onChange={(e) => setDailyTime(e.target.value)}
              className="bg-white"
            />
          </ReportField>
        </div>

        {!dailyDomain ? (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Please select a domain first.
          </p>
        ) : null}

        <ReportScheduleRecipients
          idPrefix="domain-export-daily"
          value={dailyRecipients}
          disabled={!canManage}
          onChange={setDailyRecipients}
        />
      </ReportScheduleSection>

      <ReportScheduleSection
        title="Existing Domain Export schedules"
        description="List of domains that have an existing Domain Export report schedule."
      >
        {schedulesQuery.isLoading ? (
          <PbxLoading />
        ) : schedulesQuery.error ? (
          <PbxError error={schedulesQuery.error} />
        ) : (
          <PbxDataTable
            columns={[
              { key: "domain", label: "Domain" },
              {
                key: "report_type",
                label: "Report",
                render: (row) =>
                  row.options?.report_type ||
                  row.options?.reportType ||
                  "—",
              },
              {
                key: "recipient_emails",
                label: "Email report recipient",
                render: (row) => {
                  const emails = row.recipient_emails || [];
                  if (emails.length) return emails.join(", ");
                  return "—";
                },
              },
              {
                key: "days",
                label: "Date schedule",
                render: (row) => formatScheduleDay(row.days),
              },
              {
                key: "times",
                label: "Time schedule",
                render: (row) => formatScheduleTime(row.times),
              },
              {
                key: "created_date",
                label: "Date created",
                render: (row) => formatDateOnly(row.created_date),
              },
              {
                key: "created_by_name",
                label: "Created by",
                render: (row) =>
                  row.created_by_name || row.created_by_email || "—",
              },
              {
                key: "actions",
                label: "",
                render: (row) => (
                  <PermissionGate pbxAction="manageReports" fallback="—">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={deleteMutation.isPending}
                      onClick={() => deleteMutation.mutate(row.id)}
                    >
                      Remove
                    </Button>
                  </PermissionGate>
                ),
              },
            ]}
            rows={schedules}
            emptyMessage="No existing Domain Export report schedule."
          />
        )}
      </ReportScheduleSection>

      <ReportScheduleSection
        title="Select which report"
        description="Choose the SkySwitch report type used for Immediate and Daily Domain Export above."
      >
        {reportTypesQuery.isLoading ? (
          <PbxLoading />
        ) : reportTypesQuery.error ? (
          <PbxError error={reportTypesQuery.error} />
        ) : (
          <PbxDataTable
            columns={[
              { key: "category", label: "Category" },
              { key: "label", label: "Report" },
              { key: "value", label: "Type key" },
              { key: "parameters", label: "Parameters" },
              {
                key: "actions",
                label: "",
                render: (row) => {
                  const selected = row.value === selectedReportType;
                  return (
                    <Button
                      type="button"
                      size="sm"
                      variant={selected ? "default" : "outline"}
                      disabled={!canManage}
                      className={cn(selected && "bg-blue-600")}
                      onClick={() => setSelectedReportType(row.value)}
                    >
                      {selected ? "Selected" : "Select"}
                    </Button>
                  );
                },
              },
            ]}
            rows={reportTypeRows}
            emptyMessage="No report types returned for this account."
          />
        )}
      </ReportScheduleSection>

      <ReportResultPanel title="Report result">
        <p>
          When a Domain Export finishes, recipients get an Insight email with
          the domain name, generation time, and a download link for the
          SkySwitch export file. Open Completed exports below to re-download.
        </p>
        {schedules[0]?.last_run_status ? (
          <p className="text-xs text-slate-500">
            Last schedule run: {schedules[0].last_run_status}
            {schedules[0].last_sent_at
              ? ` · ${formatWhen(schedules[0].last_sent_at)}`
              : ""}
          </p>
        ) : null}
      </ReportResultPanel>

      <PbxCompletedExports title="Completed exports" />
    </div>
  );
}
