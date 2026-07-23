import apiClient from '../../../api/client';
import type { Course, CreateCourseRequest, UpdateCourseRequest } from '../types';

/**
 * Service functions for the course endpoints. Reads are scoped per-role by the
 * backend (admin=all, teacher=own, student=their groups'); the create/update/
 * delete mutations are ADMIN-only server-side. All HTTP goes through the shared
 * typed `apiClient`; feature logic hooks compose these via the generic wrappers.
 */

export const listCourses = (): Promise<Course[]> =>
  apiClient.get<Course[]>('/api/courses').then((response) => response.data);

export const getCourse = (id: number): Promise<Course> =>
  apiClient.get<Course>(`/api/courses/${id}`).then((response) => response.data);

export const createCourse = (body: CreateCourseRequest): Promise<Course> =>
  apiClient.post<Course>('/api/courses', body).then((response) => response.data);

export const updateCourse = ({
  id,
  ...body
}: { id: number } & UpdateCourseRequest): Promise<Course> =>
  apiClient.patch<Course>(`/api/courses/${id}`, body).then((response) => response.data);

export const deleteCourse = (id: number): Promise<void> =>
  apiClient.delete(`/api/courses/${id}`).then(() => undefined);
