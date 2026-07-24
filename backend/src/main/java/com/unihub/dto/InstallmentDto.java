package com.unihub.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * API representation of a student's installment for a payment period.
 * {@code overdue} is derived: {@code dueDate} is past and {@code status} is not PAID.
 */
public record InstallmentDto(
        Long id,
        Long periodId,
        String label,
        BigDecimal amount,
        LocalDate dueDate,
        int periodOrder,
        String status,
        Instant submittedAt,
        String rejectionReason,
        boolean overdue
) {}
