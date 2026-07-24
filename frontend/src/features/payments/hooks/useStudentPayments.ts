/**
 * Logic hook for the student payments view.
 * Exposes installments and the proof-upload mutation with feedback.
 */
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import * as paymentService from '../services/paymentService';
import type { InstallmentDto } from '../types';

const INSTALLMENTS_KEY = ['payments', 'me'] as const;

interface UseStudentPaymentsReturn {
  installments: InstallmentDto[];
  isLoading: boolean;
  isError: boolean;
  uploadingId: number | null;
  uploadFeedback: Record<number, string>;
  uploadProof: (installmentId: number, file: File) => void;
}

const useStudentPayments = (): UseStudentPaymentsReturn => {
  const queryClient = useQueryClient();
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<Record<number, string>>({});
  const pendingIdRef = useRef<number | null>(null);

  const { data, isLoading, isError } = useGetData<
    InstallmentDto[],
    string,
    InstallmentDto[]
  >({
    queryKey: [...INSTALLMENTS_KEY],
    queryFn: paymentService.getMyInstallments,
    transformFn: (d) => d.slice().sort((a, b) => a.periodOrder - b.periodOrder),
  });

  const { mutate: uploadMutate } = usePostData<
    string,
    { installmentId: number; file: File },
    void
  >({
    keys: ['payments', 'upload-proof'],
    serviceFn: ({ installmentId, file }) =>
      paymentService.uploadProof(installmentId, file),
    onSuccessFn: () => {
      const id = pendingIdRef.current;
      setUploadingId(null);
      if (id != null) {
        setUploadFeedback((prev) => ({
          ...prev,
          [id]: 'Submitted — awaiting validation',
        }));
        pendingIdRef.current = null;
      }
      void queryClient.invalidateQueries({ queryKey: [...INSTALLMENTS_KEY] });
    },
    onErrorFn: () => {
      const id = pendingIdRef.current;
      setUploadingId(null);
      if (id != null) {
        setUploadFeedback((prev) => ({ ...prev, [id]: 'Upload failed. Try again.' }));
        pendingIdRef.current = null;
      }
    },
  });

  const uploadProof = (installmentId: number, file: File) => {
    pendingIdRef.current = installmentId;
    setUploadingId(installmentId);
    setUploadFeedback((prev) => ({ ...prev, [installmentId]: 'Uploading…' }));
    uploadMutate({ installmentId, file });
  };

  return {
    installments: data ?? [],
    isLoading,
    isError,
    uploadingId,
    uploadFeedback,
    uploadProof,
  };
};

export default useStudentPayments;
