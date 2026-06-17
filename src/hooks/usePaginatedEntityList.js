import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/api/client";

export const DEFAULT_PAGE_SIZE = 25;

/**
 * Fetch a paginated entity list with total count from the server.
 */
export function usePaginatedEntityList(
  entityName,
  {
    sort = "-created_date",
    pageSize = DEFAULT_PAGE_SIZE,
    queryKeyPrefix,
    enabled = true,
    staleTime = 30_000,
  } = {},
) {
  const [page, setPage] = useState(0);

  const queryKey = [queryKeyPrefix || entityName, "page", sort, page, pageSize];

  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey,
    queryFn: () =>
      api.entities[entityName].listPage(sort, pageSize, page * pageSize),
    enabled: enabled && Boolean(entityName),
    staleTime,
  });

  const resetPage = useCallback(() => setPage(0), []);

  const goToPage = useCallback((nextPage) => {
    setPage(Math.max(0, nextPage));
  }, []);

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? pageSize,
    page,
    pageSize,
    setPage: goToPage,
    resetPage,
    isLoading,
    isFetching,
    error,
    refetch,
    queryKey,
  };
}
