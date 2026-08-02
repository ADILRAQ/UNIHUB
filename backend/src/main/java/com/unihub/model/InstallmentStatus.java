package com.unihub.model;

/**
 * Lifecycle statuses for a student installment.
 *
 * <p>The transition graph is strictly sequential:
 * {@code LOCKED → UNPAID → PROOF_SUBMITTED → PAID} (or {@code REJECTED → UNPAID} for re-upload).
 * Admin approval of one installment unlocks the next via
 * {@link com.unihub.service.PaymentService#approveInstallment}.
 */
public enum InstallmentStatus {
    LOCKED,
    UNPAID,
    PROOF_SUBMITTED,
    PAID,
    REJECTED
}
