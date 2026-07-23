import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { downloadCsv, toCsv } from '../../../utils/downloadCsv';
import { importUsers } from '../services/userService';
import type { ImportResultResponse } from '../types';

const CREDENTIALS_HEADERS = ['email', 'fullName', 'role', 'classGroup', 'temporaryPassword'];

export interface UseImportSection {
  file: File | null;
  fileName: string | null;
  isPending: boolean;
  serverError: string | null;
  result: ImportResultResponse | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onDownloadCredentials: () => void;
}

/**
 * Logic for the CSV bulk-import section: file selection, the multipart import
 * mutation via `usePostData`, holding the `ImportResultResponse`, and building a
 * credentials CSV client-side from `createdUsers`. Invalidates the users list on
 * a successful import so the new accounts appear in the Users tab.
 */
const useImportSection = (): UseImportSection => {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResultResponse | null>(null);

  const { mutate, isPending } = usePostData<string, File, ImportResultResponse>({
    keys: ['admin', 'users', 'import'],
    serviceFn: importUsers,
    onSuccessFn: (importResult) => {
      setResult(importResult);
      if (importResult.successCount > 0) {
        void queryClient.invalidateQueries({ queryKey: ['admin', 'users', 'list'] });
      }
    },
    onErrorFn: (error) =>
      setServerError(apiErrorMessage(error, 'Could not import the file. Please try again.')),
  });

  return {
    file,
    fileName: file?.name ?? null,
    isPending,
    serverError,
    result,
    onFileChange: (event) => {
      setServerError(null);
      setResult(null);
      setFile(event.target.files?.[0] ?? null);
    },
    onImport: () => {
      if (!file) {
        setServerError('Choose a CSV file first.');
        return;
      }
      setServerError(null);
      setResult(null);
      mutate(file);
    },
    onDownloadCredentials: () => {
      if (!result || result.createdUsers.length === 0) {
        return;
      }
      const rows = result.createdUsers.map((user) => [
        user.email,
        user.fullName,
        user.role,
        user.classGroup ?? '',
        user.temporaryPassword,
      ]);
      downloadCsv('unihub-credentials.csv', toCsv(CREDENTIALS_HEADERS, rows));
    },
  };
};

export default useImportSection;
