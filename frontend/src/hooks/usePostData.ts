import { useMutation } from '@tanstack/react-query';

interface UsePostDataProps<Tkeys, Tparam, Treturn> {
  keys?: Tkeys[];
  serviceFn: (params: Tparam) => Promise<Treturn>;
  onSuccessFn?: (data: Treturn) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onErrorFn?: (error: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSettledFn?: (data: Treturn | undefined, error: any) => void;
}

/**
 * Generic wrapper around TanStack Query's `useMutation`. Per CLAUDE.md,
 * feature code must compose this instead of calling `useMutation` directly.
 *
 * The error type is intentionally `any` — see the note in `useGetData.ts`.
 */
const usePostData = <Tkeys, Tparam, Treturn>({
  keys,
  serviceFn,
  onErrorFn,
  onSuccessFn,
  onSettledFn,
}: UsePostDataProps<Tkeys, Tparam, Treturn>) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useMutation<Treturn, any, Tparam, unknown>({
    mutationKey: keys,
    mutationFn: serviceFn,
    onSuccess: (data) => onSuccessFn?.(data),
    onError: (error) => onErrorFn?.(error),
    onSettled: (data, error) => onSettledFn?.(data, error),
  });
};

export default usePostData;
