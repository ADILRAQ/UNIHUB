import { useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import usePostData from '../../../hooks/usePostData';
import { useToast } from '../../../components/ui/Toast';
import { apiErrorMessage } from '../../../utils/apiError';
import { createUser } from '../services/userService';
import useClassGroupsData from '../../../hooks/useClassGroupsData';
import type { ClassGroupDto, CreatableRole, CreateUserRequest, CreatedUserDto } from '../types';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface UseAddUserSection {
  fullName: string;
  email: string;
  role: CreatableRole;
  classGroupId: number | null;
  classGroups: ClassGroupDto[];
  classGroupsLoading: boolean;
  fieldError: string | null;
  serverError: string | null;
  isPending: boolean;
  /** The created account's one-time credentials, shown until the form is reused. */
  createdUser: CreatedUserDto | null;
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onRoleChange: (value: CreatableRole) => void;
  onClassGroupChange: (value: number | null) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
}

/**
 * Logic for the Add-user section: form state, client-side validation, the create
 * mutation via the generic `usePostData`, error mapping, and holding the one-time
 * temporary password for display. Invalidates the users list on success.
 */
const useAddUserSection = (): UseAddUserSection => {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { classGroups, isLoading: classGroupsLoading } = useClassGroupsData();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CreatableRole>('STUDENT');
  const [classGroupId, setClassGroupId] = useState<number | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUserDto | null>(null);

  const { mutate, isPending } = usePostData<string, CreateUserRequest, CreatedUserDto>({
    keys: ['admin', 'users', 'create'],
    serviceFn: createUser,
    onSuccessFn: (user) => {
      setCreatedUser(user);
      setFullName('');
      setEmail('');
      setRole('STUDENT');
      setClassGroupId(null);
      toast.success('User created successfully!');
      void queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] });
    },
    onErrorFn: (error) => {
      const msg = apiErrorMessage(error, 'Could not create the user. Please try again.');
      setServerError(msg);
      toast.error(msg);
    },
  });

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

    setFieldError(null);
    mutate({ fullName: trimmedName, email: trimmedEmail, role, classGroupId });
  };

  return {
    fullName,
    email,
    role,
    classGroupId,
    classGroups,
    classGroupsLoading,
    fieldError,
    serverError,
    isPending,
    createdUser,
    onFullNameChange: setFullName,
    onEmailChange: setEmail,
    onRoleChange: setRole,
    onClassGroupChange: setClassGroupId,
    onSubmit,
    onReset: () => setCreatedUser(null),
  };
};

export default useAddUserSection;
