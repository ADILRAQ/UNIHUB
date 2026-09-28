/**
 * Service functions for the recaps feature.
 * All HTTP through the shared typed `apiClient`; feature logic hooks compose
 * these via the generic `useGetData` / `usePostData` wrappers.
 */
import apiClient from '../../../api/client';
import type { SessionRecap, SessionSummary, RecapUpdatePayload, RecapResource, RecapAssignment } from '../types';

export const getSessionRecap = (sessionId: number): Promise<SessionRecap> =>
  apiClient
    .get<SessionRecap>(`/api/sessions/${sessionId}/recap`)
    .then((r) => r.data);

export const updateSessionRecap = (
  sessionId: number,
  payload: RecapUpdatePayload,
): Promise<SessionRecap> =>
  apiClient
    .put<SessionRecap>(`/api/sessions/${sessionId}/recap`, payload)
    .then((r) => r.data);

export const getCoursePastSessions = (courseId: number): Promise<SessionSummary[]> =>
  apiClient
    .get<SessionSummary[]>(`/api/courses/${courseId}/sessions`, { params: { past: true } })
    .then((r) => r.data);

/**
 * Loads all resources across all modules for a course, mapped to RecapResource
 * shape. Used to populate the resource picker in the teacher recap editor.
 * Chains GET /api/courses/{courseId}/modules then parallel
 * GET /api/modules/{moduleId}/resources calls.
 */
export const getCourseResourcesForRecap = async (
  courseId: number,
): Promise<RecapResource[]> => {
  const modules = await apiClient
    .get<Array<{ id: number; title: string }>>(`/api/courses/${courseId}/modules`)
    .then((r) => r.data);

  if (modules.length === 0) return [];

  const resourceArrays = await Promise.all(
    modules.map((m) =>
      apiClient
        .get<Array<{ id: number; name: string; contentType: string | null }>>(
          `/api/modules/${m.id}/resources`,
        )
        .then((r) => r.data),
    ),
  );

  return resourceArrays.flat().map((r) => ({
    id: r.id,
    name: r.name,
    contentType: r.contentType,
  }));
};

/**
 * Loads all assignments for a course, mapped to RecapAssignment shape.
 * Used to populate the assignment picker in the teacher recap editor.
 */
export const getCourseAssignmentsForRecap = (
  courseId: number,
): Promise<RecapAssignment[]> =>
  apiClient
    .get<Array<{ id: number; title: string; dueAt: string }>>(
      `/api/courses/${courseId}/assignments`,
    )
    .then((r) =>
      r.data.map((a) => ({ id: a.id, title: a.title, dueAt: a.dueAt })),
    );
