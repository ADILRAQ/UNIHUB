import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { listUsers } from '../services/userService';
import {
  assignTeacher,
  createClassGroup,
  deleteClassGroup,
  renameClassGroup,
  revokeTeacher,
} from '../services/classGroupService';
import useClassGroupsData, { CLASS_GROUPS_KEY } from '../../../hooks/useClassGroupsData';
import type { ClassGroupDto, ClassGroupNameRequest, UserSummaryDto } from '../types';

export interface UseClassGroupsSection {
  classGroups: ClassGroupDto[];
  isLoading: boolean;
  isError: boolean;
  actionError: string | null;
  newName: string;
  createPending: boolean;
  editingId: number | null;
  editingName: string;
  /** All TEACHER-role accounts, for the assign dropdown. */
  teachers: UserSummaryDto[];
  /** Per-group selected teacher id for the assign dropdown, keyed by group id. */
  selectedTeacherIds: Record<number, number | ''>;
  busyGroupId: number | null;
  onNewNameChange: (value: string) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onStartRename: (group: ClassGroupDto) => void;
  onEditingNameChange: (value: string) => void;
  onSubmitRename: (event: FormEvent<HTMLFormElement>) => void;
  onCancelRename: () => void;
  onDelete: (group: ClassGroupDto) => void;
  onSelectedTeacherChange: (groupId: number, teacherId: number | '') => void;
  onAssignTeacher: (groupId: number) => void;
  onRevokeTeacher: (group: ClassGroupDto) => void;
}

const useClassGroupsSection = (): UseClassGroupsSection => {
  const queryClient = useQueryClient();
  const { classGroups, isLoading, isError } = useClassGroupsData();

  const [actionError, setActionError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<Record<number, number | ''>>({});

  // Fetch all teachers for the assign dropdown.
  const { data: teacherPage } = useGetData<
    { content: UserSummaryDto[] },
    string,
    UserSummaryDto[]
  >({
    queryKey: ['admin', 'users', 'teachers'],
    queryFn: () => listUsers({ role: 'TEACHER', status: '', classGroupId: null, search: '', page: 0, size: 200 }),
    transformFn: (page) => page.content,
  });
  const teachers = teacherPage ?? [];

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [...CLASS_GROUPS_KEY] });

  const onError = (fallback: string) => (error: unknown) =>
    setActionError(apiErrorMessage(error, fallback));

  const createMutation = usePostData<string, ClassGroupNameRequest, ClassGroupDto>({
    keys: ['admin', 'class-groups', 'create'],
    serviceFn: createClassGroup,
    onSuccessFn: () => { setNewName(''); void invalidate(); },
    onErrorFn: onError('Could not create the class group.'),
  });

  const renameMutation = usePostData<string, { id: number } & ClassGroupNameRequest, ClassGroupDto>({
    keys: ['admin', 'class-groups', 'rename'],
    serviceFn: renameClassGroup,
    onSuccessFn: () => { setEditingId(null); setEditingName(''); void invalidate(); },
    onErrorFn: onError('Could not rename the class group.'),
  });

  const deleteMutation = usePostData<string, number, void>({
    keys: ['admin', 'class-groups', 'delete'],
    serviceFn: deleteClassGroup,
    onSuccessFn: () => { void invalidate(); },
    onErrorFn: onError('Could not delete the class group.'),
  });

  const assignMutation = usePostData<string, { id: number; userId: number }, void>({
    keys: ['admin', 'class-groups', 'assign-teacher'],
    serviceFn: assignTeacher,
    onSuccessFn: () => { void invalidate(); },
    onErrorFn: onError('Could not assign the teacher.'),
  });

  const revokeMutation = usePostData<string, { id: number; userId: number }, void>({
    keys: ['admin', 'class-groups', 'revoke-teacher'],
    serviceFn: revokeTeacher,
    onSuccessFn: () => { void invalidate(); },
    onErrorFn: onError('Could not revoke the teacher.'),
  });

  const busyGroupId =
    (renameMutation.isPending ? renameMutation.variables?.id : undefined) ??
    (deleteMutation.isPending ? deleteMutation.variables : undefined) ??
    (assignMutation.isPending ? assignMutation.variables?.id : undefined) ??
    (revokeMutation.isPending ? revokeMutation.variables?.id : undefined) ??
    null;

  return {
    classGroups,
    isLoading,
    isError,
    actionError,
    newName,
    createPending: createMutation.isPending,
    editingId,
    editingName,
    teachers,
    selectedTeacherIds,
    busyGroupId,
    onNewNameChange: setNewName,
    onCreate: (event) => {
      event.preventDefault();
      setActionError(null);
      const name = newName.trim();
      if (!name) { setActionError('Enter a class group name.'); return; }
      createMutation.mutate({ name });
    },
    onStartRename: (group) => {
      setActionError(null);
      setEditingId(group.id);
      setEditingName(group.name);
    },
    onEditingNameChange: setEditingName,
    onSubmitRename: (event) => {
      event.preventDefault();
      setActionError(null);
      const name = editingName.trim();
      if (editingId === null || !name) { setActionError('Enter a class group name.'); return; }
      renameMutation.mutate({ id: editingId, name });
    },
    onCancelRename: () => { setEditingId(null); setEditingName(''); },
    onDelete: (group) => { setActionError(null); deleteMutation.mutate(group.id); },
    onSelectedTeacherChange: (groupId, teacherId) =>
      setSelectedTeacherIds((prev) => ({ ...prev, [groupId]: teacherId })),
    onAssignTeacher: (groupId) => {
      setActionError(null);
      const userId = selectedTeacherIds[groupId];
      if (!userId) { setActionError('Select a teacher first.'); return; }
      assignMutation.mutate({ id: groupId, userId: Number(userId) });
    },
    onRevokeTeacher: (group) => {
      setActionError(null);
      if (!group.teacherId) return;
      revokeMutation.mutate({ id: group.id, userId: group.teacherId });
    },
  };
};

export default useClassGroupsSection;
