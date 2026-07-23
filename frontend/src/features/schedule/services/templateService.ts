import apiClient from '../../../api/client';
import type { CreateTemplateRequest, ScheduleTemplate, UpdateTemplateRequest } from '../types';

/**
 * Service functions for the weekly-template endpoints (admin or owning teacher,
 * enforced server-side). Creating a template generates its sessions; updating one
 * regenerates future auto sessions. All HTTP through the shared typed `apiClient`.
 */

export const listTemplates = (courseId: number): Promise<ScheduleTemplate[]> =>
  apiClient
    .get<ScheduleTemplate[]>(`/api/courses/${courseId}/templates`)
    .then((response) => response.data);

export const createTemplate = ({
  courseId,
  ...body
}: { courseId: number } & CreateTemplateRequest): Promise<ScheduleTemplate> =>
  apiClient
    .post<ScheduleTemplate>(`/api/courses/${courseId}/templates`, body)
    .then((response) => response.data);

export const updateTemplate = ({
  id,
  ...body
}: { id: number } & UpdateTemplateRequest): Promise<ScheduleTemplate> =>
  apiClient
    .patch<ScheduleTemplate>(`/api/templates/${id}`, body)
    .then((response) => response.data);

export const deleteTemplate = (id: number): Promise<void> =>
  apiClient.delete(`/api/templates/${id}`).then(() => undefined);
