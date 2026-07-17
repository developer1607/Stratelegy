import React from "react";
import { useMutation } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxDeleteDialog from "@/components/pbx/shared/PbxDeleteDialog";
import { toast } from "sonner";

export default function E911DeletePoolAction({ domain, callid, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.deleteEmergencyPoolNumber(domain, callid),
    onSuccess: () => {
      toast.success("Emergency pool number removed");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to remove pool number"),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Remove"
      title="Remove from emergency pool?"
      description={`Remove ${callid} from the domain 911 caller ID pool.`}
      confirmLabel="Remove"
      loading={mutation.isPending}
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
