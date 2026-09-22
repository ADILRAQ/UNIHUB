/** Admin-feature-local types. Cross-cutting shapes stay in `api/types.ts`. */

import type { Role } from '../../auth/types';
export type { PagedResponse } from '../../../api/types';

/** A user account's activation state. */
export type UserStatus = 'ACTIVE' | 'INACTIVE';

/** Roles an admin may create through the console (ADMIN is not creatable here). */
export type CreatableRole = 'STUDENT' | 'TEACHER';

/**
 * A freshly created account as returned by create / import / reset endpoints.
 * `temporaryPassword` is only ever returned once and is never retrievable again.
 */
export interface CreatedUserDto {
  email: string;
  fullName: string;
  role: Role;
  classGroup: string | null;
  temporaryPassword: string;
}

/** Request body for `POST /api/users` (single-user create). */
export interface CreateUserRequest {
  fullName: string;
  email: string;
  role: CreatableRole;
  classGroupId: number | null;
}

/** One failed row from a CSV import. */
export interface ImportError {
  line: number;
  email: string;
  reason: string;
}

/** Response for `POST /api/users/import` (CSV bulk import). */
export interface ImportResultResponse {
  successCount: number;
  errorCount: number;
  createdUsers: CreatedUserDto[];
  errors: ImportError[];
}

/** A row in the paginated users list (`GET /api/users`). */
export interface UserSummaryDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
}

/** A minimal class-group reference embedded in a user detail. */
export interface ClassGroupRef {
  id: number;
  name: string;
}

/** Full user record (`GET /api/users/{id}`). */
export interface UserDetailDto {
  id: number;
  email: string;
  fullName: string;
  role: Role;
  status: UserStatus;
  mustChangePassword: boolean;
  tempPasswordExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  classGroups: ClassGroupRef[];
}

/** Filters + paging for `GET /api/users`. Empty strings mean "no filter". */
export interface UserListFilters {
  role: Role | '';
  status: UserStatus | '';
  classGroupId: number | null;
  search: string;
}

/** Request body for `PATCH /api/users/{id}/status`. */
export interface UpdateStatusRequest {
  status: UserStatus;
}

/** Response for `PATCH /api/users/{id}/reset-password`. */
export interface ResetPasswordResponse {
  email: string;
  temporaryPassword: string;
}

/** Moved to the shared API types (used by several features); re-exported for admin code. */
export type { ClassGroupDto } from '../../../api/types';

/** Request body for create / rename class-group endpoints. */
export interface ClassGroupNameRequest {
  name: string;
}
