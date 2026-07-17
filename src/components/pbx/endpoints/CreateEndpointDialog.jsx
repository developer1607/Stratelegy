import React, { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { pbxApi } from "@/api/pbx";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PbxFormField from "@/components/pbx/shared/PbxFormField";
import PbxFormSelect from "@/components/pbx/shared/PbxFormSelect";
import { toast } from "sonner";

const DEFAULT_FORM = {
  user: "",
  first_name: "",
  last_name: "",
  email: "",
  scope: "Basic User",
  srv_code: "system-user",
  dial_policy: "US and Canada",
  site: "",
  provision_phone: false,
  mac: "",
  model: "generic",
  transport: "UDP",
  provision_messaging: false,
  device_user: "",
};

const SCOPE_OPTIONS = [
  { value: "Basic User", label: "Basic User" },
  { value: "No Portal", label: "No Portal" },
  { value: "Office Manager", label: "Office Manager" },
  { value: "Call Center Supervisor", label: "Call Center Supervisor" },
];

const SERVICE_OPTIONS = [
  { value: "system-user", label: "User (system-user)" },
  { value: "system-aa", label: "Auto attendant (system-aa)" },
  { value: "system-queue", label: "Call queue (system-queue)" },
];

const TRANSPORT_OPTIONS = [
  { value: "UDP", label: "UDP" },
  { value: "TCP", label: "TCP" },
  { value: "TLS", label: "TLS" },
];

export default function CreateEndpointDialog({
  domain,
  onSuccess,
  trigger = "headerIcon",
  variant = "endpoint",
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...DEFAULT_FORM });

  useEffect(() => {
    if (open) setForm({ ...DEFAULT_FORM });
  }, [open]);

  const isExtension = variant === "extension";
  const addLabel = isExtension ? "Add extension" : "Add endpoint";
  const dialogTitle = isExtension ? "Add extension" : "Add endpoint";
  const submitLabel = isExtension ? "Create extension" : "Create endpoint";

  const mutation = useMutation({
    mutationFn: () =>
      pbxApi.createEndpoint(domain, {
        user: form.user.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim() || undefined,
        scope: form.scope,
        srv_code: form.srv_code,
        dial_policy: form.dial_policy,
        site: form.site.trim() || undefined,
        mac: form.provision_phone ? form.mac : undefined,
        model: form.provision_phone ? form.model : undefined,
        transport: form.provision_phone ? form.transport : undefined,
        provision_messaging: form.provision_messaging,
        device_user: form.provision_messaging
          ? form.device_user.trim()
          : undefined,
        messaging_name:
          form.provision_messaging && (form.first_name || form.last_name)
            ? `${form.first_name} ${form.last_name}`.trim()
            : undefined,
      }),
    onSuccess: () => {
      toast.success(isExtension ? "Extension created" : "Endpoint created");
      setOpen(false);
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || "Failed to create endpoint"),
  });

  const canSubmit =
    form.user.trim() &&
    form.first_name.trim() &&
    (!form.provision_phone || form.mac.trim()) &&
    (!form.provision_messaging || form.device_user.trim());

  const triggerNode =
    trigger === "toolbar" ? (
      <Button size="sm">
        <Plus className="h-4 w-4 mr-1.5" />
        {addLabel}
      </Button>
    ) : (
      <button
        type="button"
        className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
        title="Add endpoint"
        aria-label="Add endpoint"
      >
        <Plus className="h-4 w-4" />
      </button>
    );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerNode}</DialogTrigger>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (canSubmit) mutation.mutate();
          }}
        >
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>
              Creates a PBX subscriber on the selected domain. Optionally
              provision a MAC/phone and messaging hub user when those APIs
              apply.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid sm:grid-cols-2 gap-3">
              <PbxFormField
                label="Extension"
                value={form.user}
                onChange={(e) => setForm({ ...form, user: e.target.value })}
                required
              />
              <PbxFormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <PbxFormField
                label="First name"
                value={form.first_name}
                onChange={(e) =>
                  setForm({ ...form, first_name: e.target.value })
                }
                required
              />
              <PbxFormField
                label="Last name"
                value={form.last_name}
                onChange={(e) =>
                  setForm({ ...form, last_name: e.target.value })
                }
              />
              <PbxFormSelect
                label="User scope"
                value={form.scope}
                onValueChange={(value) => setForm({ ...form, scope: value })}
                options={SCOPE_OPTIONS}
              />
              <PbxFormSelect
                label="Service type"
                value={form.srv_code}
                onValueChange={(value) => setForm({ ...form, srv_code: value })}
                options={SERVICE_OPTIONS}
              />
              <PbxFormField
                label="Dial policy"
                value={form.dial_policy}
                onChange={(e) =>
                  setForm({ ...form, dial_policy: e.target.value })
                }
              />
              <PbxFormField
                label="Site"
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
              />
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Checkbox
                  checked={form.provision_phone}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, provision_phone: checked === true })
                  }
                />
                Provision phone (MAC)
              </label>
              {form.provision_phone ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  <PbxFormField
                    label="MAC address"
                    value={form.mac}
                    onChange={(e) => setForm({ ...form, mac: e.target.value })}
                    placeholder="001122334455"
                    required
                  />
                  <PbxFormField
                    label="Model"
                    value={form.model}
                    onChange={(e) =>
                      setForm({ ...form, model: e.target.value })
                    }
                  />
                  <PbxFormSelect
                    label="Transport"
                    value={form.transport}
                    onValueChange={(value) =>
                      setForm({ ...form, transport: value })
                    }
                    options={TRANSPORT_OPTIONS}
                  />
                </div>
              ) : null}
            </div>

            <div className="space-y-3 rounded-lg border border-gray-200 p-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-900">
                <Checkbox
                  checked={form.provision_messaging}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, provision_messaging: checked === true })
                  }
                />
                Provision messaging hub user
              </label>
              {form.provision_messaging ? (
                <PbxFormField
                  label="Device user"
                  value={form.device_user}
                  onChange={(e) =>
                    setForm({ ...form, device_user: e.target.value })
                  }
                  placeholder="1000m"
                  required
                />
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!canSubmit || mutation.isPending}>
              {mutation.isPending ? "Creating…" : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
