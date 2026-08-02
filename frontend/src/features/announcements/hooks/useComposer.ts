/**
 * Logic hook for the announcement composer (create + edit).
 * All state, handlers, and mutations live here; the UI components are thin.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { useToast } from '../../../components/ui/Toast';
import * as announcementService from '../services/announcementService';
import { getPostableGroups } from '../services/classGroupService';
import type { AnnouncementDto, ClassGroupOption, CreateAnnouncementRequest } from '../types';

export interface UseComposerOptions {
  initialAnnouncement?: AnnouncementDto;
}

export interface UseComposerReturn {
  /** Form state */
  title: string;
  classGroupId: number | null;
  pinned: boolean;
  urgent: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  /** Whether we are editing an existing announcement */
  isEditing: boolean;
  /** Groups the current user may target */
  availableGroups: ClassGroupOption[];
  isLoadingGroups: boolean;
  /** Handlers */
  onTitleChange: (title: string) => void;
  onGroupChange: (id: number | null) => void;
  onPinnedChange: (pinned: boolean) => void;
  onUrgentChange: (urgent: boolean) => void;
  /** bodyHtml is passed in by the RichTextEditor at submit time */
  onSubmit: (bodyHtml: string) => void;
  onDelete: () => void;
}

const useComposer = ({ initialAnnouncement }: UseComposerOptions): UseComposerReturn => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();

  const isEditing = !!initialAnnouncement;

  const [title, setTitle] = useState(initialAnnouncement?.title ?? '');
  const [classGroupId, setClassGroupId] = useState<number | null>(
    initialAnnouncement?.classGroupId ?? null,
  );
  const [pinned, setPinned] = useState(initialAnnouncement?.pinned ?? false);
  const [urgent, setUrgent] = useState(initialAnnouncement?.urgent ?? false);
  const [error, setError] = useState<string | null>(null);

  const role = user?.role ?? '';

  // Load postable groups so the composer can render a target selector.
  const { data: availableGroups, isLoading: isLoadingGroups } = useGetData<
    ClassGroupOption[],
    string,
    ClassGroupOption[]
  >({
    queryKey: ['classGroups', 'postable', role],
    queryFn: () => getPostableGroups(role),
    transformFn: (d) => d,
    enabled: !!role && role !== 'STUDENT',
  });

  const { mutate: create, isPending: isCreating } = usePostData<
    string,
    CreateAnnouncementRequest,
    AnnouncementDto
  >({
    keys: ['announcements', 'create'],
    serviceFn: (data) => announcementService.createAnnouncement(data),
    onSuccessFn: () => {
      toast.success('Announcement published!');
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
      navigate('/announcements');
    },
    onErrorFn: (err) => {
      // err is typed `any` by usePostData — safe to access .response.data.message
      const msg: string = (err?.response?.data?.message as string | undefined) ?? 'Failed to publish announcement.';
      setError(msg);
      toast.error(msg);
    },
  });

  const { mutate: update, isPending: isUpdating } = usePostData<
    string,
    { id: number; title: string; body: string },
    AnnouncementDto
  >({
    keys: ['announcements', 'update'],
    serviceFn: ({ id, title: t, body }) =>
      announcementService.updateAnnouncement(id, { title: t, body }),
    onSuccessFn: () => {
      toast.success('Announcement saved!');
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
      navigate('/announcements');
    },
    onErrorFn: (err) => {
      const msg: string = (err?.response?.data?.message as string | undefined) ?? 'Failed to save changes.';
      setError(msg);
      toast.error(msg);
    },
  });

  const { mutate: destroy, isPending: isDeleting } = usePostData<
    string,
    number,
    void
  >({
    keys: ['announcements', 'delete'],
    serviceFn: (id) => announcementService.deleteAnnouncement(id),
    onSuccessFn: () => {
      toast.success('Announcement deleted.');
      void queryClient.invalidateQueries({ queryKey: ['announcements'] });
      navigate('/announcements');
    },
    onErrorFn: (err) => {
      const msg: string = (err?.response?.data?.message as string | undefined) ?? 'Failed to delete announcement.';
      setError(msg);
      toast.error(msg);
    },
  });

  const onSubmit = (bodyHtml: string) => {
    setError(null);
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (role === 'TEACHER' && classGroupId === null) {
      setError('Please select a target class group.');
      return;
    }

    if (isEditing && initialAnnouncement) {
      update({ id: initialAnnouncement.id, title, body: bodyHtml });
    } else {
      create({ title, body: bodyHtml, classGroupId, pinned, urgent });
    }
  };

  const onDelete = () => {
    if (!initialAnnouncement) return;
    if (!window.confirm('Delete this announcement? This cannot be undone.')) return;
    destroy(initialAnnouncement.id);
  };

  return {
    title,
    classGroupId,
    pinned,
    urgent,
    isSaving: isCreating || isUpdating,
    isDeleting,
    error,
    isEditing,
    availableGroups: availableGroups ?? [],
    isLoadingGroups,
    onTitleChange: setTitle,
    onGroupChange: setClassGroupId,
    onPinnedChange: setPinned,
    onUrgentChange: setUrgent,
    onSubmit,
    onDelete,
  };
};

export default useComposer;
