import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pbxApi } from "@/api/pbx";
import PermissionGate from "@/components/PermissionGate";
import ReportScheduleRecipients, {
  emptyRecipients,
  recipientsForApi,
  validateRecipients,
} from "@/components/pbx/reports/ReportScheduleRecipients";
import { PbxDataTable, PbxError, PbxLoading } from "@/components/pbx/PbxShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";

function formatWhen(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

/**
 * Glance-style Domain Export: immediate queue+email, daily schedules list.
 */
export default function DomainExportPanel() {
  const queryClient = useQueryClient();
  const { canPbxAction, isAdmin, isLoading: permsLoading } = usePermissions();
  const canManage = isAdmin || canPbxAction("manageReports");

  const [immediateDomain, setImmediateDomain] = useState("");
  const [immediateRecipients, setImmediateRecipients] = useState(
    emptyRecipients(),
  );

  const [dailyDomain, setDailyDomain] = useState("");
  const [dailyTime, setDailyTime] = useState("08:00");
  const [dailyRecipients, setDailyRecipients] = useState(emptyRecipients());

  const domainsQuery = useQuery({
    queryKey: ["pbx-domains"],
    queryFn: () => pbxApi.domains(),
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

  const schedules = schedulesQuery.data?.schedules || [];

  const immediateMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(immediateRecipients);
      if (recipientError) throw new Error(recipientError);
      if (!immediateDomain) throw new Error("Select a domain");
      return pbxApi.immediateDomainExport({
        domain: immediateDomain,
        recipients: recipientsForApi(immediateRecipients),
      });
    },
    onSuccess: (result) => {
      toast.success(
        result?.message ||
          "Domain Export queued — email will arrive when the file is ready (~5 min).",
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
      if (!dailyDomain) throw new Error("Select a domain");
      if (!String(dailyTime || "").trim()) {
        throw new Error("Daily time is required");
      }
      return pbxApi.createReportSchedule({
        type: "domain_export",
        domain: dailyDomain,
        times: [dailyTime],
        days: null,
        recipients: recipientsForApi(dailyRecipients),
        options: {},
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

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Immediate Domain Export
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Queue a SkySwitch async Domain Export for one domain. When the file
            is ready (typically within ~5 minutes), recipients get an email with
            the download link.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Domain</Label>
            {domainsQuery.isLoading ? (
              <p className="text-sm text-gray-500">Loading domains…</p>
            ) : domainsQuery.error ? (
              <PbxError error={domainsQuery.error} />
            ) : (
              <Select
                value={immediateDomain}
                disabled={!canManage}
                onValueChange={setImmediateDomain}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <ReportScheduleRecipients
          idPrefix="domain-export-immediate"
          value={immediateRecipients}
          disabled={!canManage}
          onChange={setImmediateRecipients}
        />

        <PermissionGate pbxAction="manageReports" fallback={null}>
          <Button
            type="button"
            disabled={immediateMutation.isPending}
            onClick={() => immediateMutation.mutate()}
          >
            {immediateMutation.isPending
              ? "Queuing…"
              : "Send Domain Export"}
          </Button>
        </PermissionGate>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white p-4 sm:p-5 space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Daily Domain Export
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Schedule a recurring Domain Export for a domain at a daily time.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Domain</Label>
            <Select
              value={dailyDomain}
              disabled={!canManage}
              onValueChange={setDailyDomain}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select domain" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain} value={domain}>
                    {domain}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="domain-export-daily-time">Time</Label>
            <Input
              id="domain-export-daily-time"
              type="time"
              value={dailyTime}
              disabled={!canManage}
              onChange={(e) => setDailyTime(e.target.value)}
              className="bg-white"
            />
          </div>
        </div>

        <ReportScheduleRecipients
          idPrefix="domain-export-daily"
          value={dailyRecipients}
          disabled={!canManage}
          onChange={setDailyRecipients}
        />

        <PermissionGate pbxAction="manageReports" fallback={null}>
          <Button
            type="button"
            disabled={saveDailyMutation.isPending}
            onClick={() => saveDailyMutation.mutate()}
          >
            {saveDailyMutation.isPending ? "Saving…" : "Add daily schedule"}
          </Button>
        </PermissionGate>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Saved schedules ({schedules.length})
        </h2>
        {schedulesQuery.isLoading ? (
          <PbxLoading />
        ) : schedulesQuery.error ? (
          <PbxError error={schedulesQuery.error} />
        ) : (
          <PbxDataTable
            columns={[
              { key: "domain", label: "Domain" },
              {
                key: "times",
                label: "Time",
                render: (row) =>
                  Array.isArray(row.times) ? row.times.join(", ") : "—",
              },
              {
                key: "recipients",
                label: "Recipients",
                render: (row) => {
                  const r = row.recipients || {};
                  const users = (r.user_ids || []).length;
                  const extras = (r.extra_emails || []).length;
                  return `${users} user(s), ${extras} extra`;
                },
              },
              {
                key: "last_sent_at",
                label: "Last sent",
                render: (row) => formatWhen(row.last_sent_at),
              },
              {
                key: "last_run_status",
                label: "Status",
                render: (row) => row.last_run_status || "—",
              },
              {
                key: "created_date",
                label: "Created",
                render: (row) => formatWhen(row.created_date),
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
            emptyMessage="No Domain Export schedules yet."
          />
        )}
      </section>
    </div>
  );
}
