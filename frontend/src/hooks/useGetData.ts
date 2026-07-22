import { useQuery } from '@tanstack/react-query';

interface UseGetDataProps<TData, TKeys, TReturn> {
  queryKey: TKeys[];
  queryFn: () => Promise<TData>;
  transformFn: (data: TData) => TReturn;
  enabled?: boolean;
}

/**
 * Generic wrapper around TanStack Query's `useQuery`. Per CLAUDE.md, feature
 * code must compose this instead of calling `useQuery` directly.
 *
 * The error type is intentionally `any`: react-query's default `TError`
 * generic is `Error`, but our API client can reject with an Axios error,
 * a network error, or a validation error shape from the backend's global
 * exception handler — callers narrow it themselves at the call site.
 */
const useGetData = <TData, TKeys, TReturn>({
  queryKey: keys,
  queryFn: serviceFn,
  transformFn,
  enabled = true,
}: UseGetDataProps<TData, TKeys, TReturn>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useQuery<TData, any, TReturn, TKeys[]>({
    queryKey: keys,
    queryFn: serviceFn,
    select: transformFn,
    enabled,
  });
};

export default useGetData;
