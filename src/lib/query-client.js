import { QueryClient } from '@tanstack/react-query';
import { shouldRetryQuery } from '@/lib/queryHelpers';

export const queryClientInstance = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: shouldRetryQuery,
    },
  },
});
