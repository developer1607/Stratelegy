import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import PbxDeleteDialog from '@/components/pbx/shared/PbxDeleteDialog';
import { toast } from 'sonner';

export default function DeleteSubscriberAction({ domain, user, name, onSuccess }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.deleteEndpoint(domain, user),
    onSuccess: () => {
      toast.success('Endpoint deleted');
      onSuccess?.();
    },
    onError: (err) => toast.error(err?.message || 'Failed to delete endpoint'),
  });

  return (
    <PbxDeleteDialog
      triggerLabel="Delete"
      title="Delete endpoint?"
      description={`Remove extension ${user}${name ? ` (${name})` : ''} from this domain. Linked MAC/phone records are removed when present.`}
      confirmLabel="Delete endpoint"
      loading={mutation.isPending}
      onConfirm={() => mutation.mutateAsync()}
    />
  );
}
