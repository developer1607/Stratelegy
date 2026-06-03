import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { toast } from 'sonner';

export default function E911UnprovisionAction({ phoneNumber, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.unprovisionE911(phoneNumber),
    onSuccess: () => {
      toast.success('E911 removed');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to unprovision'),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Remove"
      title="Unprovision E911?"
      description={`Remove E911 location data for ${phoneNumber}.`}
      confirmLabel="Remove"
      loading={mutation.isPending}
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
