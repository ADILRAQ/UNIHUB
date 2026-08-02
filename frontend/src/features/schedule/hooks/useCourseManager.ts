import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../auth/AuthContext';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { createCourse, deleteCourse, listCourses, updateCourse } from '../services/courseService';
import { listClassGroups, listTeachers } from '../services/referenceService';
import type { ClassGroupOption, TeacherOption } from '../services/referenceService';
import type { Course } from '../types';

/** Query key for the course list, so mutations can invalidate it. */
export const COURSES_KEY = ['schedule', 'courses'] as const;

interface CourseFormState {
  id: number | null;
  name: string;
  teacherId: string;
  classGroupId: string;
  meetLink: string;
}

const EMPTY_FORM: CourseFormState = {
  id: null,
  name: '',
  teacherId: '',
  classGroupId: '',
  meetLink: '',
};

export interface UseCourseManager {
  courses: Course[];
  isLoading: boolean;
  isError: boolean;
  /** Only admins may create/edit/delete courses (server-enforced too). */
  canManage: boolean;
  selectedCourseId: number | null;
  selectedCourse: Course | null;
  onSelectCourse: (id: number) => void;
  /** Course create/edit modal. */
  formOpen: boolean;
  isEditing: boolean;
  form: CourseFormState;
  teachers: TeacherOption[];
  classGroups: ClassGroupOption[];
  onOpenCreate: () => void;
  onOpenEdit: (course: Course) => void;
  onCloseForm: () => void;
  onFormChange: (patch: Partial<CourseFormState>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: (course: Course) => void;
  isSaving: boolean;
  error: string | null;
}

/**
 * Logic for the course-management panel. Lists the caller's courses (scoped
 * server-side), owns the selected course, and — for admins — the create/edit/
 * delete flow with a modal form backed by teacher and class-group option reads.
 * All fetching composes the generic `useGetData`/`usePostData`; every mutation
 * invalidates the course list. No `useQuery`/business logic in the component.
 */
const useCourseManager = (): UseCourseManager => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const canManage = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<CourseFormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetData<Course[], string, Course[]>({
    queryKey: [...COURSES_KEY],
    queryFn: listCourses,
    transformFn: (items) => items,
  });

  // Only admins can assign a teacher/group, so these dropdown reads (ADMIN-only
  // endpoints) are gated on the create/edit form actually being open for an admin.
  const optionsEnabled = canManage && formOpen;
  const { data: teachers } = useGetData<TeacherOption[], string, TeacherOption[]>({
    queryKey: ['schedule', 'teacher-options'],
    queryFn: listTeachers,
    transformFn: (items) => items,
    enabled: optionsEnabled,
  });
  const { data: classGroups } = useGetData<ClassGroupOption[], string, ClassGroupOption[]>({
    queryKey: ['schedule', 'class-group-options'],
    queryFn: listClassGroups,
    transformFn: (items) => items,
    enabled: optionsEnabled,
  });

  const invalidateCourses = () =>
    queryClient.invalidateQueries({ queryKey: [...COURSES_KEY] });

  const onSaved = () => {
    void invalidateCourses();
    setFormOpen(false);
    setForm(EMPTY_FORM);
  };

  const createMutation = usePostData<string, Parameters<typeof createCourse>[0], Course>({
    keys: ['schedule', 'course', 'create'],
    serviceFn: createCourse,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not create the course.')),
  });
  const updateMutation = usePostData<string, Parameters<typeof updateCourse>[0], Course>({
    keys: ['schedule', 'course', 'update'],
    serviceFn: updateCourse,
    onSuccessFn: onSaved,
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not update the course.')),
  });
  const deleteMutation = usePostData<string, number, void>({
    keys: ['schedule', 'course', 'delete'],
    serviceFn: deleteCourse,
    onSuccessFn: () => {
      void invalidateCourses();
    },
    onErrorFn: (err) => setError(apiErrorMessage(err, 'Could not delete the course.')),
  });

  const selectedCourse = useMemo(
    () => courses?.find((c) => c.id === selectedCourseId) ?? null,
    [courses, selectedCourseId],
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!form.name.trim() || !form.teacherId || !form.classGroupId) {
      setError('Name, teacher and class group are required.');
      return;
    }
    const meetLink = form.meetLink.trim();
    if (form.id === null) {
      createMutation.mutate({
        name: form.name.trim(),
        teacherId: Number(form.teacherId),
        classGroupId: Number(form.classGroupId),
        meetLink: meetLink || undefined,
      });
    } else {
      updateMutation.mutate({
        id: form.id,
        name: form.name.trim(),
        teacherId: Number(form.teacherId),
        classGroupId: Number(form.classGroupId),
        // "" clears the link server-side; undefined would leave it unchanged.
        meetLink,
      });
    }
  };

  return {
    courses: courses ?? [],
    isLoading,
    isError,
    canManage,
    selectedCourseId,
    selectedCourse,
    onSelectCourse: setSelectedCourseId,
    formOpen,
    isEditing: form.id !== null,
    form,
    teachers: teachers ?? [],
    classGroups: classGroups ?? [],
    onOpenCreate: () => {
      setError(null);
      setForm(EMPTY_FORM);
      setFormOpen(true);
    },
    onOpenEdit: (course) => {
      setError(null);
      setForm({
        id: course.id,
        name: course.name,
        teacherId: String(course.teacherId),
        classGroupId: String(course.classGroupId),
        meetLink: course.meetLink ?? '',
      });
      setFormOpen(true);
    },
    onCloseForm: () => setFormOpen(false),
    onFormChange: (patch) => setForm((current) => ({ ...current, ...patch })),
    onSubmit,
    onDelete: (course) => {
      if (window.confirm(`Delete course "${course.name}"? Its timetable and sessions go too.`)) {
        deleteMutation.mutate(course.id);
      }
    },
    isSaving: createMutation.isPending || updateMutation.isPending,
    error,
  };
};

export default useCourseManager;
