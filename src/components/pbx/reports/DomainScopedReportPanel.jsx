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
import { usePermissions } from "@/hooks/usePermissions";

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
  return times.join(", ");
}

/**
 * Reusable Insight schedule UI for per-domain (or optional-domain) email reports.
 * Prefills Domains from the page domain / top domain bar when present.
 */
export default function DomainScopedReportPanel({
  scheduleType,
  title,
  /** Immediate section header; defaults to `Immediate ${title}`. */
  immediateTitle,
  /** Send button label; defaults to `Send ${title}`. */
  sendButtonLabel,
  description,
  resultNote,
  requireDomain = true,
  allowAllDomainsImmediate = false,
  immediateApi,
  queryKeySuffix,
  /** Domain from the hosting page (PbxShell / Reports tab). Falls back to top bar. */
  domain: domainProp,
}) {
  const queryClient = useQueryClient();
  const { domain: contextDomain } = usePbxDomain();
  const barDomain = domainProp || contextDomain || "";
  const { canPbxAction, isAdmin, isLoading: permsLoading } = usePermissions();
  const canManage = isAdmin || canPbxAction("manageReports");

  const [immediateDomain, setImmediateDomain] = useState(barDomain);
  const [immediateRecipients, setImmediateRecipients] = useState(
    emptyRecipients(),
  );
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

  const schedulesQuery = useQuery({
    queryKey: ["pbx-report-schedules", scheduleType, queryKeySuffix || ""],
    queryFn: () => pbxApi.listReportSchedules({ type: scheduleType }),
  });

  const domains = useMemo(() => {
    const list = domainsQuery.data || [];
    return list
      .map((row) => (typeof row === "string" ? row : row?.domain))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
  }, [domainsQuery.data]);

  const schedules = useMemo(() => {
    const list = schedulesQuery.data?.schedules || [];
    // When domain is required, only show per-domain rows (keeps all-domains
    // Offline schedule separate). When optional, show every schedule of this type.
    if (requireDomain) return list.filter((row) => Boolean(row.domain));
    return list;
  }, [schedulesQuery.data, requireDomain]);

  const immediateMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(immediateRecipients);
      if (recipientError) throw new Error(recipientError);
      if (requireDomain && !immediateDomain && !allowAllDomainsImmediate) {
        throw new Error("Please select a domain first");
      }
      return immediateApi({
        domain: immediateDomain || null,
        recipients: recipientsForApi(immediateRecipients),
      });
    },
    onSuccess: (result) => {
      toast.success(result?.message || "Report sent");
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", scheduleType],
      });
    },
    onError: (err) => toast.error(err?.message || "Send failed"),
  });

  const saveDailyMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(dailyRecipients);
      if (recipientError) throw new Error(recipientError);
      if (requireDomain && !dailyDomain) {
        throw new Error("Please select a domain first");
      }
      if (!String(dailyTime || "").trim()) {
        throw new Error("Schedule time is required");
      }
      const days = dailyDay === "everyday" ? null : [Number(dailyDay)];
      return pbxApi.createReportSchedule({
        type: scheduleType,
        domain: dailyDomain || null,
        times: [dailyTime],
        days,
        recipients: recipientsForApi(dailyRecipients),
        options: {},
        enabled: true,
      });
    },
    onSuccess: () => {
      toast.success("Schedule saved");
      setDailyRecipients(emptyRecipients());
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", scheduleType],
      });
    },
    onError: (err) => toast.error(err?.message || "Failed to save schedule"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => pbxApi.deleteReportSchedule(id),
    onSuccess: () => {
      toast.success("Schedule removed");
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", scheduleType],
      });
    },
    onError: (err) => toast.error(err?.message || "Delete failed"),
  });

  if (permsLoading) return <PbxLoading />;

  const canSendImmediate =
    !requireDomain || Boolean(immediateDomain) || allowAllDomainsImmediate;

  return (
    <div className="space-y-6">
      <ReportScheduleSection
        title={immediateTitle ?? `Immediate ${title}`}
        description={description}
        footer={
          <PermissionGate pbxAction="manageReports" fallback={null}>
            <Button
              type="button"
              disabled={immediateMutation.isPending || !canSendImmediate}
              onClick={() => immediateMutation.mutate()}
            >
              {immediateMutation.isPending
                ? "Sending…"
                : sendButtonLabel ?? `Send ${title}`}
            </Button>
          </PermissionGate>
        }
      >
        <ReportField label="Domains">
          <DomainSearchSelect
            domains={domains}
            value={immediateDomain}
            disabled={!canManage}
            onChange={setImmediateDomain}
            placeholder={
              allowAllDomainsImmediate
                ? "Search for a Domain (optional = all)"
                : "Search for a Domain"
            }
          />
        </ReportField>
        {requireDomain && !immediateDomain && !allowAllDomainsImmediate ? (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            Please select a domain first.
          </p>
        ) : null}
        <ReportScheduleRecipients
          idPrefix={`${scheduleType}-immediate`}
          value={immediateRecipients}
          disabled={!canManage}
          onChange={setImmediateRecipients}
        />
      </ReportScheduleSection>

      <ReportScheduleSection
        title={`Scheduled ${title}`}
        description="Recurring email at the chosen day and time."
        footer={
          <PermissionGate pbxAction="manageReports" fallback={null}>
            <Button
              type="button"
              disabled={
                saveDailyMutation.isPending ||
                (requireDomain && !dailyDomain)
              }
              onClick={() => saveDailyMutation.mutate()}
            >
              {saveDailyMutation.isPending ? "Saving…" : "Add schedule"}
            </Button>
          </PermissionGate>
        }
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <ReportField label="Domains">
            <DomainSearchSelect
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
          <ReportField label="Time schedule">
            <Input
              type="time"
              value={dailyTime}
              disabled={!canManage}
              onChange={(e) => setDailyTime(e.target.value)}
              className="bg-white"
            />
          </ReportField>
        </div>
        <ReportScheduleRecipients
          idPrefix={`${scheduleType}-daily`}
          value={dailyRecipients}
          disabled={!canManage}
          onChange={setDailyRecipients}
        />
      </ReportScheduleSection>

      <ReportScheduleSection title="Existing schedules">
        {schedulesQuery.isLoading ? (
          <PbxLoading />
        ) : schedulesQuery.error ? (
          <PbxError error={schedulesQuery.error} />
        ) : (
          <PbxDataTable
            columns={[
              {
                key: "domain",
                label: "Domain",
                render: (row) => row.domain || "All domains",
              },
              {
                key: "recipient_emails",
                label: "Email report recipient",
                render: (row) =>
                  (row.recipient_emails || []).join(", ") || "—",
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
            emptyMessage="No schedules yet."
          />
        )}
      </ReportScheduleSection>

      <ReportResultPanel title="Report result">
        <p>{resultNote}</p>
      </ReportResultPanel>
    </div>
  );
}
