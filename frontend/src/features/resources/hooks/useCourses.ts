/**
 * Fetches the caller's course list. Uses the existing schedule feature's
 * `listCourses` service (GET /api/courses) so we don't duplicate the call.
 */
import useGetData from '../../../hooks/useGetData';
import { listCourses } from '../../schedule/services/courseService';
import type { Course } from '../../schedule/types';

interface UseCoursesReturn {
  courses: Course[];
  isLoading: boolean;
  isError: boolean;
}

const useCourses = (): UseCoursesReturn => {
  const { data, isLoading, isError } = useGetData<Course[], string, Course[]>({
    queryKey: ['courses', 'list'],
    queryFn: listCourses,
    transformFn: (d) => d,
  });

  return {
    courses: data ?? [],
    isLoading,
    isError,
  };
};

export default useCourses;
