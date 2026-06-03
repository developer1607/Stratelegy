/**
 * Normalize list API responses that may be either a paginated object or a legacy array.
 */
export function normalizePaginatedResponse(data, { limit, offset } = {}) {
  if (Array.isArray(data)) {
    const pageSize = limit ?? data.length;
    const pageOffset = offset ?? 0;
    const hasMore = data.length >= pageSize;
    return {
      items: data,
      total: hasMore ? pageOffset + data.length + 1 : pageOffset + data.length,
      limit: pageSize,
      offset: pageOffset,
    };
  }

  return {
    items: data?.items ?? [],
    total: data?.total ?? 0,
    limit: data?.limit ?? limit ?? 25,
    offset: data?.offset ?? offset ?? 0,
  };
}
