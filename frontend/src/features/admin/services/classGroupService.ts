import apiClient from '../../../api/client';
import type { ClassGroupDto, ClassGroupNameRequest } from '../types';

/**
 * Service functions for the admin class-group endpoints. All HTTP goes through
 * the shared typed `apiClient`; the section logic hooks compose these via the
 * generic `useGetData` / `usePostData` wrappers.
 */

/** Every class group, even for a teacher (default list is scoped to the teacher's own groups). */
export const listAllClassGroups = (): Promise<ClassGroupDto[]> =>
  apiClient
    .get<ClassGroupDto[]>('/api/class-groups', { params: { all: true } })
    .then((response) => response.data);

export const createClassGroup = (body: ClassGroupNameRequest): Promise<ClassGroupDto> =>
  apiClient.post<ClassGroupDto>('/api/class-groups', body).then((response) => response.data);

export const renameClassGroup = ({
  id,
  name,
}: { id: number } & ClassGroupNameRequest): Promise<ClassGroupDto> =>
  apiClient
    .patch<ClassGroupDto>(`/api/class-groups/${id}`, { name })
    .then((response) => response.data);

export const deleteClassGroup = (id: number): Promise<void> =>
  apiClient.delete(`/api/class-groups/${id}`).then(() => undefined);

export const assignTeacher = ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}): Promise<void> =>
  apiClient.post(`/api/class-groups/${id}/teachers/${userId}`).then(() => undefined);

export const revokeTeacher = ({
  id,
  userId,
}: {
  id: number;
  userId: number;
}): Promise<void> =>
  apiClient.delete(`/api/class-groups/${id}/teachers/${userId}`).then(() => undefined);
