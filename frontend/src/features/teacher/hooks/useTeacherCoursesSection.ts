import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { listCourses, createCourse } from '../../schedule/services/courseService';
import { useAuth } from '../../auth/AuthContext';
import useTeacherClassGroupsData from './useTeacherClassGroupsData';
import type { Course, CreateCourseRequest } from '../../schedule/types';
import type { ClassGroupDto } from '../../admin/types';

export interface UseTeacherCoursesSection {
  courses: Course[];
  coursesLoading: boolean;
  classGroups: ClassGroupDto[];
  classGroupsLoading: boolean;
  showForm: boolean;
  name: string;
  classGroupId: number | null;
  meetLink: string;
  fieldError: string | null;
  serverError: string | null;
  isPending: boolean;
  onToggleForm: () => void;
  onNameChange: (value: string) => void;
  onClassGroupChange: (value: number | null) => void;
  onMeetLinkChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRowClick: (courseId: number) => void;
}

/**
 * Logic for the teacher courses section: fetches the teacher's own courses,
 * owns the create-course form state, validates fields client-side, and fires
 * the create mutation via `usePostData`. Closes the form and invalidates the
 * courses list on success.
 */
const useTeacherCoursesSection = (): UseTeacherCoursesSection => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { classGroups, isLoading: classGroupsLoading } = useTeacherClassGroupsData();

  const { data: courses, isLoading: coursesLoading } = useGetData<Course[], string, Course[]>({
    queryKey: ['teacher', 'courses'],
    queryFn: listCourses,
    transformFn: (data) => data,
  });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [classGroupId, setClassGroupId] = useState<number | null>(null);
  const [meetLink, setMeetLink] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setClassGroupId(null);
    setMeetLink('');
    setFieldError(null);
    setServerError(null);
  };

  const { mutate, isPending } = usePostData<string, CreateCourseRequest, Course>({
    keys: ['teacher', 'courses', 'create'],
    serviceFn: createCourse,
    onSuccessFn: () => {
      setShowForm(false);
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'courses'] });
    },
    onErrorFn: (error) =>
      setServerError(apiErrorMessage(error, 'Could not create the course. Please try again.')),
  });

  const onToggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      resetForm();
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldError('Course name is required.');
      return;
    }
    if (classGroupId === null) {
      setFieldError('Class group is required.');
      return;
    }

    setFieldError(null);
    mutate({
      name: trimmedName,
      teacherId: user!.userId,
      classGroupId,
      meetLink: meetLink.trim() || undefined,
    });
  };

  return {
    courses: courses ?? [],
    coursesLoading,
    classGroups,
    classGroupsLoading,
    showForm,
    name,
    classGroupId,
    meetLink,
    fieldError,
    serverError,
    isPending,
    onToggleForm,
    onNameChange: setName,
    onClassGroupChange: setClassGroupId,
    onMeetLinkChange: setMeetLink,
    onSubmit,
    onRowClick: (courseId: number) => navigate(`/courses/${courseId}`),
  };
};

export default useTeacherCoursesSection;
