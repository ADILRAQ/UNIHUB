import apiClient from '../../../api/client';
import type {
  CreateUserRequest,
  CreatedUserDto,
  ImportResultResponse,
  PagedResponse,
  ResetPasswordResponse,
  UpdateStatusRequest,
  UserDetailDto,
  UserListFilters,
  UserSummaryDto,
} from '../types';

/**
 * Service functions for the admin user endpoints. Each goes through the shared
 * typed `apiClient` (JWT attached automatically) and is consumed by the section
 * logic hooks via the generic `useGetData` / `usePostData` wrappers.
 */

export const createUser = (body: CreateUserRequest): Promise<CreatedUserDto> =>
  apiClient.post<CreatedUserDto>('/api/users', body).then((response) => response.data);

/**
 * CSV bulk import. The shared client defaults to a JSON content-type, which
 * would make axios serialize the `FormData` to JSON; setting `multipart/form-data`
 * here keeps the payload as `FormData`, and the browser then replaces the header
 * with the correct boundary at send time.
 */
export const importUsers = (file: File): Promise<ImportResultResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient
    .post<ImportResultResponse>('/api/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((response) => response.data);
};

export interface ListUsersParams extends UserListFilters {
  page: number;
  size: number;
}

export const listUsers = ({
  role,
  status,
  classGroupId,
  search,
  page,
  size,
}: ListUsersParams): Promise<PagedResponse<UserSummaryDto>> =>
  apiClient
    .get<PagedResponse<UserSummaryDto>>('/api/users', {
      params: {
        role: role || undefined,
        status: status || undefined,
        classGroupId: classGroupId ?? undefined,
        search: search.trim() || undefined,
        page,
        size,
      },
    })
    .then((response) => response.data);

export const getUser = (id: number): Promise<UserDetailDto> =>
  apiClient.get<UserDetailDto>(`/api/users/${id}`).then((response) => response.data);

export const updateUserStatus = ({
  id,
  status,
}: { id: number } & UpdateStatusRequest): Promise<UserSummaryDto> =>
  apiClient
    .patch<UserSummaryDto>(`/api/users/${id}/status`, { status })
    .then((response) => response.data);

export const resetUserPassword = (id: number): Promise<ResetPasswordResponse> =>
  apiClient
    .patch<ResetPasswordResponse>(`/api/users/${id}/reset-password`)
    .then((response) => response.data);
