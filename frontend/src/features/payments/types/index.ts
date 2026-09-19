/** Payments-feature-local types. */

export interface PaymentPeriodDto {
  id: number;
  academicYear: string;
  label: string;
  amount: number;
  dueDate: string; // "YYYY-MM-DD"
  periodOrder: number;
}

export type InstallmentStatus =
  | 'LOCKED'
  | 'UNPAID'
  | 'PROOF_SUBMITTED'
  | 'PAID'
  | 'REJECTED';

export interface InstallmentDto {
  id: number;
  periodId: number;
  label: string;
  amount: number;
  dueDate: string;
  periodOrder: number;
  status: InstallmentStatus;
  submittedAt: string | null;
  rejectionReason: string | null;
  overdue: boolean;
}

export interface ProofQueueItemDto {
  installmentId: number;
  studentId: number;
  studentName: string;
  classGroupName: string;
  label: string;
  amount: number;
  dueDate: string;
  submittedAt: string;
}

export interface OverdueStudentDto {
  studentId: number;
  studentName: string;
  classGroupId: number | null;
  classGroupName: string | null;
  overdueInstallments: InstallmentDto[];
}

export interface CreatePeriodEntry {
  label: string;
  amount: number;
  dueDate: string;
  periodOrder: number;
}

/** Richer pending-proof item returned by GET /api/payments/pending-proofs. */
export interface PendingProofItemDto {
  installmentId: number;
  studentName: string;
  studentId: number;
  classGroup: string;
  installmentNumber: number;
  amount: number;
  submittedAt: string;
  proofFileUrl: string;
}
