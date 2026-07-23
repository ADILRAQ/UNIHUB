import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { listUsers, resetUserPassword, updateUserStatus } from '../services/userService';
import useClassGroupsData from './useClassGroupsData';
import type {
  ClassGroupDto,
  PagedResponse,
  ResetPasswordResponse,
  UpdateStatusRequest,
  UserListFilters,
  UserSummaryDto,
  UserStatus,
} from '../types';
import type { Role } from '../../auth/types';

const PAGE_SIZE = 10;
const USERS_LIST_KEY = ['admin', 'users', 'list'] as const;

const EMPTY_FILTERS: UserListFilters = {
  role: '',
  status: '',
  classGroupId: null,
  search: '',
};

export interface UseUsersSection {
  filters: UserListFilters;
  searchInput: string;
  classGroups: ClassGroupDto[];
  page: number;
  data: PagedResponse<UserSummaryDto> | undefined;
  isLoading: boolean;
  isError: boolean;
  actionError: string | null;
  /** Id of the row whose action is currently in flight, for per-row disabling. */
  busyUserId: number | null;
  /** One-time credentials from a password reset, shown until dismissed. */
  resetResult: ResetPasswordResponse | null;
  onRoleFilterChange: (value: Role | '') => void;
  onStatusFilterChange: (value: UserStatus | '') => void;
  onClassGroupFilterChange: (value: number | null) => void;
  onSearchInputChange: (value: string) => void;
  onSearchSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onClearFilters: () => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  onToggleStatus: (user: UserSummaryDto) => void;
  onResetPassword: (user: UserSummaryDto) => void;
  onDismissReset: () => void;
}

/**
 * Logic for the Users section: the paginated + filtered list via `useGetData`
 * (page & filters live in the query key so the cache keys per view), plus the
 * deactivate/reactivate and reset-password row mutations via `usePostData`, each
 * invalidating the list on success. No `useQuery`/`useMutation` used directly.
 */
const useUsersSection = (): UseUsersSection => {
  const queryClient = useQueryClient();
  const { classGroups } = useClassGroupsData();

  const [filters, setFilters] = useState<UserListFilters>(EMPTY_FILTERS);
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [resetResult, setResetResult] = useState<ResetPasswordResponse | null>(null);

  const { data, isLoading, isError } = useGetData<
    PagedResponse<UserSummaryDto>,
    string | number | null,
    PagedResponse<UserSummaryDto>
  >({
    queryKey: [
      ...USERS_LIST_KEY,
      filters.role,
      filters.status,
      filters.classGroupId,
      filters.search,
      page,
    ],
    queryFn: () => listUsers({ ...filters, page, size: PAGE_SIZE }),
    transformFn: (paged) => paged,
  });

  const invalidateList = () =>
    queryClient.invalidateQueries({ queryKey: [...USERS_LIST_KEY] });

  const statusMutation = usePostData<
    string,
    { id: number } & UpdateStatusRequest,
    UserSummaryDto
  >({
    keys: ['admin', 'users', 'status'],
    serviceFn: updateUserStatus,
    onSuccessFn: () => {
      void invalidateList();
    },
    onErrorFn: (error) =>
      setActionError(apiErrorMessage(error, 'Could not update the user status.')),
  });

  const resetMutation = usePostData<string, number, ResetPasswordResponse>({
    keys: ['admin', 'users', 'reset-password'],
    serviceFn: resetUserPassword,
    onSuccessFn: (result) => setResetResult(result),
    onErrorFn: (error) =>
      setActionError(apiErrorMessage(error, 'Could not reset the password.')),
  });

  const busyUserId =
    (statusMutation.isPending ? statusMutation.variables?.id : undefined) ??
    (resetMutation.isPending ? resetMutation.variables : undefined) ??
    null;

  // Applying any filter returns to the first page so the view stays coherent.
  const applyFilter = (patch: Partial<UserListFilters>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setPage(0);
  };

  return {
    filters,
    searchInput,
    classGroups,
    page,
    data,
    isLoading,
    isError,
    actionError,
    busyUserId,
    resetResult,
    onRoleFilterChange: (role) => applyFilter({ role }),
    onStatusFilterChange: (status) => applyFilter({ status }),
    onClassGroupFilterChange: (classGroupId) => applyFilter({ classGroupId }),
    onSearchInputChange: setSearchInput,
    onSearchSubmit: (event) => {
      event.preventDefault();
      applyFilter({ search: searchInput.trim() });
    },
    onClearFilters: () => {
      setSearchInput('');
      setFilters(EMPTY_FILTERS);
      setPage(0);
    },
    onPrevPage: () => setPage((current) => Math.max(0, current - 1)),
    onNextPage: () =>
      setPage((current) =>
        data && current + 1 < data.totalPages ? current + 1 : current,
      ),
    onToggleStatus: (user) => {
      setActionError(null);
      const next: UserStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      statusMutation.mutate({ id: user.id, status: next });
    },
    onResetPassword: (user) => {
      setActionError(null);
      setResetResult(null);
      resetMutation.mutate(user.id);
    },
    onDismissReset: () => setResetResult(null),
  };
};

export default useUsersSection;
