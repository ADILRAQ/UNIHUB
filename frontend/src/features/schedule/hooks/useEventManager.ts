import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { createEvent, deleteEvent, listEvents, updateEvent } from '../services/eventService';
import { SCHEDULE_KEY } from './useSchedule';
import { toApiTime, toISODate, today } from '../calendar';
import type { Course, EventItem, EventType } from '../types';

/** Broad window over which the management list shows events (the whole current year). */
const eventWindow = (): { from: string; to: string } => {
  const year = today().getFullYear();
  return { from: `${year}-01-01`, to: `${year}-12-31` };
};

interface EventFormState {
  id: number | null;
  title: string;
  type: EventType;
  eventDate: string;
  startTime: string;
  endTime: string;
  courseId: string;
  description: string;
}

const defaultForm = (): EventFormState => ({
  id: null,
  title: '',
  type: 'EXAM',
  eventDate: toISODate(today()),
  startTime: '',
  endTime: '',
  courseId: '',
  description: '',
});

export const EVENTS_KEY = ['schedule', 'events'] as const;

export interface UseEventManager {
  events: EventItem[];
  isLoading: boolean;
  isError: boolean;
  /** Whether the caller is an admin (may create department-wide, course-less events). */
  isAdmin: boolean;
  formOpen: boolean;
  isEditing: boolean;
  form: EventFormState;
  onOpenCreate: () => void;
  onOpenEdit: (event: EventItem) => void;
  onCloseForm: () => void;
  onFormChange: (patch: Partial<EventFormState>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (event: EventItem) => void;
  isSaving: boolean;
  error: string | null;
}

/**
 * Logic for creating/editing one-off events (exams, deadlines, events). A teacher
 * must attach an event to one of their own courses; an admin may leave the course
 * empty for a department-wide event. Every mutation refreshes both the event list
 * and the shared schedule feed so the calendar updates. `manageableCourses` are
 * the courses the caller can attach an event to (their own / all, from the course
 * panel), passed in to avoid a second courses fetch.
 */
const useEventManager = (isAdmin: boolean, manageableCourses: Course[]): UseEventManager => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<EventFormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  const range = eventWindow();

  const {
    data: events,
    isLoading,
    isError,
  } = useGetData<EventItem[], string, EventItem[]>({
    queryKey: [...EVENTS_KEY, range.from, range.to],
    queryFn: () => listEvents(range),
    transformFn: (items) => items,
  });

  const afterChange = () => {
    void queryClient.invalidateQueries({ queryKey: [...EVENTS_KEY] });
    void queryClient.invalidateQueries({ queryKey: [...SCHEDULE_KEY] });
  };

  const onSaved = () => {
    afterChange();
    setFormOpen(false);
    setForm(defaultForm());
  };

  const createMutation = usePostData<string, Parameters<typeof createEvent>[0], EventItem>({
    keys: ['schedule', 'event', 'create'],
    serviceFn: createEvent,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not save the event.')),
  });
  const updateMutation = usePostData<string, Parameters<typeof updateEvent>[0], EventItem>({
    keys: ['schedule', 'event', 'update'],
    serviceFn: updateEvent,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not save the event.')),
  });
  const deleteMutation = usePostData<string, number, void>({
    keys: ['schedule', 'event', 'delete'],
    serviceFn: deleteEvent,
    onSuccessFn: afterChange,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not delete the event.')),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!form.title.trim()) {
      setError('A title is required.');
      return;
    }
    if (!isAdmin && !form.courseId) {
      setError('Pick one of your courses for this event.');
      return;
    }
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      setError('End time must be after the start time.');
      return;
    }
    const start = form.startTime ? toApiTime(form.startTime) : undefined;
    const end = form.endTime ? toApiTime(form.endTime) : undefined;
    if (form.id === null) {
      createMutation.mutate({
        title: form.title.trim(),
        type: form.type,
        eventDate: form.eventDate,
        startTime: start,
        endTime: end,
        courseId: form.courseId ? Number(form.courseId) : undefined,
        description: form.description.trim() || undefined,
      });
    } else {
      // Course/group are fixed at creation server-side, so only the editable fields go up.
      updateMutation.mutate({
        id: form.id,
        title: form.title.trim(),
        type: form.type,
        eventDate: form.eventDate,
        startTime: start,
        endTime: end,
        description: form.description.trim() || undefined,
      });
    }
  };

  return {
    events: events ?? [],
    isLoading,
    isError,
    isAdmin,
    formOpen,
    isEditing: form.id !== null,
    form,
    onOpenCreate: () => {
      setError(null);
      setForm({ ...defaultForm(), courseId: manageableCourses[0] ? String(manageableCourses[0].id) : '' });
      setFormOpen(true);
    },
    onOpenEdit: (event) => {
      setError(null);
      setForm({
        id: event.id,
        title: event.title,
        type: event.type,
        eventDate: event.eventDate,
        startTime: event.startTime ? event.startTime.slice(0, 5) : '',
        endTime: event.endTime ? event.endTime.slice(0, 5) : '',
        courseId: event.courseId ? String(event.courseId) : '',
        description: event.description ?? '',
      });
      setFormOpen(true);
    },
    onCloseForm: () => setFormOpen(false),
    onFormChange: (patch) => setForm((current) => ({ ...current, ...patch })),
    onSubmit,
    onDelete: (event) => {
      if (window.confirm(`Delete event "${event.title}"?`)) {
        deleteMutation.mutate(event.id);
      }
    },
    isSaving: createMutation.isPending || updateMutation.isPending,
    error,
  };
};

export default useEventManager;
