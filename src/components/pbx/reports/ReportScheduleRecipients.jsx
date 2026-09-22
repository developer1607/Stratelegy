import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ReportField } from "@/components/pbx/reports/ReportScheduleSection";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_EXTRA_EMAILS = 3;

export function emptyRecipients() {
  return { user_ids: [], extra_emails: [] };
}

export function normalizeRecipientsValue(value) {
  const src = value && typeof value === "object" ? value : {};
  const userIds = [
    ...new Set(
      (Array.isArray(src.user_ids) ? src.user_ids : src.userIds || [])
        .map((id) => String(id || "").trim())
        .filter(Boolean),
    ),
  ];
  const extras = (
    Array.isArray(src.extra_emails) ? src.extra_emails : src.extraEmails || []
  )
    .map((email) => String(email || "").trim())
    .filter(Boolean)
    .slice(0, MAX_EXTRA_EMAILS);
  return { user_ids: userIds, extra_emails: extras };
}

/** Payload shape for API create/update. */
export function recipientsForApi(value) {
  const normalized = normalizeRecipientsValue(value);
  return {
    user_ids: normalized.user_ids,
    extra_emails: normalized.extra_emails
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email && EMAIL_RE.test(email)),
  };
}

export function validateRecipients(value) {
  const api = recipientsForApi(value);
  const extras = normalizeRecipientsValue(value).extra_emails;
  for (const email of extras) {
    const trimmed = email.trim();
    if (trimmed && !EMAIL_RE.test(trimmed)) {
      return `Invalid email: ${trimmed}`;
    }
  }
  if (extras.length > MAX_EXTRA_EMAILS) {
    return `At most ${MAX_EXTRA_EMAILS} extra emails`;
  }
  if (!api.user_ids.length && !api.extra_emails.length) {
    return "Select at least one portal user or enter an email";
  }
  return null;
}

function extrasToInput(extras) {
  return (extras || []).join(", ");
}

function inputToExtras(text) {
  return String(text || "")
    .split(/[,;\s]+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, MAX_EXTRA_EMAILS);
}

/**
 * Shared recipient picker for scheduled PBX reports.
 * Doc fields: portal user checkboxes + max 3 extra emails (comma-separated).
 */
export default function ReportScheduleRecipients({
  value,
  onChange,
  disabled = false,
  idPrefix = "report-recipients",
}) {
  const recipients = useMemo(
    () => normalizeRecipientsValue(value),
    [value],
  );

  const { data: directory = [], isLoading } = useQuery({
    queryKey: ["users", "directory"],
    queryFn: () => api.users.directory(),
    staleTime: 5 * 60_000,
  });

  const emit = (next) => {
    onChange?.(normalizeRecipientsValue(next));
  };

  const toggleUser = (userId, checked) => {
    const set = new Set(recipients.user_ids);
    if (checked) set.add(userId);
    else set.delete(userId);
    emit({ ...recipients, user_ids: [...set] });
  };

  return (
    <div className="space-y-4">
      <ReportField
        label="Select recipients"
        hint="Selected portal users receive the report at their account email."
      >
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading users…</p>
        ) : directory.length === 0 ? (
          <p className="text-sm text-slate-500">No active portal users found.</p>
        ) : (
          <div className="max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-white divide-y divide-slate-100">
            {directory.map((user) => {
              const checked = recipients.user_ids.includes(user.id);
              const label = user.full_name?.trim() || user.email;
              const fieldId = `${idPrefix}-user-${user.id}`;
              return (
                <label
                  key={user.id}
                  htmlFor={fieldId}
                  className="flex items-start gap-3 px-3 py-2.5 cursor-pointer hover:bg-slate-50"
                >
                  <Checkbox
                    id={fieldId}
                    checked={checked}
                    disabled={disabled}
                    onCheckedChange={(next) =>
                      toggleUser(user.id, next === true)
                    }
                    className="mt-0.5"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm text-slate-900 truncate">
                      {label}
                    </span>
                    {user.full_name?.trim() ? (
                      <span className="block text-xs text-slate-500 truncate">
                        {user.email}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </ReportField>

      <ReportField
        label="Additional recipients"
        hint={`Maximum ${MAX_EXTRA_EMAILS} emails, separated by commas`}
        htmlFor={`${idPrefix}-extras`}
      >
        <Input
          id={`${idPrefix}-extras`}
          type="text"
          value={extrasToInput(recipients.extra_emails)}
          disabled={disabled}
          placeholder="name@example.com, other@example.com"
          onChange={(e) =>
            emit({
              ...recipients,
              extra_emails: inputToExtras(e.target.value),
            })
          }
          className="bg-white"
        />
      </ReportField>
    </div>
  );
}
