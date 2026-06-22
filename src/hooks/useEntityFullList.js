import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

/**
 * Full entity list for KPI cards and CSV export (table stays paginated).
 */
export function useEntityFullList(
  entityName,
  { sort = '-created_date', queryKeyPrefix, enabled = true, staleTime = 30_000 } = {},
) {
  return useQuery({
    queryKey: [queryKeyPrefix || entityName, 'all', sort],
    queryFn: () => api.entities[entityName].list(sort),
    enabled: enabled && Boolean(entityName),
    staleTime,
  });
}
