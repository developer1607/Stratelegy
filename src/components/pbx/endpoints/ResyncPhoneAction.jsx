import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { pbxApi } from '@/api/pbx';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ResyncPhoneAction({ macAddress, domain, onSuccess, label, className }) {
  const mutation = useMutation({
    mutationFn: () => pbxApi.resyncPhone(macAddress, domain),
    onSuccess: () => {
      toast.success('Phone resync requested');
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message || 'Failed to resync phone'),
  });

  if (label) {
    return (
      <button
        type="button"
        disabled={mutation.isPending}
        onClick={() => mutation.mutate()}
        className={
          className ||
          'inline-flex items-center gap-1.5 text-sm text-blue-700 hover:underline disabled:text-gray-400'
        }
      >
        {mutation.isPending ? 'Resyncing…' : label}
      </button>
    );
  }

  return (
    <Button variant="outline" size="sm" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
      {mutation.isPending ? 'Resyncing…' : 'Resync'}
    </Button>
  );
}
