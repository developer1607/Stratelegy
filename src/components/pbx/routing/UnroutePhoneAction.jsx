import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { toast } from 'sonner';

export default function UnroutePhoneAction({ phoneNumber, onSuccess }) {
  const [loading, setLoading] = useState(false);

  const mutation = useMutation({
    mutationFn: () => pbxApi.deleteRoute(phoneNumber),
    onSuccess: () => {
      toast.success('Route removed');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to unroute'),
    onSettled: () => setLoading(false),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Unroute"
      title="Remove phone route?"
      description={`This will delete routing for ${phoneNumber}. The phone number itself is not removed from your account.`}
      confirmLabel="Unroute"
      loading={loading || mutation.isPending}
      onConfirm={async () => {
        setLoading(true);
        await mutation.mutateAsync();
      }}
    />
  );
}
