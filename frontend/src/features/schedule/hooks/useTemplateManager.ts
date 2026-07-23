import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import {
  createTemplate,
  deleteTemplate,
  listTemplates,
  updateTemplate,
} from '../services/templateService';
import { SCHEDULE_KEY } from './useSchedule';
import { toApiTime, toISODate, today } from '../calendar';
import type { DayOfWeek, ScheduleTemplate } from '../types';

interface TemplateFormState {
  id: number | null;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  startDate: string;
  endDate: string;
  active: boolean;
}

const defaultForm = (): TemplateFormState => {
  const iso = toISODate(today());
  return {
    id: null,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:30',
    room: '',
    startDate: iso,
    endDate: iso,
    active: true,
  };
};

export interface UseTemplateManager {
  templates: ScheduleTemplate[];
  isLoading: boolean;
  isError: boolean;
  formOpen: boolean;
  isEditing: boolean;
  form: TemplateFormState;
  onOpenCreate: () => void;
  onOpenEdit: (template: ScheduleTemplate) => void;
  onCloseForm: () => void;
  onFormChange: (patch: Partial<TemplateFormState>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleActive: (template: ScheduleTemplate) => void;
  onDelete: (template: ScheduleTemplate) => void;
  isSaving: boolean;
  error: string | null;
}

/**
 * Logic for managing one course's weekly templates. Creating a template generates
 * its sessions and editing regenerates future ones, so every mutation invalidates
 * BOTH the template list for this course and the shared schedule feed
 * ({@link SCHEDULE_KEY}) — the calendar reflects the change immediately. Fetching
 * composes the generic hooks; enabled only once a course is selected.
 */
const useTemplateManager = (courseId: number | null): UseTemplateManager => {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(defaultForm);
  const [error, setError] = useState<string | null>(null);

  const listKey = ['schedule', 'templates', courseId] as const;

  const {
    data: templates,
    isLoading,
    isError,
  } = useGetData<ScheduleTemplate[], string | number | null, ScheduleTemplate[]>({
    queryKey: [...listKey],
    queryFn: () => listTemplates(courseId as number),
    transformFn: (items) => items,
    enabled: courseId !== null,
  });

  const afterChange = () => {
    void queryClient.invalidateQueries({ queryKey: [...listKey] });
    void queryClient.invalidateQueries({ queryKey: [...SCHEDULE_KEY] });
  };

  const onSaved = () => {
    afterChange();
    setFormOpen(false);
    setForm(defaultForm());
  };

  const createMutation = usePostData<string, Parameters<typeof createTemplate>[0], ScheduleTemplate>({
    keys: ['schedule', 'template', 'create'],
    serviceFn: createTemplate,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not save the template.')),
  });
  const updateMutation = usePostData<string, Parameters<typeof updateTemplate>[0], ScheduleTemplate>({
    keys: ['schedule', 'template', 'update'],
    serviceFn: updateTemplate,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not save the template.')),
  });
  const deleteMutation = usePostData<string, number, void>({
    keys: ['schedule', 'template', 'delete'],
    serviceFn: deleteTemplate,
    onSuccessFn: afterChange,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not delete the template.')),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (courseId === null) {
      return;
    }
    if (form.startTime >= form.endTime) {
      setError('End time must be after the start time.');
      return;
    }
    if (form.startDate > form.endDate) {
      setError('The active period end date must not be before its start date.');
      return;
    }
    const common = {
      dayOfWeek: form.dayOfWeek,
      startTime: toApiTime(form.startTime),
      endTime: toApiTime(form.endTime),
      room: form.room.trim() || undefined,
      startDate: form.startDate,
      endDate: form.endDate,
      active: form.active,
    };
    if (form.id === null) {
      createMutation.mutate({ courseId, ...common });
    } else {
      updateMutation.mutate({ id: form.id, ...common });
    }
  };

  return {
    templates: templates ?? [],
    isLoading,
    isError,
    formOpen,
    isEditing: form.id !== null,
    form,
    onOpenCreate: () => {
      setError(null);
      setForm(defaultForm());
      setFormOpen(true);
    },
    onOpenEdit: (template) => {
      setError(null);
      setForm({
        id: template.id,
        dayOfWeek: template.dayOfWeek,
        startTime: template.startTime.slice(0, 5),
        endTime: template.endTime.slice(0, 5),
        room: template.room ?? '',
        startDate: template.startDate,
        endDate: template.endDate,
        active: template.active,
      });
      setFormOpen(true);
    },
    onCloseForm: () => setFormOpen(false),
    onFormChange: (patch) => setForm((current) => ({ ...current, ...patch })),
    onSubmit,
    onToggleActive: (template) =>
      updateMutation.mutate({ id: template.id, active: !template.active }),
    onDelete: (template) => {
      if (window.confirm('Delete this weekly template? Its generated sessions become one-offs.')) {
        deleteMutation.mutate(template.id);
      }
    },
    isSaving: createMutation.isPending || updateMutation.isPending,
    error,
  };
};

export default useTemplateManager;
