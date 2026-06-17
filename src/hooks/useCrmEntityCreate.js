import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { showError, showSuccess } from '@/lib/toast';

/**
 * Generic CRM create flow — same create/invalidate/toast handling as Dashboard.jsx.
 * Owns the create dialog open state so list pages stay in sync with the
 * working Dashboard behavior. Dashboard is unchanged; other pages use this.
 */
export function useCrmEntityCreate({
  entityName,
  invalidateKeys = [],
  successMessage,
  errorMessage,
  onCreated,
} = {}) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const mutation = useMutation({
    mutationFn: (data) => api.entities[entityName].create(data),
    onSuccess: () => {
      for (const key of invalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      setDialogOpen(false);
      if (successMessage) showSuccess(successMessage);
      onCreated?.();
    },
    onError: (error) => showError(error, errorMessage),
  });

  const handleDialogOpenChange = useCallback(
    (open) => {
      if (!open && mutation.isPending) return;
      setDialogOpen(open);
    },
    [mutation.isPending],
  );

  const submitCreate = useCallback((data) => mutation.mutate(data), [mutation]);

  return {
    dialogOpen,
    setDialogOpen,
    handleDialogOpenChange,
    submitCreate,
    isCreating: mutation.isPending,
  };
}
