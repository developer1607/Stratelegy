import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/api/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Mail,
  AlertCircle,
  CheckCircle2,
  Shield,
  RefreshCw,
} from "lucide-react";
import { showError, showSuccess } from "@/lib/toast";
import EmailTemplateEditor from "./EmailTemplateEditor";

export default function EmailTemplatesPanel() {
  const [selectedId, setSelectedId] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["emailTemplates"],
    queryFn: () => api.email.listTemplates(),
  });

  const verifyMutation = useMutation({
    mutationFn: () => api.email.verifyConnection(),
    onSuccess: (result) => {
      queryClient.setQueryData(["emailTemplates"], (prev) =>
        prev ? { ...prev, status: result } : prev,
      );
      if (result.mail_enabled) {
        showSuccess("SMTP connection verified.");
      } else {
        showError(null, result.connection_error || "SMTP connection failed.");
      }
    },
    onError: (err) => showError(err, "SMTP connection test failed"),
  });

  const { data: defaultSettings } = useQuery({
    queryKey: ["defaultSettings"],
    queryFn: async () => {
      const settings = await api.entities.DefaultSettings.list();
      return settings[0] || null;
    },
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (patch) => {
      if (defaultSettings?.id) {
        return api.entities.DefaultSettings.update(defaultSettings.id, patch);
      }
      return api.entities.DefaultSettings.create(patch);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["defaultSettings"] });
      showSuccess("MFA defaults updated");
    },
    onError: (err) => showError(err, "Failed to update MFA defaults"),
  });

  const templates = data?.templates || [];
  const status = data?.status;
  const mailEnabled = Boolean(status?.mail_enabled);
  const mailStatus = status?.status || (mailEnabled ? "ready" : "disabled");

  const activeId = selectedId || templates[0]?.id || "";
  const selectedMeta = templates.find((t) => t.id === activeId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-red-600">
          Failed to load email templates.
        </CardContent>
      </Card>
    );
  }

  const defaultMfaEnabled = Boolean(defaultSettings?.default_mfa_email_enabled);
  const defaultMfaForced = Boolean(defaultSettings?.default_mfa_email_forced);

  const updateMfaDefault = (field, value) => {
    updateSettingsMutation.mutate({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Outbound email
          </CardTitle>
          <CardDescription>
            Customize template content below. SMTP credentials stay in server
            environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {mailStatus === "ready" ? (
              <Badge className="bg-green-100 text-green-800 border-green-200 gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Mail configured
              </Badge>
            ) : mailStatus === "failed" ? (
              <Badge
                variant="outline"
                className="border-red-300 text-red-800 gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                SMTP connection failed
              </Badge>
            ) : mailStatus === "incomplete" ? (
              <Badge
                variant="outline"
                className="border-amber-300 text-amber-800 gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Mail not configured
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="border-amber-300 text-amber-800 gap-1"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Mail disabled
              </Badge>
            )}
            {status?.from_address && (
              <span className="text-sm text-gray-600">
                From: {status.from_address}
              </span>
            )}
            {status?.smtp_host && (
              <span className="text-sm text-gray-600">
                SMTP: {status.smtp_host}
              </span>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={verifyMutation.isPending || isFetching}
              onClick={() => verifyMutation.mutate()}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${verifyMutation.isPending ? "animate-spin" : ""}`}
              />
              {verifyMutation.isPending ? "Testing…" : "Test connection"}
            </Button>
          </div>
          {mailStatus === "failed" && status?.connection_error && (
            <p className="text-sm text-red-800 bg-red-50 border border-red-200 rounded-md p-3">
              {status.connection_error}
              {status.env_configured && (
                <>
                  {" "}
                  SMTP variables are set on the server, but authentication or
                  connectivity failed. Update{" "}
                  <code className="text-xs">SMTP_USER</code> and{" "}
                  <code className="text-xs">SMTP_PASS</code> in the server
                  environment, then test again.
                </>
              )}
            </p>
          )}
          {mailStatus === "incomplete" && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
              Set <code className="text-xs">MAIL_ENABLED=true</code> and all
              SMTP variables on the server
              {status?.missing?.length ? (
                <> — missing: {status.missing.join(", ")}</>
              ) : null}
              . Invites, ticket notifications, and email MFA require working
              outbound mail.
            </p>
          )}
          {mailStatus === "disabled" && (
            <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-3">
              Set <code className="text-xs">MAIL_ENABLED=true</code> and SMTP
              variables on the server. Invites, ticket notifications, and email
              MFA require outbound mail. Email MFA is off for all users until
              mail is configured.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            New user email MFA
          </CardTitle>
          <CardDescription>
            Applies when an admin creates a user or when someone completes an
            invite registration. Existing users are not changed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">Enable email MFA by default</Label>
              <p className="text-xs text-gray-500 mt-1">
                New accounts must verify a sign-in code sent to their email.
              </p>
            </div>
            <Switch
              checked={defaultMfaEnabled}
              disabled={!mailEnabled || updateSettingsMutation.isPending}
              onCheckedChange={(checked) => {
                const patch = { default_mfa_email_enabled: checked };
                if (!checked) patch.default_mfa_email_forced = false;
                updateSettingsMutation.mutate(patch);
              }}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="text-sm">
                Require MFA (users cannot disable)
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Lock email MFA on for new users — same as the admin
                &quot;Required&quot; toggle in User Management.
              </p>
            </div>
            <Switch
              checked={defaultMfaForced}
              disabled={
                !mailEnabled ||
                !defaultMfaEnabled ||
                updateSettingsMutation.isPending
              }
              onCheckedChange={(forced) =>
                updateMfaDefault("default_mfa_email_forced", forced)
              }
            />
          </div>
          {!mailEnabled && (
            <p className="text-xs text-gray-500">
              Configure SMTP above before turning on default email MFA.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates ({templates.length})</CardTitle>
          <CardDescription>
            Select a template to edit with visual, HTML, or plain-text modes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {templates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => setSelectedId(template.id)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  activeId === template.id
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900">{template.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {template.id}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="secondary">{template.category}</Badge>
                    {template.is_customized && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px]">
                        Custom
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {activeId && (
        <EmailTemplateEditor
          templateId={activeId}
          templateMeta={selectedMeta}
          mailEnabled={mailEnabled}
          onSaved={() =>
            queryClient.invalidateQueries({ queryKey: ["emailTemplates"] })
          }
        />
      )}
    </div>
  );
}
