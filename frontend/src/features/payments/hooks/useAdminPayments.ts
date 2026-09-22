/**
 * Logic hook for the admin payments console.
 * Owns queue, approval/rejection mutations, overdue list, and year-plan form.
 */
import { useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetData from '../../../hooks/useGetData';
import usePostData from '../../../hooks/usePostData';
import { listAllClassGroups } from '../../admin/services/classGroupService';
import { apiErrorMessage } from '../../../utils/apiError';
import * as paymentService from '../services/paymentService';
import type {
  PendingProofItemDto,
  OverdueStudentDto,
  PaymentPeriodDto,
  CreateYearPlanPayload,
} from '../types';
import type { ClassGroupDto } from '../../admin/types';

export type AdminPaymentsTab = 'queue' | 'overdue' | 'plan';

const QUEUE_KEY = ['payments', 'queue'] as const;
const OVERDUE_KEY = ['payments', 'overdue'] as const;
const PLANS_KEY = ['payments', 'periods'] as const;

interface UseAdminPaymentsReturn {
  activeTab: AdminPaymentsTab;
  setActiveTab: (tab: AdminPaymentsTab) => void;
  /* Queue */
  queue: PendingProofItemDto[];
  isLoadingQueue: boolean;
  isErrorQueue: boolean;
  approvingId: number | null;
  rejectingId: number | null;
  rejectReason: string;
  setRejectReason: (v: string) => void;
  rejectTargetId: number | null;
  openReject: (id: number) => void;
  cancelReject: () => void;
  approveItem: (installmentId: number) => void;
  confirmReject: () => void;
  downloadProof: (installmentId: number, filename: string) => Promise<void>;
  /* Overdue */
  overdueList: OverdueStudentDto[];
  isLoadingOverdue: boolean;
  classGroups: ClassGroupDto[];
  selectedGroupId: number | undefined;
  setSelectedGroupId: (id: number | undefined) => void;
  /* Year plans */
  yearPlans: Record<string, PaymentPeriodDto[]>;
  isLoadingPlans: boolean;
  /** Creates a class group's plan; `onCreated` runs only on success (e.g. to reset the form). */
  createYearPlan: (data: CreateYearPlanPayload, onCreated?: () => void) => void;
  isCreatingPlan: boolean;
  planError: string | null;
}

const useAdminPayments = (): UseAdminPaymentsReturn => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminPaymentsTab>('queue');
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(undefined);
  const [planError, setPlanError] = useState<string | null>(null);
  const pendingApproveRef = useRef<number | null>(null);
  const pendingRejectRef = useRef<number | null>(null);

  const { data: queue, isLoading: isLoadingQueue, isError: isErrorQueue } =
    useGetData<PendingProofItemDto[], string, PendingProofItemDto[]>({
      queryKey: [...QUEUE_KEY],
      queryFn: paymentService.getQueue,
      transformFn: (d) => d,
    });

  const { data: overdueList, isLoading: isLoadingOverdue } = useGetData<
    OverdueStudentDto[],
    string | number | undefined,
    OverdueStudentDto[]
  >({
    queryKey: [...OVERDUE_KEY, selectedGroupId],
    queryFn: () => paymentService.getOverdue(selectedGroupId),
    transformFn: (d) => d,
    enabled: activeTab === 'overdue',
  });

  const { data: classGroups } = useGetData<ClassGroupDto[], string, ClassGroupDto[]>({
    queryKey: ['classGroups', 'list', 'all'],
    queryFn: listAllClassGroups,
    transformFn: (d) => d,
  });

  const { data: yearPlansData, isLoading: isLoadingPlans } = useGetData<
    Record<string, PaymentPeriodDto[]>,
    string,
    Record<string, PaymentPeriodDto[]>
  >({
    queryKey: [...PLANS_KEY],
    queryFn: paymentService.getYearPlans,
    transformFn: (d) => d,
    enabled: activeTab === 'plan',
  });

  const { mutate: approveMutate } = usePostData<string, number, void>({
    keys: ['payments', 'approve'],
    serviceFn: (id) => paymentService.approveInstallment(id),
    onSuccessFn: () => {
      setApprovingId(null);
      pendingApproveRef.current = null;
      void queryClient.invalidateQueries({ queryKey: [...QUEUE_KEY] });
    },
    onErrorFn: () => {
      setApprovingId(null);
      pendingApproveRef.current = null;
    },
  });

  const { mutate: rejectMutate } = usePostData<
    string,
    { id: number; reason: string },
    void
  >({
    keys: ['payments', 'reject'],
    serviceFn: ({ id, reason }) => paymentService.rejectInstallment(id, reason),
    onSuccessFn: () => {
      setRejectingId(null);
      setRejectTargetId(null);
      setRejectReason('');
      pendingRejectRef.current = null;
      void queryClient.invalidateQueries({ queryKey: [...QUEUE_KEY] });
    },
    onErrorFn: () => {
      setRejectingId(null);
      pendingRejectRef.current = null;
    },
  });

  const { mutate: createPlanMutate, isPending: isCreatingPlan } = usePostData<
    string,
    CreateYearPlanPayload,
    void
  >({
    keys: ['payments', 'create-plan'],
    serviceFn: (data) => paymentService.createYearPlan(data),
    onSuccessFn: () => {
      setPlanError(null);
      void queryClient.invalidateQueries({ queryKey: [...PLANS_KEY] });
    },
    onErrorFn: (err) => {
      setPlanError(apiErrorMessage(err, 'Failed to create plan.'));
    },
  });

  const createYearPlan = (data: CreateYearPlanPayload, onCreated?: () => void) => {
    setPlanError(null);
    createPlanMutate(data, { onSuccess: () => onCreated?.() });
  };

  const approveItem = (installmentId: number) => {
    pendingApproveRef.current = installmentId;
    setApprovingId(installmentId);
    approveMutate(installmentId);
  };

  const openReject = (id: number) => {
    setRejectTargetId(id);
    setRejectReason('');
  };

  const cancelReject = () => {
    setRejectTargetId(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (!rejectTargetId || !rejectReason.trim()) return;
    pendingRejectRef.current = rejectTargetId;
    setRejectingId(rejectTargetId);
    rejectMutate({ id: rejectTargetId, reason: rejectReason.trim() });
  };

  return {
    activeTab,
    setActiveTab,
    queue: queue ?? [],
    isLoadingQueue,
    isErrorQueue,
    approvingId,
    rejectingId,
    rejectReason,
    setRejectReason,
    rejectTargetId,
    openReject,
    cancelReject,
    approveItem,
    confirmReject,
    downloadProof: paymentService.downloadProof,
    overdueList: overdueList ?? [],
    isLoadingOverdue,
    classGroups: classGroups ?? [],
    selectedGroupId,
    setSelectedGroupId,
    yearPlans: yearPlansData ?? {},
    isLoadingPlans,
    createYearPlan,
    isCreatingPlan,
    planError,
  };
};

export default useAdminPayments;
