import apiClient from '../../../api/client';
import type { ResourceDto, ResourceSearchResult } from '../types';

export const getResources = (moduleId: number): Promise<ResourceDto[]> =>
  apiClient
    .get<ResourceDto[]>(`/api/modules/${moduleId}/resources`)
    .then((r) => r.data);

export const uploadResource = (moduleId: number, file: File): Promise<ResourceDto> => {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post<ResourceDto>(`/api/modules/${moduleId}/resources`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteResource = (resourceId: number): Promise<void> =>
  apiClient.delete(`/api/resources/${resourceId}`).then(() => undefined);

export const searchResources = (q: string): Promise<ResourceSearchResult[]> =>
  apiClient
    .get<ResourceSearchResult[]>('/api/resources/search', { params: { q } })
    .then((r) => r.data);

export const addLinkResource = (
  courseId: number,
  moduleId: number,
  title: string,
  url: string,
): Promise<ResourceDto> =>
  apiClient
    .post<ResourceDto>(`/api/courses/${courseId}/modules/${moduleId}/resources/link`, {
      title,
      url,
    })
    .then((r) => r.data);
