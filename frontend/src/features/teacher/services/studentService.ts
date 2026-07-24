import apiClient from '../../../api/client';
import type { CreateUserRequest, CreatedUserDto, PagedResponse, UserSummaryDto } from '../../admin/types';

/**
 * Lists students visible to the authenticated teacher (i.e. students in the
 * teacher's own class groups). The backend scopes `GET /api/users?role=STUDENT`
 * to the caller's groups when the caller is a TEACHER.
 */
export const listStudents = (): Promise<PagedResponse<UserSummaryDto>> =>
  apiClient
    .get<PagedResponse<UserSummaryDto>>('/api/users', {
      params: { role: 'STUDENT', size: 100, page: 0 },
    })
    .then((r) => r.data);

/**
 * Creates a new student account. Teachers may only create STUDENT accounts
 * in their own class groups (enforced server-side).
 */
export const createStudent = (body: CreateUserRequest): Promise<CreatedUserDto> =>
  apiClient.post<CreatedUserDto>('/api/users', body).then((r) => r.data);
