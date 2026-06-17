import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { showError, showSuccess } from '@/lib/toast';

/**
 * Lead create mutation — same success/error handling as Dashboard.jsx.
 * Dashboard is unchanged; other pages import this to stay in sync.
 */
export function useLeadCreateMutation({ extraInvalidateKeys = [], onCreated } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.entities.Lead.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads', 'dashboard'] });
      for (const key of extraInvalidateKeys) {
        queryClient.invalidateQueries({ queryKey: key });
      }
      showSuccess('Lead created.');
      onCreated?.();
    },
    onError: (error) => showError(error, 'Failed to create lead.'),
  });
}
