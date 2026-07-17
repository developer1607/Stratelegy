import React from "react";
import { useMutation } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxDeleteDialog from "@/components/pbx/shared/PbxDeleteDialog";
import { toast } from "sonner";

export default function DeletePhoneAction({ domain, macAddress, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.deletePhone(macAddress, domain),
    onSuccess: () => {
      toast.success("Phone removed");
      onSuccess?.();
    },
    onError: (err) => toast.error(err?.message || "Failed to remove phone"),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Remove phone"
      title="Remove provisioned phone?"
      description={`Delete MAC ${macAddress} from this domain. The subscriber extension is not removed.`}
      confirmLabel="Remove phone"
      loading={mutation.isPending}
      triggerVariant="outline"
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
