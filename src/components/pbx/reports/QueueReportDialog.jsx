import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PbxFormField from "@/components/pbx/shared/PbxFormField";
import {
  buildReportPayload,
  initialReportParams,
  parseFieldRule,
} from "@/lib/reportTypes";
import { toast } from "sonner";

function ReportParamField({ name, rule, value, onChange, domains }) {
  const { required, type, enumValues } = parseFieldRule(rule);
  const label = `${name}${required ? " *" : ""}`;

  if (enumValues) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder={`Select ${name}`} />
          </SelectTrigger>
          <SelectContent>
            {enumValues.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (name === "domain" && domains?.length) {
    return (
      <div className="space-y-1.5">
        <Label>{label}</Label>
        <Select value={value || ""} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select domain" />
          </SelectTrigger>
          <SelectContent>
            {domains.map((d) => {
              const domain = typeof d === "string" ? d : d?.domain;
              if (!domain) return null;
              return (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <PbxFormField
      label={label}
      type={type === "date" ? "date" : type === "integer" ? "number" : "text"}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={type === "date" ? "YYYY-MM-DD" : name}
    />
  );
}

export default function QueueReportDialog({
  open,
  onOpenChange,
  reportType,
  defaultParams = {},
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const [params, setParams] = useState({});
  const [notes, setNotes] = useState("");

  const fieldEntries = useMemo(
    () => Object.entries(reportType?.fields || {}),
    [reportType?.fields],
  );
  const needsDomains = fieldEntries.some(([name]) => name === "domain");

  const domainsQuery = useQuery({
    queryKey: ["pbx-domains"],
    queryFn: () => pbxApi.domains(),
    enabled: open && needsDomains,
  });

  useEffect(() => {
    if (!open || !reportType) return;
    setParams({ ...initialReportParams(reportType.fields), ...defaultParams });
    setNotes("");
  }, [open, reportType, defaultParams]);

  const queueMutation = useMutation({
    mutationFn: async () => {
      const parameters = buildReportPayload(reportType.fields, params);
      return pbxApi.createReport({
        report_type: reportType.value,
        parameters,
        notes: notes.trim() || undefined,
      });
    },
    onSuccess: () => {
      toast.success(`Report queued: ${reportType.label}`);
      queryClient.invalidateQueries({ queryKey: ["pbx-generated-reports"] });
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || "Failed to queue report"),
  });

  if (!reportType) return null;

  const domains = domainsQuery.data || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Queue report</DialogTitle>
          <DialogDescription>
            {reportType.label}{" "}
            <span className="text-gray-500">({reportType.value})</span>
            {reportType.category ? (
              <span className="block text-xs mt-1">
                Category: {reportType.category}
              </span>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {fieldEntries.length === 0 ? (
            <p className="text-sm text-gray-600">
              This report runs with no parameters.
            </p>
          ) : (
            fieldEntries.map(([name, rule]) => (
              <ReportParamField
                key={name}
                name={name}
                rule={rule}
                value={params[name] ?? ""}
                onChange={(val) =>
                  setParams((prev) => ({ ...prev, [name]: val }))
                }
                domains={domains}
              />
            ))
          )}

          <div className="space-y-1.5">
            <Label htmlFor="report-notes">Notes (optional)</Label>
            <Textarea
              id="report-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Internal note for this export"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => queueMutation.mutate()}
            disabled={queueMutation.isPending}
          >
            {queueMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Queueing…
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-1.5" />
                Queue report
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
