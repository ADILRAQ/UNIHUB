import apiClient from '../../../api/client';
import type {
  InstallmentDto,
  PaymentPeriodDto,
  ProofQueueItemDto,
  OverdueStudentDto,
  CreatePeriodEntry,
} from '../types';

export const getMyInstallments = (): Promise<InstallmentDto[]> =>
  apiClient.get<InstallmentDto[]>('/api/payments/me').then((r) => r.data);

export const uploadProof = (installmentId: number, file: File): Promise<void> => {
  const form = new FormData();
  form.append('file', file);
  return apiClient
    .post(`/api/payments/${installmentId}/proof`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then(() => undefined);
};

export const getYearPlans = (): Promise<Record<string, PaymentPeriodDto[]>> =>
  apiClient
    .get<Record<string, PaymentPeriodDto[]>>('/api/payments/periods')
    .then((r) => r.data);

export const createYearPlan = (data: {
  academicYear: string;
  periods: CreatePeriodEntry[];
}): Promise<void> =>
  apiClient.post('/api/payments/periods', data).then(() => undefined);

export const getQueue = (): Promise<ProofQueueItemDto[]> =>
  apiClient.get<ProofQueueItemDto[]>('/api/payments/queue').then((r) => r.data);

export const downloadProof = async (
  installmentId: number,
  basename: string,
): Promise<void> => {
  const response = await apiClient.get(`/api/payments/${installmentId}/proof`, {
    responseType: 'blob',
  });
  const contentType: string = (response.headers['content-type'] as string) ?? '';
  const ext = contentType.includes('jpeg') || contentType.includes('jpg')
    ? '.jpg'
    : contentType.includes('png')
    ? '.png'
    : '.pdf';
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${basename}${ext}`;
  a.click();
  window.URL.revokeObjectURL(url);
};

export const approveInstallment = (id: number): Promise<void> =>
  apiClient.patch(`/api/payments/${id}/approve`).then(() => undefined);

export const rejectInstallment = (
  id: number,
  reason: string,
): Promise<void> =>
  apiClient
    .patch(`/api/payments/${id}/reject`, { reason })
    .then(() => undefined);

export const getOverdue = (classGroupId?: number): Promise<OverdueStudentDto[]> =>
  apiClient
    .get<OverdueStudentDto[]>('/api/payments/overdue', {
      params: classGroupId != null ? { classGroupId } : {},
    })
    .then((r) => r.data);
