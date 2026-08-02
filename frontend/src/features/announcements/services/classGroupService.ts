/**
 * Class-group service for the announcement composer.
 * Returns the groups a user may post to, depending on their role:
 *   ADMIN  → all class groups via GET /api/class-groups
 *   TEACHER → only the groups whose courses they teach via GET /api/courses
 */
import apiClient from '../../../api/client';
import type { ClassGroupOption } from '../types';

/** Shape returned by GET /api/class-groups */
interface ClassGroupDto {
  id: number;
  name: string;
}

/** Shape returned by GET /api/courses (fields relevant to us) */
interface CourseDto {
  classGroupId: number;
  classGroupName: string;
}

const getAdminGroups = (): Promise<ClassGroupOption[]> =>
  apiClient
    .get<ClassGroupDto[]>('/api/class-groups')
    .then((r) =>
      r.data.map((g) => ({ id: g.id, name: g.name })),
    );

const getTeacherGroups = (): Promise<ClassGroupOption[]> =>
  apiClient
    .get<CourseDto[]>('/api/courses')
    .then((r) => {
      // Deduplicate groups (a teacher may teach multiple courses to the same group)
      const seen = new Map<number, ClassGroupOption>();
      for (const course of r.data) {
        if (!seen.has(course.classGroupId)) {
          seen.set(course.classGroupId, {
            id: course.classGroupId,
            name: course.classGroupName,
          });
        }
      }
      return Array.from(seen.values());
    });

/**
 * Returns the list of class groups that the caller may target when posting
 * an announcement. Dispatches to the correct endpoint based on role.
 */
export const getPostableGroups = (role: string): Promise<ClassGroupOption[]> => {
  if (role === 'ADMIN' || role === 'TEACHER') {
    return getAdminGroups();
  }
  return getTeacherGroups();
};
