import apiClient from '../../../api/client';

/**
 * Small reference reads the admin course form needs: the teacher list (to assign
 * a course's teacher) and the class-group list (to scope a course). Both are
 * ADMIN-only server-side and are only used inside admin-gated screens. Kept
 * feature-local so the schedule feature stays self-contained.
 */

/** Minimal teacher option for the course form's teacher dropdown. */
export interface TeacherOption {
  id: number;
  fullName: string;
}

/** Minimal class-group option for the course form's group dropdown. */
export interface ClassGroupOption {
  id: number;
  name: string;
}

interface UserSummary {
  id: number;
  fullName: string;
}

/** Minimal shape of the paged `/api/users` response (only `content` is needed here). */
interface PagedUsers {
  content: UserSummary[];
}

/** `GET /api/users?role=TEACHER` — flattened to id + name options. */
export const listTeachers = (): Promise<TeacherOption[]> =>
  apiClient
    .get<PagedUsers>('/api/users', { params: { role: 'TEACHER', size: 200 } })
    .then((response) => response.data.content.map((u) => ({ id: u.id, fullName: u.fullName })));

/** `GET /api/class-groups` — flattened to id + name options. */
export const listClassGroups = (): Promise<ClassGroupOption[]> =>
  apiClient
    .get<ClassGroupOption[]>('/api/class-groups')
    .then((response) => response.data.map((g) => ({ id: g.id, name: g.name })));
