import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const MAX_EXTRA_EMAILS = 3;

export function emptyRecipients() {
  return { user_ids: [], extra_emails: ["", "", ""] };
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
    .slice(0, MAX_EXTRA_EMAILS);
  while (extras.length < MAX_EXTRA_EMAILS) extras.push("");
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
  if (!api.user_ids.length && !api.extra_emails.length) {
    return "Select at least one portal user or enter an email";
  }
  return null;
}

/**
 * Shared recipient picker for scheduled PBX reports:
 * portal users (checkboxes) + up to 3 extra emails.
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

  const setExtraEmail = (index, email) => {
    const extras = [...recipients.extra_emails];
    extras[index] = email;
    emit({ ...recipients, extra_emails: extras });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium text-gray-900">
          Portal users
        </Label>
        <p className="text-xs text-gray-500 mt-0.5 mb-2">
          Selected users receive the report at their account email.
        </p>
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading users…</p>
        ) : directory.length === 0 ? (
          <p className="text-sm text-gray-500">No active portal users found.</p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-md border border-gray-200 bg-white divide-y divide-gray-100">
            {directory.map((user) => {
              const checked = recipients.user_ids.includes(user.id);
              const label = user.full_name?.trim() || user.email;
              const fieldId = `${idPrefix}-user-${user.id}`;
              return (
                <label
                  key={user.id}
                  htmlFor={fieldId}
                  className="flex items-start gap-3 px-3 py-2 cursor-pointer hover:bg-gray-50"
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
                  <span className="min-w-0">
                    <span className="block text-sm text-gray-900 truncate">
                      {label}
                    </span>
                    {user.full_name?.trim() ? (
                      <span className="block text-xs text-gray-500 truncate">
                        {user.email}
                      </span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Label className="text-sm font-medium text-gray-900">
          Extra emails (max {MAX_EXTRA_EMAILS})
        </Label>
        <p className="text-xs text-gray-500 mt-0.5 mb-2">
          Optional addresses outside the portal user list.
        </p>
        <div className="space-y-2">
          {recipients.extra_emails.map((email, index) => (
            <Input
              key={`${idPrefix}-extra-${index}`}
              id={`${idPrefix}-extra-${index}`}
              type="email"
              value={email}
              disabled={disabled}
              placeholder={`email${index + 1}@example.com`}
              onChange={(e) => setExtraEmail(index, e.target.value)}
              className="bg-white"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
