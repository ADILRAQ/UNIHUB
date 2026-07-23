import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import {
  assignTeacher,
  createClassGroup,
  deleteClassGroup,
  renameClassGroup,
  revokeTeacher,
} from '../services/classGroupService';
import useClassGroupsData, { CLASS_GROUPS_KEY } from './useClassGroupsData';
import type { ClassGroupDto, ClassGroupNameRequest } from '../types';

export interface UseClassGroupsSection {
  classGroups: ClassGroupDto[];
  isLoading: boolean;
  isError: boolean;
  actionError: string | null;
  newName: string;
  createPending: boolean;
  editingId: number | null;
  editingName: string;
  /** Per-group teacher-id input value, keyed by group id. */
  teacherInputs: Record<number, string>;
  busyGroupId: number | null;
  onNewNameChange: (value: string) => void;
  onCreate: (event: FormEvent<HTMLFormElement>) => void;
  onStartRename: (group: ClassGroupDto) => void;
  onEditingNameChange: (value: string) => void;
  onSubmitRename: (event: FormEvent<HTMLFormElement>) => void;
  onCancelRename: () => void;
  onDelete: (group: ClassGroupDto) => void;
  onTeacherInputChange: (groupId: number, value: string) => void;
  onAssignTeacher: (groupId: number) => void;
  onRevokeTeacher: (groupId: number) => void;
}

/**
 * Logic for the class-groups section: list via the shared `useClassGroupsData`
 * read hook, plus create / rename / delete / assign-teacher / revoke-teacher
 * mutations via the generic `usePostData`. Every mutation invalidates the shared
 * class-groups query; backend messages (e.g. the 409 "has members" on delete)
 * are surfaced verbatim.
 */
const useClassGroupsSection = (): UseClassGroupsSection => {
  const queryClient = useQueryClient();
  const { classGroups, isLoading, isError } = useClassGroupsData();

  const [actionError, setActionError] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState('');
  const [teacherInputs, setTeacherInputs] = useState<Record<number, string>>({});

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: [...CLASS_GROUPS_KEY] });

  const onError = (fallback: string) => (error: unknown) =>
    setActionError(apiErrorMessage(error, fallback));

  const createMutation = usePostData<string, ClassGroupNameRequest, ClassGroupDto>({
    keys: ['admin', 'class-groups', 'create'],
    serviceFn: createClassGroup,
    onSuccessFn: () => {
      setNewName('');
      void invalidate();
    },
    onErrorFn: onError('Could not create the class group.'),
  });

  const renameMutation = usePostData<
    string,
    { id: number } & ClassGroupNameRequest,
    ClassGroupDto
  >({
    keys: ['admin', 'class-groups', 'rename'],
    serviceFn: renameClassGroup,
    onSuccessFn: () => {
      setEditingId(null);
      setEditingName('');
      void invalidate();
    },
    onErrorFn: onError('Could not rename the class group.'),
  });

  const deleteMutation = usePostData<string, number, void>({
    keys: ['admin', 'class-groups', 'delete'],
    serviceFn: deleteClassGroup,
    onSuccessFn: () => {
      void invalidate();
    },
    onErrorFn: onError('Could not delete the class group.'),
  });

  const assignMutation = usePostData<string, { id: number; userId: number }, void>({
    keys: ['admin', 'class-groups', 'assign-teacher'],
    serviceFn: assignTeacher,
    onSuccessFn: () => {
      void invalidate();
    },
    onErrorFn: onError('Could not assign the teacher.'),
  });

  const revokeMutation = usePostData<string, { id: number; userId: number }, void>({
    keys: ['admin', 'class-groups', 'revoke-teacher'],
    serviceFn: revokeTeacher,
    onSuccessFn: () => {
      void invalidate();
    },
    onErrorFn: onError('Could not revoke the teacher.'),
  });

  const busyGroupId =
    (renameMutation.isPending ? renameMutation.variables?.id : undefined) ??
    (deleteMutation.isPending ? deleteMutation.variables : undefined) ??
    (assignMutation.isPending ? assignMutation.variables?.id : undefined) ??
    (revokeMutation.isPending ? revokeMutation.variables?.id : undefined) ??
    null;

  const parseTeacherId = (groupId: number): number | null => {
    const raw = teacherInputs[groupId]?.trim();
    const parsed = raw ? Number(raw) : NaN;
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  };

  return {
    classGroups,
    isLoading,
    isError,
    actionError,
    newName,
    createPending: createMutation.isPending,
    editingId,
    editingName,
    teacherInputs,
    busyGroupId,
    onNewNameChange: setNewName,
    onCreate: (event) => {
      event.preventDefault();
      setActionError(null);
      const name = newName.trim();
      if (!name) {
        setActionError('Enter a class group name.');
        return;
      }
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
      if (editingId === null || !name) {
        setActionError('Enter a class group name.');
        return;
      }
      renameMutation.mutate({ id: editingId, name });
    },
    onCancelRename: () => {
      setEditingId(null);
      setEditingName('');
    },
    onDelete: (group) => {
      setActionError(null);
      deleteMutation.mutate(group.id);
    },
    onTeacherInputChange: (groupId, value) =>
      setTeacherInputs((current) => ({ ...current, [groupId]: value })),
    onAssignTeacher: (groupId) => {
      setActionError(null);
      const userId = parseTeacherId(groupId);
      if (userId === null) {
        setActionError('Enter a valid teacher user id.');
        return;
      }
      assignMutation.mutate({ id: groupId, userId });
    },
    onRevokeTeacher: (groupId) => {
      setActionError(null);
      const userId = parseTeacherId(groupId);
      if (userId === null) {
        setActionError('Enter a valid teacher user id.');
        return;
      }
      revokeMutation.mutate({ id: groupId, userId });
    },
  };
};

export default useClassGroupsSection;
