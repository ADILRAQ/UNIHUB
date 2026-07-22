import type { InfiniteData } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

interface UseGetPaginatedDataProps<TKeys, TData, TParams, TReturn> {
  queryKey: TKeys[];
  queryFn: (params: TParams) => Promise<TData>;
  transformFn?: (data: InfiniteData<TData, TParams>) => TReturn;
  initialPageParam: TParams;
  getNextPageParam: (
    lastPage: TData,
    allPages: TData[],
    lastPageParam: TParams,
  ) => TParams | undefined;
  enabled?: boolean;
}

/**
 * Generic wrapper around TanStack Query's `useInfiniteQuery`. Per CLAUDE.md,
 * feature code must compose this instead of calling `useInfiniteQuery`
 * directly.
 *
 * The error type is intentionally `any` — see the note in `useGetData.ts`.
 */
const useGetPaginatedData = <TKeys, TData, TParams, TReturn>({
  queryFn,
  queryKey,
  initialPageParam,
  getNextPageParam,
  transformFn,
  enabled = true,
}: UseGetPaginatedDataProps<TKeys, TData, TParams, TReturn>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query = useInfiniteQuery<TData, any, TReturn, TKeys[], TParams>({
    queryKey,
    initialPageParam,
    queryFn: ({ pageParam = initialPageParam }: { pageParam?: unknown }) => {
      return queryFn({ ...(pageParam as TParams) });
    },
    getNextPageParam,
    select: transformFn,
    enabled,
  });

  const loadMore = useCallback(() => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      query.fetchNextPage();
    }
  }, [query.hasNextPage, query.fetchNextPage, query.isFetchingNextPage]);

  const onRefresh = useCallback(() => {
    if (!query.isRefetching) query.refetch();
  }, [query.refetch, query.isRefetching]);

  return {
    ...query,
    loadMore,
    onRefresh,
  };
};

export default useGetPaginatedData;
