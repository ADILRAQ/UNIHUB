import apiClient from '../../../api/client';
import type { ClassGroupDto } from '../../admin/types';

/**
 * Returns the class groups that the authenticated teacher is assigned to.
 * The backend scopes `GET /api/class-groups` to the caller's own groups when
 * the caller is a TEACHER.
 */
export const listTeacherClassGroups = (): Promise<ClassGroupDto[]> =>
  apiClient.get<ClassGroupDto[]>('/api/class-groups').then((r) => r.data);
