import apiClient from '../api/client';
import type { ClassGroupDto } from '../api/types';
import useGetData from './useGetData';

/** Shared query key for the full class-groups list, so mutations can invalidate it. */
export const CLASS_GROUPS_KEY = ['admin', 'class-groups'] as const;

/** Every class group — `all=true` so teachers get the full list too (admin parity). */
const listAllClassGroups = (): Promise<ClassGroupDto[]> =>
  apiClient
    .get<ClassGroupDto[]>('/api/class-groups', { params: { all: true } })
    .then((response) => response.data);

export interface UseClassGroupsData {
  classGroups: ClassGroupDto[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Reusable read hook for the full class-groups list, shared by the admin console
 * (class-groups section, Add-user form, Users filter) and the payments admin tabs,
 * so every dropdown stays in sync from a single cache entry.
 */
const useClassGroupsData = (): UseClassGroupsData => {
  const { data, isLoading, isError } = useGetData<ClassGroupDto[], string, ClassGroupDto[]>({
    queryKey: [...CLASS_GROUPS_KEY],
    queryFn: listAllClassGroups,
    transformFn: (groups) => groups,
  });

  return {
    classGroups: data ?? [],
    isLoading,
    isError,
  };
};

export default useClassGroupsData;
