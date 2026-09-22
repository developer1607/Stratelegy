import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { pbxApi } from "@/api/pbx";
import PermissionGate from "@/components/PermissionGate";
import ReportScheduleRecipients, {
  emptyRecipients,
  normalizeRecipientsValue,
  recipientsForApi,
  validateRecipients,
} from "@/components/pbx/reports/ReportScheduleRecipients";
import {
  ReportField,
  ReportResultPanel,
  ReportScheduleSection,
} from "@/components/pbx/reports/ReportScheduleSection";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermissions } from "@/hooks/usePermissions";

const MIN_DOWNTIME_OPTIONS = [
  { value: "any", label: "No filter" },
  { value: "15m", label: "15 minutes or more" },
  { value: "1h", label: "1 hour or more" },
  { value: "4h", label: "4 hours or more" },
  { value: "1d", label: "1 day or more" },
  { value: "7d", label: "1 week or more" },
];

function blankForm() {
  return {
    time1: "08:00",
    time2: "",
    min_downtime: "any",
    send_if_empty: false,
    recipients: emptyRecipients(),
  };
}

function scheduleToForm(schedule) {
  if (!schedule) return blankForm();
  const times = Array.isArray(schedule.times) ? schedule.times : [];
  const options = schedule.options || {};
  return {
    time1: times[0] || "08:00",
    time2: times[1] || "",
    min_downtime: options.min_downtime || "any",
    send_if_empty: Boolean(options.send_if_empty),
    recipients: normalizeRecipientsValue(schedule.recipients),
  };
}

function formToPayload(form) {
  const times = [form.time1, form.time2]
    .map((t) => String(t || "").trim())
    .filter(Boolean);
  return {
    type: "offline_endpoint",
    domain: null,
    times,
    days: null,
    recipients: recipientsForApi(form.recipients),
    options: {
      min_downtime: form.min_downtime || "any",
      send_if_empty: Boolean(form.send_if_empty),
    },
    enabled: true,
  };
}

function formatWhen(iso) {
  if (!iso) return "Never";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

/**
 * Offline Endpoint daily schedule — doc fields, Insight layout.
 */
export default function OfflineEndpointSchedulePanel() {
  const queryClient = useQueryClient();
  const { canPbxAction, isAdmin, isLoading: permsLoading } = usePermissions();
  const canManage = isAdmin || canPbxAction("manageReports");

  const schedulesQuery = useQuery({
    queryKey: ["pbx-report-schedules", "offline_endpoint"],
    queryFn: () => pbxApi.listReportSchedules({ type: "offline_endpoint" }),
  });

  const schedule = useMemo(() => {
    const list = schedulesQuery.data?.schedules || [];
    // Never bind a per-domain Offline schedule into the all-reseller panel.
    return list.find((row) => !row.domain) || null;
  }, [schedulesQuery.data]);

  const [form, setForm] = useState(blankForm);
  const [baseline, setBaseline] = useState(blankForm);

  useEffect(() => {
    const next = scheduleToForm(schedule);
    setForm(next);
    setBaseline(next);
  }, [schedule]);

  const dirty = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(baseline),
    [form, baseline],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const recipientError = validateRecipients(form.recipients);
      if (recipientError) throw new Error(recipientError);
      if (!String(form.time1 || "").trim()) {
        throw new Error("1st schedule time is required");
      }
      const payload = formToPayload(form);
      if (schedule?.id) {
        return pbxApi.updateReportSchedule(schedule.id, payload);
      }
      return pbxApi.createReportSchedule(payload);
    },
    onSuccess: () => {
      toast.success("Offline Endpoint schedule saved");
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "offline_endpoint"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "offline_endpoint", "per-domain"],
      });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to save schedule");
    },
  });

  const runMutation = useMutation({
    mutationFn: async () => {
      if (!schedule?.id) throw new Error("Save the schedule before running");
      return pbxApi.runReportSchedule(schedule.id);
    },
    onSuccess: (result) => {
      toast.success(result?.message || `Run status: ${result?.status}`);
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "offline_endpoint"],
      });
      queryClient.invalidateQueries({
        queryKey: ["pbx-report-schedules", "offline_endpoint", "per-domain"],
      });
    },
    onError: (err) => {
      toast.error(err?.message || "Failed to run schedule");
    },
  });

  const revert = () => setForm(baseline);

  if (permsLoading || schedulesQuery.isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Loading schedule…
      </div>
    );
  }

  if (schedulesQuery.error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        {schedulesQuery.error.message || "Could not load schedule settings."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReportScheduleSection
        title="Daily Offline Endpoint report"
        description="Email offline extensions across all reseller domains at the times below."
        meta={
          <>
            <div>
              Last run:{" "}
              <span className="text-slate-800">
                {formatWhen(schedule?.last_sent_at)}
              </span>
            </div>
            <div>
              Status:{" "}
              <span className="text-slate-800">
                {schedule?.last_run_status || "—"}
              </span>
            </div>
          </>
        }
        footer={
          <PermissionGate pbxAction="manageReports" fallback={null}>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={!dirty || saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? "Saving…" : "Set schedule"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={!dirty || saveMutation.isPending}
                onClick={revert}
              >
                Revert
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={!schedule?.id || runMutation.isPending}
                onClick={() => runMutation.mutate()}
              >
                {runMutation.isPending ? "Running…" : "Run now"}
              </Button>
            </div>
          </PermissionGate>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <ReportField label="1st schedule" htmlFor="offline-sched-time1">
            <Input
              id="offline-sched-time1"
              type="time"
              value={form.time1}
              disabled={!canManage}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, time1: e.target.value }))
              }
              className="bg-white"
            />
          </ReportField>
          <ReportField label="2nd schedule" htmlFor="offline-sched-time2">
            <Input
              id="offline-sched-time2"
              type="time"
              value={form.time2}
              disabled={!canManage}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, time2: e.target.value }))
              }
              className="bg-white"
            />
          </ReportField>
        </div>

        <ReportScheduleRecipients
          value={form.recipients}
          disabled={!canManage}
          onChange={(recipients) =>
            setForm((prev) => ({ ...prev, recipients }))
          }
        />

        <ReportField
          label="Downtime duration filter"
          hint="Hides offline endpoints from the emailed report based on how long they have been offline."
        >
          <Select
            value={form.min_downtime}
            disabled={!canManage}
            onValueChange={(value) =>
              setForm((prev) => ({ ...prev, min_downtime: value }))
            }
          >
            <SelectTrigger className="bg-white max-w-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MIN_DOWNTIME_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </ReportField>

        <label className="flex items-start gap-3 cursor-pointer max-w-xl">
          <Checkbox
            checked={form.send_if_empty}
            disabled={!canManage}
            onCheckedChange={(checked) =>
              setForm((prev) => ({
                ...prev,
                send_if_empty: checked === true,
              }))
            }
            className="mt-0.5"
          />
          <span className="text-sm text-slate-700">
            Send daily report even if there are no offline endpoints
          </span>
        </label>

        {!canManage ? (
          <p className="text-xs text-slate-500">
            Viewing only — manage PBX reports permission is required to change
            this schedule.
          </p>
        ) : null}
      </ReportScheduleSection>

      <ReportResultPanel title="Report result">
        <p>
          Recipients receive an Insight email with a summary (domains scanned,
          matching offline count) and a table of offline extensions. Empty scans
          are suppressed unless the checkbox above is enabled.
        </p>
      </ReportResultPanel>
    </div>
  );
}
