import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { listStudents, createStudent } from '../services/studentService';
import useTeacherClassGroupsData from './useTeacherClassGroupsData';
import type {
  ClassGroupDto,
  CreateUserRequest,
  CreatedUserDto,
  PagedResponse,
  UserSummaryDto,
} from '../../admin/types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UseTeacherStudentsSection {
  students: UserSummaryDto[];
  studentsLoading: boolean;
  classGroups: ClassGroupDto[];
  classGroupsLoading: boolean;
  showForm: boolean;
  fullName: string;
  email: string;
  classGroupId: number | null;
  createdUser: CreatedUserDto | null;
  fieldError: string | null;
  serverError: string | null;
  isPending: boolean;
  selectedStudent: UserSummaryDto | null;
  onToggleForm: () => void;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onClassGroupChange: (value: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
  onSelectStudent: (student: UserSummaryDto) => void;
  onCloseStudent: () => void;
}

/**
 * Logic for the teacher students section: fetches students in the teacher's
 * groups (the backend scopes the list to the caller's class groups), owns the
 * add-student form state, validates fields client-side, and fires the create
 * mutation via `usePostData`. Stores the one-time temporary password for
 * display via `TempPasswordPanel` on success.
 */
const useTeacherStudentsSection = (): UseTeacherStudentsSection => {
  const queryClient = useQueryClient();
  const { classGroups, isLoading: classGroupsLoading } = useTeacherClassGroupsData();

  const { data: students, isLoading: studentsLoading } = useGetData<
    PagedResponse<UserSummaryDto>,
    string,
    UserSummaryDto[]
  >({
    queryKey: ['teacher', 'students'],
    queryFn: listStudents,
    transformFn: (paged) => paged.content,
  });

  const [showForm, setShowForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [classGroupId, setClassGroupId] = useState<number | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUserDto | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<UserSummaryDto | null>(null);

  const resetFields = () => {
    setFullName('');
    setEmail('');
    setClassGroupId(null);
    setFieldError(null);
    setServerError(null);
  };

  const { mutate, isPending } = usePostData<string, CreateUserRequest, CreatedUserDto>({
    keys: ['teacher', 'students', 'create'],
    serviceFn: createStudent,
    onSuccessFn: (user) => {
      setCreatedUser(user);
      resetFields();
      void queryClient.invalidateQueries({ queryKey: ['teacher', 'students'] });
    },
    onErrorFn: (error) =>
      setServerError(apiErrorMessage(error, 'Could not create the student. Please try again.')),
  });

  const onToggleForm = () => {
    setShowForm((prev) => !prev);
    if (showForm) {
      resetFields();
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);
    setCreatedUser(null);

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName || !trimmedEmail) {
      setFieldError('Full name and email are required.');
      return;
    }
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setFieldError('Enter a valid email address.');
      return;
    }
    if (classGroupId === null) {
      setFieldError('Class group is required.');
      return;
    }

    setFieldError(null);
    mutate({ fullName: trimmedName, email: trimmedEmail, role: 'STUDENT', classGroupId });
  };

  return {
    students: students ?? [],
    studentsLoading,
    classGroups,
    classGroupsLoading,
    showForm,
    fullName,
    email,
    classGroupId,
    createdUser,
    fieldError,
    serverError,
    isPending,
    selectedStudent,
    onToggleForm,
    onFullNameChange: setFullName,
    onEmailChange: setEmail,
    onClassGroupChange: setClassGroupId,
    onSubmit,
    onReset: () => setCreatedUser(null),
    onSelectStudent: (student: UserSummaryDto) => setSelectedStudent(student),
    onCloseStudent: () => setSelectedStudent(null),
  };
};

export default useTeacherStudentsSection;
