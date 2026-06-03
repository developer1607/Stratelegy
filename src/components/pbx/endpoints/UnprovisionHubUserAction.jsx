import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { toast } from 'sonner';

export default function UnprovisionHubUserAction({ userId, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.unprovisionHubUser(userId),
    onSuccess: () => {
      toast.success('User unprovisioned');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed'),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Unprovision"
      title="Unprovision hub user?"
      description={`Remove messaging hub user ${userId} from SkySwitch.`}
      confirmLabel="Unprovision"
      loading={mutation.isPending}
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
