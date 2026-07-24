import apiClient from '../../../api/client';
import type { ModuleDto, CreateModuleRequest, UpdateModuleRequest } from '../types';

export const getModules = (courseId: number): Promise<ModuleDto[]> =>
  apiClient
    .get<ModuleDto[]>(`/api/courses/${courseId}/modules`)
    .then((r) => r.data);

export const createModule = (
  courseId: number,
  data: CreateModuleRequest,
): Promise<ModuleDto> =>
  apiClient
    .post<ModuleDto>(`/api/courses/${courseId}/modules`, data)
    .then((r) => r.data);

export const updateModule = (
  moduleId: number,
  data: UpdateModuleRequest,
): Promise<ModuleDto> =>
  apiClient
    .patch<ModuleDto>(`/api/modules/${moduleId}`, data)
    .then((r) => r.data);

export const deleteModule = (moduleId: number): Promise<void> =>
  apiClient.delete(`/api/modules/${moduleId}`).then(() => undefined);
