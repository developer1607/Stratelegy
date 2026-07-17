import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PermissionGate from "@/components/PermissionGate";
import AddPhoneAction from "@/components/pbx/endpoints/AddPhoneAction";
import DeletePhoneAction from "@/components/pbx/endpoints/DeletePhoneAction";
import DeleteSubscriberAction from "@/components/pbx/endpoints/DeleteSubscriberAction";
import ResyncPhoneAction from "@/components/pbx/endpoints/ResyncPhoneAction";
import PbxFormField from "@/components/pbx/shared/PbxFormField";
import { usePermissions } from "@/hooks/usePermissions";
import { canAccessPbxDataScope, canPbxAction } from "@/lib/permissions";
import { formatPbxCell } from "@/lib/pbxTable";
import { endpointStatusBadge } from "@/lib/pbxEndpointUtils";
import { toast } from "sonner";

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-2 border-b border-gray-100 last:border-0 text-sm">
      <dt className="text-gray-500 font-medium">{label}</dt>
      <dd className="col-span-2 text-gray-900 break-words">
        {formatPbxCell(value)}
      </dd>
    </div>
  );
}

export default function SubscriberDetailSheet({
  domain,
  subscriber,
  open,
  onOpenChange,
  onUpdated,
}) {
  const { permissions } = usePermissions();
  const canManage = canPbxAction(permissions, "manageEndpoints");
  const canUc = canAccessPbxDataScope(permissions, "extensions");
  const canE911 = canAccessPbxDataScope(permissions, "e911Review");
  const ext = subscriber?.user;
  const [form, setForm] = useState({
    email: "",
    department: "",
    site: "",
    notes: "",
    vm_pin: "",
  });

  const detailQ = useQuery({
    queryKey: ["pbx-endpoint-detail", domain, ext],
    queryFn: () => pbxApi.endpointDetail(domain, ext),
    enabled: open && !!domain && !!ext,
    retry: false,
  });

  const ucQ = useQuery({
    queryKey: ["pbx-uc-config", domain, ext],
    queryFn: () => pbxApi.ucConfig(domain, ext, { include_entitlement: 1 }),
    enabled: open && !!domain && !!ext && canUc,
  });

  const enriched = detailQ.data?.subscriber
    ? { ...subscriber, ...detailQ.data.subscriber }
    : subscriber;
  const macAddress = enriched?.mac_address || detailQ.data?.phone?.mac || null;
  const phoneRecord = detailQ.data?.phone || null;
  const callerId = enriched?.caller_id;

  useEffect(() => {
    if (!enriched) return;
    setForm({
      email: enriched.email_address || "",
      department: enriched.department || enriched.group || "",
      site: enriched.site || "",
      notes: enriched.notes || "",
      vm_pin: enriched.vm_pin || "",
    });
  }, [
    enriched?.email_address,
    enriched?.department,
    enriched?.group,
    enriched?.site,
    enriched?.notes,
    enriched?.vm_pin,
  ]);

  const saveMutation = useMutation({
    mutationFn: () =>
      pbxApi.updateEndpointSubscriber(domain, ext, {
        email: form.email,
        department: form.department,
        notes: form.notes,
        site: form.site,
        vm_pin: form.vm_pin,
      }),
    onSuccess: () => {
      toast.success("Extension updated");
      detailQ.refetch();
      onUpdated?.();
    },
    onError: (err) => toast.error(err.message || "Failed to update extension"),
  });

  const e911Q = useQuery({
    queryKey: ["pbx-e911-detail", callerId],
    queryFn: () =>
      pbxApi.e911Detail(String(callerId).replace(/\D/g, "").slice(-11)),
    enabled: open && !!callerId && canE911 && /\d{10,}/.test(String(callerId)),
    retry: false,
  });

  const phoneQ = useQuery({
    queryKey: ["pbx-phone-detail", domain, macAddress],
    queryFn: () => pbxApi.phoneDetail(macAddress, domain),
    enabled: open && !!domain && !!macAddress && !phoneRecord,
    retry: false,
  });

  const dirty = useMemo(() => {
    if (!enriched) return false;
    return (
      form.email !== (enriched.email_address || "") ||
      form.department !== (enriched.department || enriched.group || "") ||
      form.notes !== (enriched.notes || "") ||
      form.site !== (enriched.site || "") ||
      form.vm_pin !== (enriched.vm_pin || "")
    );
  }, [form, enriched]);

  const refreshDetail = () => {
    detailQ.refetch();
    phoneQ.refetch();
    onUpdated?.();
  };

  if (!subscriber) return null;

  const phone = phoneRecord || phoneQ.data;
  const statusKey =
    enriched?.online_status ??
    (detailQ.isFetched || detailQ.isError ? "no_device" : null);
  const status = endpointStatusBadge(statusKey);
  const statusLabel =
    detailQ.isLoading && statusKey == null ? "Loading…" : status.label;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 flex-wrap">
            <span>
              Endpoint {enriched.user} — {enriched.name || "Extension"}
            </span>
            <Badge className={status.className}>{statusLabel}</Badge>
          </SheetTitle>
          <SheetDescription>
            {domain ? `Endpoint details for ${domain}` : "Endpoint details"}
          </SheetDescription>
        </SheetHeader>

        {canManage ? (
          <div className="mt-4 space-y-3 rounded-lg border border-gray-200 p-3 bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">
              Edit extension
            </h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <PbxFormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, email: e.target.value }))
                }
              />
              <PbxFormField
                label="Department / group"
                value={form.department}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, department: e.target.value }))
                }
              />
              <PbxFormField
                label="Site"
                value={form.site}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, site: e.target.value }))
                }
              />
              <PbxFormField
                label="Voicemail PIN"
                value={form.vm_pin}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, vm_pin: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <Textarea
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={3}
                className="bg-white"
              />
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {dirty ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm({
                        email: enriched.email_address || "",
                        department: enriched.department || enriched.group || "",
                        site: enriched.site || "",
                        notes: enriched.notes || "",
                        vm_pin: enriched.vm_pin || "",
                      })
                    }
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={saveMutation.isPending}
                    onClick={() => saveMutation.mutate()}
                  >
                    {saveMutation.isPending ? "Saving…" : "Save changes"}
                  </Button>
                </>
              ) : null}
              <DeleteSubscriberAction
                domain={domain}
                user={enriched.user}
                name={enriched.name}
                onSuccess={() => {
                  onOpenChange(false);
                  onUpdated?.();
                }}
              />
            </div>
          </div>
        ) : null}

        <dl className="mt-4">
          <DetailRow label="Extension" value={enriched.user} />
          <DetailRow label="Name" value={enriched.name} />
          <DetailRow label="Login" value={enriched.subscriber_login} />
          {!canManage ? (
            <DetailRow label="Email" value={enriched.email_address} />
          ) : null}
          <DetailRow label="Caller ID" value={enriched.caller_id} />
          <DetailRow label="Scope" value={enriched.scope} />
          {!canManage ? <DetailRow label="Site" value={enriched.site} /> : null}
          {!canManage ? (
            <DetailRow
              label="Department"
              value={enriched.department || enriched.group}
            />
          ) : null}
          <DetailRow label="Transport" value={enriched.transport} />
          <DetailRow label="Geo node" value={enriched.geo_node} />
          <DetailRow
            label="WAN IP"
            value={enriched.wan_ip || enriched.wan_lan}
          />
          <DetailRow label="MAC" value={macAddress} />
          <DetailRow label="Model" value={enriched.model} />
          <DetailRow label="Service" value={enriched.srv_code} />
          <DetailRow
            label="Features"
            value={
              (enriched.features || []).length
                ? enriched.features.join(", ")
                : null
            }
          />
          {!canManage ? (
            <DetailRow label="Notes" value={enriched.notes} />
          ) : null}
        </dl>

        {canManage && !macAddress ? (
          <div className="mt-4">
            <AddPhoneAction
              domain={domain}
              extension={enriched.user}
              onSuccess={refreshDetail}
            />
          </div>
        ) : null}

        {canUc && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              UC config
            </h3>
            {ucQ.isLoading ? (
              <div className="flex items-center text-gray-500 text-sm py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading UC config…
              </div>
            ) : ucQ.error ? (
              <p className="text-sm text-gray-500">
                UC config unavailable for this extension.
              </p>
            ) : (
              <ul className="text-sm space-y-1 max-h-48 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                {(Array.isArray(ucQ.data)
                  ? ucQ.data
                  : ucQ.data
                    ? Object.values(ucQ.data)
                    : []
                )
                  .slice(0, 12)
                  .map((item, idx) => (
                    <li
                      key={item.id ?? idx}
                      className="flex justify-between gap-2"
                    >
                      <span className="text-gray-600 truncate">
                        {item.setting?.display_name ||
                          item.setting_name ||
                          "Setting"}
                      </span>
                      <span className="text-gray-900 shrink-0">
                        {formatPbxCell(item.setting_value)}
                      </span>
                    </li>
                  ))}
              </ul>
            )}
          </section>
        )}

        {macAddress ? (
          <section className="mt-6">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h3 className="text-sm font-semibold text-gray-900">
                Provisioned phone
              </h3>
              <div className="flex flex-wrap gap-2">
                {phone?.primary_device ? (
                  <PermissionGate pbxAction="manageEndpoints">
                    <ResyncPhoneAction
                      macAddress={macAddress}
                      domain={domain}
                      onSuccess={refreshDetail}
                    />
                  </PermissionGate>
                ) : null}
                {canManage ? (
                  <DeletePhoneAction
                    domain={domain}
                    macAddress={macAddress}
                    onSuccess={refreshDetail}
                  />
                ) : null}
              </div>
            </div>
            {phoneQ.isLoading && !phone ? (
              <div className="flex items-center text-gray-500 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading phone provisioning…
              </div>
            ) : phoneQ.error && !phone ? (
              <p className="text-sm text-gray-500">
                No PBX phone provisioning record for this MAC address.
              </p>
            ) : phone ? (
              <div className="border rounded-lg p-3 bg-gray-50 space-y-1 text-sm">
                <p>
                  <span className="text-gray-500">Model:</span>{" "}
                  {phone.model || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Primary line:</span>{" "}
                  {phone.primary_line || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Device:</span>{" "}
                  {phone.primary_device || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Transport:</span>{" "}
                  {phone.transport || "—"}
                </p>
                <p>
                  <span className="text-gray-500">User agent:</span>{" "}
                  {phone.user_agent || "—"}
                </p>
                <p>
                  <span className="text-gray-500">Registered at:</span>{" "}
                  {phone.registration_time || "—"}
                </p>
              </div>
            ) : null}
          </section>
        ) : null}

        {canE911 && enriched.caller_id && (
          <section className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">E911</h3>
            {e911Q.isLoading ? (
              <div className="flex items-center text-gray-500 text-sm py-2">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading E911…
              </div>
            ) : e911Q.error || !e911Q.data ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No E911 record for this caller ID.
              </p>
            ) : (
              <div className="text-sm border rounded-lg p-3 bg-gray-50 space-y-1">
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {e911Q.data.phone_number}
                </p>
                <p>
                  <span className="text-gray-500">Routing:</span>{" "}
                  {e911Q.data.location?.level_of_service?.routing_status || "—"}
                </p>
                <p>
                  <span className="text-gray-500">City:</span>{" "}
                  {e911Q.data.location?.address?.civic_address?.city || "—"}
                </p>
              </div>
            )}
          </section>
        )}
      </SheetContent>
    </Sheet>
  );
}
