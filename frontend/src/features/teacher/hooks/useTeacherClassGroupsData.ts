import useGetData from '../../../hooks/useGetData';
import { listTeacherClassGroups } from '../services/classGroupService';
import type { ClassGroupDto } from '../../admin/types';

/** Shared query key for the teacher's class-groups list. */
export const TEACHER_CLASS_GROUPS_KEY = ['teacher', 'class-groups'] as const;

export interface UseTeacherClassGroupsData {
  classGroups: ClassGroupDto[];
  isLoading: boolean;
}

/**
 * Shared hook returning the authenticated teacher's own class groups.
 * Consumed by both the courses and students sections so both dropdowns
 * stay in sync with a single fetch.
 */
const useTeacherClassGroupsData = (): UseTeacherClassGroupsData => {
  const { data, isLoading } = useGetData<ClassGroupDto[], string, ClassGroupDto[]>({
    queryKey: [...TEACHER_CLASS_GROUPS_KEY],
    queryFn: listTeacherClassGroups,
    transformFn: (groups) => groups,
  });

  return {
    classGroups: data ?? [],
    isLoading,
  };
};

export default useTeacherClassGroupsData;
