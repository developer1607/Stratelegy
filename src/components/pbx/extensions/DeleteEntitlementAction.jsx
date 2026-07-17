import React from "react";
import { useMutation } from "@tanstack/react-query";
import { pbxApi } from "@/api/pbx";
import PbxDeleteDialog from "@/components/pbx/shared/PbxDeleteDialog";
import { toast } from "sonner";

export default function DeleteEntitlementAction({ entitlement, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.deleteEntitlement(entitlement.id),
    onSuccess: () => {
      toast.success("Entitlement removed");
      onSuccess?.();
    },
    onError: (err) =>
      toast.error(err?.message || "Failed to remove entitlement"),
  });

  if (!entitlement?.id) return null;

  const label = [
    entitlement.subscriber,
    entitlement.offering?.name || entitlement.offering_name,
  ]
    .filter(Boolean)
    .join(" — ");

  return (
    <PbxDeleteDialog
      triggerLabel="Delete"
      title="Remove entitlement?"
      description={`Remove entitlement${label ? ` for ${label}` : ""}.`}
      confirmLabel="Remove"
      loading={mutation.isPending}
      triggerVariant="outline"
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
