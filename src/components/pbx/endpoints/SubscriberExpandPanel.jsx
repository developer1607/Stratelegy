import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  HeartPulse,
  Loader2,
  Lock,
  MessageSquare,
  RefreshCw,
  Users,
  Voicemail,
  XCircle,
} from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import PermissionGate from "@/components/PermissionGate";
import ResyncPhoneAction from "@/components/pbx/endpoints/ResyncPhoneAction";
import DeleteSubscriberAction from "@/components/pbx/endpoints/DeleteSubscriberAction";
import DeletePhoneAction from "@/components/pbx/endpoints/DeletePhoneAction";
import DeleteDeviceAction from "@/components/pbx/endpoints/DeleteDeviceAction";
import AddPhoneAction from "@/components/pbx/endpoints/AddPhoneAction";
import { usePermissions } from "@/hooks/usePermissions";
import { canPbxAction } from "@/lib/permissions";
import { toast } from "sonner";

function UnderlineField({
  label,
  value,
  onChange,
  type = "text",
  readOnly = true,
  className = "",
}) {
  return (
    <div className={`space-y-0.5 ${className}`}>
      <label className="text-[11px] text-gray-500">{label}</label>
      <Input
        type={type}
        value={value ?? ""}
        readOnly={readOnly}
        onChange={readOnly ? undefined : onChange}
        className="h-8 border-0 border-b border-gray-300 rounded-none px-0 shadow-none focus-visible:ring-0 bg-transparent read-only:cursor-default"
      />
    </div>
  );
}

function UnderlineSelect({ label, value }) {
  return (
    <div className="space-y-0.5">
      <label className="text-[11px] text-gray-500">{label}</label>
      <div className="h-8 border-b border-gray-300 flex items-center text-sm text-gray-900">
        {value || "—"}
      </div>
    </div>
  );
}

function ActionLink({ icon: Icon, children, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline disabled:text-gray-400 disabled:no-underline"
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </button>
  );
}

function formatDid(value) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return value || "—";
}

