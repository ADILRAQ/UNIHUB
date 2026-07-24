import apiClient from '../../../api/client';
import type {
  AssignmentDto,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  SubmissionDto,
  SubmissionStatusDto,
} from '../types';

export const getAssignments = (courseId: number): Promise<AssignmentDto[]> =>
  apiClient
    .get<AssignmentDto[]>(`/api/courses/${courseId}/assignments`)
    .then((r) => r.data);

export const createAssignment = (
  courseId: number,
  data: CreateAssignmentRequest,
): Promise<AssignmentDto> =>
  apiClient
    .post<AssignmentDto>(`/api/courses/${courseId}/assignments`, data)
    .then((r) => r.data);

export const updateAssignment = (
  id: number,
  data: UpdateAssignmentRequest,
): Promise<AssignmentDto> =>
  apiClient.patch<AssignmentDto>(`/api/assignments/${id}`, data).then((r) => r.data);

export const deleteAssignment = (id: number): Promise<void> =>
  apiClient.delete(`/api/assignments/${id}`).then(() => undefined);

export const submitAssignment = (
  assignmentId: number,
  file: File,
): Promise<SubmissionDto> => {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post<SubmissionDto>(`/api/assignments/${assignmentId}/submit`, form)
    .then((r) => r.data);
};

export const getMySubmission = (
  assignmentId: number,
): Promise<SubmissionDto | null> =>
  apiClient
    .get<SubmissionDto | null>(`/api/assignments/${assignmentId}/my-submission`)
    .then((r) => r.data);

export const getSubmissions = (
  assignmentId: number,
): Promise<SubmissionStatusDto[]> =>
  apiClient
    .get<SubmissionStatusDto[]>(`/api/assignments/${assignmentId}/submissions`)
    .then((r) => r.data);

export const downloadSubmission = async (
  submissionId: number,
  filename: string,
): Promise<void> => {
  const response = await apiClient.get(`/api/submissions/${submissionId}/download`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
};
