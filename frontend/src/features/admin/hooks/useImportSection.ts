import { useRef, useState } from 'react';
import type { ChangeEvent, DragEvent, RefObject } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import usePostData from '../../../hooks/usePostData';
import { apiErrorMessage } from '../../../utils/apiError';
import { downloadCsv, toCsv } from '../../../utils/downloadCsv';
import { importUsers } from '../services/userService';
import type { ImportResultResponse } from '../types';

const CREDENTIALS_HEADERS = ['email', 'fullName', 'role', 'classGroup', 'temporaryPassword'];
const TEMPLATE_HEADERS = ['name', 'email', 'role', 'classGroup'];
const MAX_BYTES = 5 * 1024 * 1024;

export type DropzoneStatus = 'idle' | 'dragging' | 'selected' | 'error';

export interface UseImportSection {
  inputRef: RefObject<HTMLInputElement>;
  status: DropzoneStatus;
  fileName: string | null;
  fileSize: string;
  fileError: string | null;
  isPending: boolean;
  serverError: string | null;
  result: ImportResultResponse | null;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onBrowse: () => void;
  onRemove: () => void;
  onImport: () => void;
  onDownloadTemplate: () => void;
  onDownloadCredentials: () => void;
}

const formatSize = (bytes: number): string => {
  const kb = bytes / 1024;
  return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(kb))} KB`;
};

/**
 * Logic for the CSV bulk-import section: drag-and-drop / browse file selection
 * with client-side type & size checks, the multipart import mutation via
 * `usePostData`, holding the `ImportResultResponse`, and building the template
 * and credentials CSVs client-side. Invalidates the users list on a successful
 * import so the new accounts appear in the Users tab.
 */
const useImportSection = (): UseImportSection => {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [rejectedName, setRejectedName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
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

  const selectFile = (picked: File | undefined) => {
    setDragging(false);
    setServerError(null);
    setResult(null);
    setFile(null);
    setRejectedName(null);
    setFileError(null);
    if (!picked) return;
    if (!/\.csv$/i.test(picked.name)) {
      setRejectedName(picked.name);
      setFileError('Only .csv files are supported');
    } else if (picked.size > MAX_BYTES) {
      setRejectedName(picked.name);
      setFileError('File is larger than 5 MB');
    } else {
      setFile(picked);
    }
  };

  const clearInput = () => {
    if (inputRef.current) inputRef.current.value = '';
  };

  const status: DropzoneStatus = file
    ? 'selected'
    : fileError
      ? 'error'
      : dragging
        ? 'dragging'
        : 'idle';

  return {
    inputRef,
    status,
    fileName: file?.name ?? rejectedName,
    fileSize: file ? formatSize(file.size) : '',
    fileError,
    isPending,
    serverError,
    result,
    onFileChange: (event) => selectFile(event.target.files?.[0]),
    onDragOver: (event) => {
      event.preventDefault();
      if (!isPending) setDragging(true);
    },
    onDragLeave: (event) => {
      event.preventDefault();
      setDragging(false);
    },
    onDrop: (event) => {
      event.preventDefault();
      if (isPending) return;
      clearInput();
      selectFile(event.dataTransfer.files[0]);
    },
    onBrowse: () => inputRef.current?.click(),
    onRemove: () => {
      clearInput();
      selectFile(undefined);
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
    onDownloadTemplate: () =>
      downloadCsv('unihub-users-template.csv', toCsv(TEMPLATE_HEADERS, [])),
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