function DeviceLinesTable({ lines, selectedId, onSelect }) {
  if (!lines?.length) return null;

  return (
    <div className="border-b border-gray-200 bg-[#f8fafc] px-4 py-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
        Device lines
      </div>
      <div className="app-scrollbar overflow-x-scroll rounded-md border border-gray-200 bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Line</th>
              <th className="px-3 py-2 text-left font-semibold">Status</th>
              <th className="px-3 py-2 text-left font-semibold">Device</th>
              <th className="px-3 py-2 text-left font-semibold">WAN / registration</th>
              <th className="px-3 py-2 text-left font-semibold">MAC</th>
              <th className="px-3 py-2 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => {
              const online = line.online_status === "online";
              return (
                <tr
                  key={line.id || line.line}
                  className={`border-t border-gray-100 ${
                    selectedId === line.id ? "bg-blue-50" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-cyan-700">
                    <button
                      type="button"
                      className="hover:underline"
                      onClick={() => onSelect(line)}
                    >
                      {line.line || "—"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`inline-flex items-center gap-1.5 ${
                        online ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {online ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {online ? "Online" : "Offline"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-gray-700">
                    {line.model || line.user_agent || "—"}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {line.wan_ip || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {line.mac_address || "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant={selectedId === line.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => onSelect(line)}
                    >
                      {selectedId === line.id ? "Selected" : "Manage"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function SubscriberExpandPanel({
  domain,
  subscriber,
  onUpdated,
}) {
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const canManage = canPbxAction(permissions, "manageEndpoints");
  const [showPin, setShowPin] = useState(false);
  const [form, setForm] = useState({
    email: "",
    department: "",
    notes: "",
    site: "",
    vm_pin: "",
  });
  const [overrides, setOverrides] = useState("");
  const [monitoringOpen, setMonitoringOpen] = useState(false);
  const [voicemailOpen, setVoicemailOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [selectedDeviceLineId, setSelectedDeviceLineId] = useState(null);
  const ownerUser = subscriber?.owner_user || subscriber?.user;
  const deviceLines = subscriber?.deviceLines || [];
  const selectedDeviceLine =
    deviceLines.find((line) => line.id === selectedDeviceLineId) || null;

  const detailQ = useQuery({
    queryKey: ["pbx-endpoint-detail", domain, ownerUser],
    queryFn: () => pbxApi.endpointDetail(domain, ownerUser),
    enabled: !!domain && !!ownerUser,
    retry: false,
  });

  const sitesQ = useQuery({
    queryKey: ["pbx-endpoint-sites", domain],
    queryFn: () => pbxApi.endpointSites(domain),
    enabled: canManage && !!domain,
    retry: false,
  });

  const monitoringQ = useQuery({
    queryKey: ["pbx-endpoint-monitoring", domain, ownerUser],
    queryFn: () => pbxApi.endpointMonitoring(domain, ownerUser),
    enabled: monitoringOpen && !!domain && !!ownerUser,
    retry: false,
  });

  const voicemailQ = useQuery({
    queryKey: ["pbx-endpoint-voicemails", domain, ownerUser],
    queryFn: () => pbxApi.endpointVoicemails(domain, ownerUser),
    enabled: voicemailOpen && !!domain && !!ownerUser,
    retry: false,
  });

  const groupsQ = useQuery({
    queryKey: ["pbx-endpoint-groups", domain, ownerUser],
    queryFn: () => pbxApi.endpointGroups(domain, ownerUser),
    enabled: groupsOpen && !!domain && !!ownerUser,
    retry: false,
  });

  const detail = detailQ.data?.subscriber || subscriber;
  const phone = detailQ.data?.phone;
  const activeOverrides = selectedDeviceLine
    ? selectedDeviceLine.overrides || ""
    : detail.overrides || phone?.overrides || "";

  useEffect(() => {
    setForm({
      email: detail.email_address || "",
      department: detail.department || "",
      notes: detail.notes || "",
      site: detail.site || "",
      vm_pin: detail.vm_pin || "",
    });
    setOverrides(activeOverrides);
  }, [
    detail.email_address,
    detail.department,
    detail.notes,
    detail.site,
    detail.vm_pin,
    activeOverrides,
  ]);

  useEffect(() => {
    setSelectedDeviceLineId(null);
  }, [ownerUser]);

  const saveMutation = useMutation({
    mutationFn: () =>
      pbxApi.updateEndpointSubscriber(domain, ownerUser, {
        email: form.email,
        department: form.department,
        notes: form.notes,
        site: form.site,
        vm_pin: form.vm_pin,
      }),
    onSuccess: () => {
      toast.success("Subscriber updated");
      detailQ.refetch();
      monitoringQ.refetch();
      onUpdated?.();
    },
    onError: (err) => toast.error(err.message || "Failed to update subscriber"),
  });

  const overridesMutation = useMutation({
    mutationFn: () => {
      if (!mac) throw new Error("No MAC address for this endpoint");
      return pbxApi.updatePhoneOverrides(mac, domain, overrides);
    },
    onSuccess: () => {
      toast.success("Phone overrides updated");
      detailQ.refetch();
      onUpdated?.();
    },
    onError: (err) => toast.error(err.message || "Failed to update overrides"),
  });

  const monitoringMutation = useMutation({
    mutationFn: (enabled) =>
      pbxApi.updateEndpointMonitoring(domain, ownerUser, enabled),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["pbx-endpoint-monitoring", domain, ownerUser],
        data,
      );
      toast.success(
        data?.enabled ? "Call recording enabled" : "Call recording disabled",
      );
    },
    onError: (err) =>
      toast.error(err.message || "Failed to update call recording"),
  });

  const deviceResyncMutation = useMutation({
    mutationFn: () =>
      pbxApi.resyncEndpointDevice(domain, selectedDeviceLine?.aor),
    onSuccess: () => {
      toast.success("Device resync requested");
      onUpdated?.();
    },
    onError: (err) =>
      toast.error(err.message || "Failed to resync device line"),
  });

  const vmPin = detail.vm_pin ? (showPin ? detail.vm_pin : "****") : "—";
  const wanLan = selectedDeviceLine
    ? selectedDeviceLine.wan_ip || "—"
    : detail.wan_lan || detail.wan_ip || "—";
  const model = selectedDeviceLine
    ? selectedDeviceLine.model || selectedDeviceLine.user_agent || "—"
    : detail.model || phone?.user_agent || "—";
  const mac = selectedDeviceLine
    ? selectedDeviceLine.mac_address || null
    : detail.mac_address || phone?.mac || null;
  const primaryDevice = selectedDeviceLine
    ? selectedDeviceLine.primary_device || selectedDeviceLine.aor || null
    : phone?.primary_device || null;
  const displayedStatus = selectedDeviceLine
    ? selectedDeviceLine.registration_status || selectedDeviceLine.online_status
    : detail.registration_status || detail.online_status;
  const monitoringEnabled = monitoringQ.data?.enabled === true;
  const monitoringConfiguration = monitoringQ.data?.configuration || "no";
  const siteOptions = useMemo(() => {
    const values = new Set(
      [...(sitesQ.data || []), detail.site || form.site || ""].filter(Boolean),
    );
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [sitesQ.data, detail.site, form.site]);

  const subscriberDirty = useMemo(() => {
    return (
      form.email !== (detail.email_address || "") ||
      form.department !== (detail.department || "") ||
      form.notes !== (detail.notes || "") ||
      form.site !== (detail.site || "") ||
      form.vm_pin !== (detail.vm_pin || "")
    );
  }, [
    form,
    detail.email_address,
    detail.department,
    detail.notes,
    detail.site,
    detail.vm_pin,
  ]);

  const overridesDirty =
    overrides !== activeOverrides;

  const featureIcons = useMemo(() => {
    const icons = [];
    if (
      detail.vmail_enabled ||
      (detail.features || []).some((f) => /vm/i.test(f))
    ) {
      icons.push({ key: "vm", Icon: Voicemail, label: "Voicemail" });
    }
    if (
      detail.presence ||
      detail.vmail_notify ||
      (detail.features || []).some((f) => /tr|msg|mc/i.test(f))
    ) {
      icons.push({ key: "msg", Icon: MessageSquare, label: "Messaging" });
    }
    return icons;
  }, [detail]);

  const setField = (key) => (event) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  return (
    <div className="border-t border-blue-900/20 bg-[#eef2f7]">
      <div className="px-4 py-3 border-b border-gray-200 bg-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-semibold text-cyan-700">
              {detail.name || detail.user}
              {selectedDeviceLine ? ` — ${selectedDeviceLine.line}` : ""}
            </h3>
            {selectedDeviceLine ? (
              <p className="text-xs text-gray-500">
                Subscriber settings update {ownerUser}; device actions apply to{" "}
                {selectedDeviceLine.line}.
              </p>
            ) : null}
          </div>
          {selectedDeviceLine ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedDeviceLineId(null)}
            >
              Manage {ownerUser}
            </Button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {detailQ.isFetching ? (
            <span className="text-xs text-gray-500 inline-flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading PBX details…
            </span>
          ) : null}
          {canManage && subscriberDirty ? (
            <>
              <Button
                size="sm"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() =>
                  setForm({
                    email: detail.email_address || "",
                    department: detail.department || "",
                    notes: detail.notes || "",
                    site: detail.site || "",
                    vm_pin: detail.vm_pin || "",
                  })
                }
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? "Saving…" : "Save"}
              </Button>
            </>
          ) : null}
          {canManage && !selectedDeviceLine ? (
            <DeleteSubscriberAction
              domain={domain}
              user={ownerUser}
              name={detail.name}
              onSuccess={onUpdated}
            />
          ) : null}
        </div>
      </div>

      <DeviceLinesTable
        lines={deviceLines}
        selectedId={selectedDeviceLineId}
        onSelect={(line) => setSelectedDeviceLineId(line.id)}
      />

      <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-4 bg-white">
        <div className="space-y-3">
          <UnderlineField
            label="Status"
            value={displayedStatus}
          />
          <div className="space-y-0.5">
            <label className="text-[11px] text-gray-500">VM PIN</label>
            <div className="flex items-center gap-2 border-b border-gray-300 h-8">
              {canManage ? (
                <Input
                  type={showPin ? "text" : "password"}
                  value={form.vm_pin}
                  onChange={setField("vm_pin")}
                  className="h-8 border-0 px-0 shadow-none focus-visible:ring-0 bg-transparent"
                />
              ) : (
                <span className="text-sm flex-1">{vmPin}</span>
              )}
              {detail.vm_pin || form.vm_pin ? (
                <button
                  type="button"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPin((v) => !v)}
                  title={showPin ? "Hide PIN" : "Show PIN"}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              ) : null}
            </div>
          </div>
          {canManage && siteOptions.length ? (
            <div className="space-y-0.5">
              <label className="text-[11px] text-gray-500">Site</label>
              <Select
                value={form.site || "__empty__"}
                onValueChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    site: value === "__empty__" ? "" : value,
                  }))
                }
              >
                <SelectTrigger className="h-8 rounded-none border-0 border-b border-gray-300 px-0 shadow-none focus:ring-0">
                  <SelectValue placeholder="Select site" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__empty__">No site</SelectItem>
                  {siteOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : canManage ? (
            <UnderlineField
              label="Site"
              value={form.site}
              onChange={setField("site")}
              readOnly={false}
            />
          ) : (
            <UnderlineSelect label="Site" value={detail.site} />
          )}
        </div>

        <div className="space-y-3">
          <UnderlineField label="WAN/LAN" value={wanLan} />
          <UnderlineField
            label="Email"
            value={form.email}
            onChange={setField("email")}
            readOnly={!canManage}
          />
          <UnderlineField
            label="Department"
            value={form.department}
            onChange={setField("department")}
            readOnly={!canManage}
          />
        </div>

        <div className="space-y-3">
          <UnderlineField label="Model" value={model} />
          <UnderlineSelect label="Dial Policy" value={detail.dial_policy} />
          <UnderlineSelect label="User Scope" value={detail.scope} />
        </div>

        <div className="space-y-3">
          <div className="space-y-0.5">
            <label className="text-[11px] text-gray-500">MAC</label>
            <div className="h-8 border-b border-gray-300 flex items-center justify-between gap-2">
              {mac ? (
                <span className="text-sm text-cyan-700">{mac}</span>
              ) : (
                <>
                  <span className="text-sm text-gray-500">No device</span>
                  {canManage ? (
                    <AddPhoneAction
                      domain={domain}
                      extension={selectedDeviceLine?.line || ownerUser}
                      onSuccess={() => {
                        detailQ.refetch();
                        onUpdated?.();
                      }}
                    />
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[11px] text-gray-500">Features</label>
            <div className="h-8 border-b border-gray-300 flex items-center gap-2">
              {featureIcons.length ? (
                featureIcons.map(({ key, Icon, label }) => (
                  <Icon
                    key={key}
                    className="h-4 w-4 text-gray-700"
                    aria-label={label}
                  />
                ))
              ) : (
                <span className="text-sm text-gray-500">—</span>
              )}
            </div>
          </div>
          <div className="space-y-0.5">
            <label className="text-[11px] text-gray-500">Notes</label>
            <Textarea
              value={form.notes}
              readOnly={!canManage}
              onChange={canManage ? setField("notes") : undefined}
              rows={3}
              className="text-sm resize-none bg-transparent border-gray-300 read-only:cursor-default"
              placeholder="Notes (These notes are visible to the clients via the E911 and Offline Endpoint Reports)"
            />
            {!form.notes ? (
              <p className="text-[11px] text-red-400/80">
                Notes (These notes are visible to the clients via the E911 and
                Offline Endpoint Reports)
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 bg-white border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-x-8 gap-y-3 text-sm">
        <UnderlineField label="Caller ID" value={formatDid(detail.caller_id)} />
        <UnderlineField label="Caller ID Name" value={detail.caller_id_name} />
        <UnderlineField label="Dial Plan" value={detail.dial_plan} />
        <UnderlineField label="Area Code" value={detail.area_code} />
      </div>

      {(detail.time_zone || detail.last_update || mac) && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 text-xs text-gray-500 flex flex-wrap gap-x-4 gap-y-1">
          {detail.time_zone ? <span>Time zone: {detail.time_zone}</span> : null}
          {detail.last_update ? (
            <span>Last update: {detail.last_update}</span>
          ) : null}
        </div>
      )}

      {mac ? (
        <div className="px-4 py-3 bg-white border-t border-gray-100 space-y-2">
          <label className="text-[11px] text-gray-500">
            Provisioning overrides
          </label>
          <Textarea
            value={overrides}
            readOnly={!canManage}
            onChange={
              canManage
                ? (event) => setOverrides(event.target.value)
                : undefined
            }
            rows={2}
            className="text-sm font-mono resize-none read-only:cursor-default"
            placeholder="e.g. timezone=America/New_York&ntp_server=time.google.com"
          />
          {canManage && overridesDirty ? (
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={overridesMutation.isPending}
                onClick={() => setOverrides(activeOverrides)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={overridesMutation.isPending}
                onClick={() => overridesMutation.mutate()}
              >
                {overridesMutation.isPending ? "Saving…" : "Save overrides"}
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="px-4 py-3 bg-white border-t border-gray-200 flex flex-wrap gap-x-5 gap-y-2">
        <PermissionGate pbxAction="manageEndpoints" fallback={null}>
          {selectedDeviceLine?.aor ? (
            <ActionLink
              icon={RefreshCw}
              disabled={deviceResyncMutation.isPending}
              onClick={() => deviceResyncMutation.mutate()}
            >
              {deviceResyncMutation.isPending
                ? "Resyncing…"
                : `Resync ${selectedDeviceLine.line}`}
            </ActionLink>
          ) : mac && primaryDevice ? (
            <ResyncPhoneAction
              macAddress={mac}
              domain={domain}
              onSuccess={() => {
                detailQ.refetch();
                onUpdated?.();
              }}
              label="Resync Phone"
            />
          ) : (
            <ActionLink icon={RefreshCw} disabled>
              Resync Phone
            </ActionLink>
          )}
          {mac ? (
            <DeletePhoneAction
              domain={domain}
              macAddress={mac}
              onSuccess={() => {
                detailQ.refetch();
                onUpdated?.();
              }}
            />
          ) : null}
          {selectedDeviceLine?.aor ? (
            <DeleteDeviceAction
              domain={domain}
              device={selectedDeviceLine.aor}
              owner={ownerUser}
              line={selectedDeviceLine.line}
              onSuccess={() => {
                setSelectedDeviceLineId(null);
                onUpdated?.();
              }}
            />
          ) : null}
        </PermissionGate>
        <ActionLink icon={Lock} disabled>
          Secure Yealink Phone GUI
        </ActionLink>
        <ActionLink icon={Lock} disabled>
          Update Extension Password
        </ActionLink>
        <ActionLink
          icon={Voicemail}
          onClick={() => setVoicemailOpen(true)}
          disabled={false}
        >
          Voicemail Functions
        </ActionLink>
        <ActionLink
          icon={HeartPulse}
          onClick={() => setMonitoringOpen(true)}
          disabled={false}
        >
          Enable/Disable Monitoring
        </ActionLink>
        <ActionLink
          icon={Users}
          onClick={() => setGroupsOpen(true)}
          disabled={false}
        >
          In Group
        </ActionLink>
      </div>

      <Dialog open={monitoringOpen} onOpenChange={setMonitoringOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Recording</DialogTitle>
            <DialogDescription>
              View or change call recording for this subscriber.
            </DialogDescription>
          </DialogHeader>
          {monitoringQ.isLoading ? (
            <div className="py-6 text-sm text-gray-500 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading call recording status...
            </div>
          ) : monitoringQ.isError ? (
            <div className="py-4 text-sm text-red-600">
              {monitoringQ.error?.message ||
                "Failed to load call recording status"}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="text-sm font-medium">Recording enabled</div>
                  <div className="text-xs text-gray-500">
                    Current setting: {monitoringConfiguration}
                  </div>
                </div>
                <Switch
                  checked={monitoringEnabled}
                  disabled={
                    !canManage ||
                    monitoringMutation.isPending ||
                    monitoringQ.isFetching
                  }
                  onCheckedChange={(checked) =>
                    monitoringMutation.mutate(checked)
                  }
                />
              </div>
              {monitoringMutation.isPending ? (
                <div className="text-xs text-gray-500 inline-flex items-center gap-1">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Saving call recording setting...
                </div>
              ) : null}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setMonitoringOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={voicemailOpen} onOpenChange={setVoicemailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Voicemail Functions</DialogTitle>
            <DialogDescription>
              PBX voicemail folders for this subscriber.
            </DialogDescription>
          </DialogHeader>
          {voicemailQ.isLoading ? (
            <div className="py-6 text-sm text-gray-500 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading voicemails...
            </div>
          ) : (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="text-sm text-gray-600">
                  Total messages: {voicemailQ.data?.total || 0}
                </div>
                {(voicemailQ.data?.folders || []).map((folder) => (
                  <div key={folder.folder} className="rounded-md border p-3">
                    <div className="mb-2 text-sm font-medium capitalize">
                      {folder.folder} ({folder.count})
                    </div>
                    {folder.items.length ? (
                      <div className="space-y-2">
                        {folder.items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded border border-gray-100 p-2 text-xs text-gray-700"
                          >
                            <div>From: {item.from || "Unknown"}</div>
                            <div>Received: {item.received_at || "Unknown"}</div>
                            {item.transcription ? (
                              <div className="mt-1 text-gray-500">
                                {item.transcription}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500">
                        No messages in this folder.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setVoicemailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={groupsOpen} onOpenChange={setGroupsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Queue Membership</DialogTitle>
            <DialogDescription>
              Call queues this subscriber is assigned to.
            </DialogDescription>
          </DialogHeader>
          {groupsQ.isLoading ? (
            <div className="py-6 text-sm text-gray-500 inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading queue membership...
            </div>
          ) : groupsQ.data?.groups?.length ? (
            <div className="space-y-2">
              {groupsQ.data.groups.map((group) => (
                <div
                  key={`${group.queue}-${group.status}`}
                  className="rounded-md border p-3 text-sm"
                >
                  <div className="font-medium">
                    {group.queue_name || group.queue || "Queue"}
                  </div>
                  <div className="text-gray-500">
                    Queue: {group.queue || "Unknown"}
                    {group.status ? ` • Status: ${group.status}` : ""}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-gray-500">
              No queue memberships found.
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
