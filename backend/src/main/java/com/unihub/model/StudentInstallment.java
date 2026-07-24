package com.unihub.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * One installment record linking a student to a payment period.
 * The {@link InstallmentStatus} follows the lifecycle:
 * LOCKED → UNPAID → PROOF_SUBMITTED → PAID (or REJECTED → re-upload).
 */
@Entity
@Table(name = "student_installments",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "period_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StudentInstallment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "period_id", nullable = false)
    private PaymentPeriod period;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "installment_status")
    private InstallmentStatus status = InstallmentStatus.LOCKED;

    @Column(name = "proof_storage_key", length = 512)
    private String proofStorageKey;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "validated_by")
    private User validatedBy;

    @Column(name = "validated_at", columnDefinition = "TIMESTAMPTZ")
    private Instant validatedAt;

    @Column(name = "submitted_at", columnDefinition = "TIMESTAMPTZ")
    private Instant submittedAt;
}
