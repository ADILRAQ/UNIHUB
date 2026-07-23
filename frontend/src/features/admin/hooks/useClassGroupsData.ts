import useGetData from '../../../hooks/useGetData';
import { listClassGroups } from '../services/classGroupService';
import type { ClassGroupDto } from '../types';

/** Shared query key for the class-groups list, so mutations can invalidate it. */
export const CLASS_GROUPS_KEY = ['admin', 'class-groups'] as const;

export interface UseClassGroupsData {
  classGroups: ClassGroupDto[];
  isLoading: boolean;
  isError: boolean;
}

/**
 * Reusable read hook for the class-groups list. Consumed by the class-groups
 * management section as well as the class-group dropdowns in the Add-user form
 * and the Users filter bar — a single source so all three stay in sync.
 */
const useClassGroupsData = (): UseClassGroupsData => {
  const { data, isLoading, isError } = useGetData<ClassGroupDto[], string, ClassGroupDto[]>({
    queryKey: [...CLASS_GROUPS_KEY],
    queryFn: listClassGroups,
    transformFn: (groups) => groups,
  });

  return {
    classGroups: data ?? [],
    isLoading,
    isError,
  };
};

export default useClassGroupsData;
