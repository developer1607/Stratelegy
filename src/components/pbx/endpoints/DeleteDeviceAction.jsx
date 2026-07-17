import React from "react";
import { useMutation } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxDeleteDialog from "@/components/pbx/shared/PbxDeleteDialog";
import { toast } from "sonner";

export default function DeleteDeviceAction({
  domain,
  device,
  owner,
  line,
  onSuccess,
}) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.deleteEndpointDevice(domain, device, owner),
    onSuccess: () => {
      toast.success("Device line removed");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to remove device line"),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Remove device line"
      title={`Remove ${line || "device line"}?`}
      description={`Delete this device registration from extension ${owner}. The subscriber extension will not be removed.`}
      confirmLabel="Remove device line"
      loading={mutation.isPending}
      triggerVariant="outline"
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
