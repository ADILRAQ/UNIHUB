package com.unihub.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Admin queue item for a proof awaiting review.
 */
public record ProofQueueItemDto(
        Long installmentId,
        Long studentId,
        String studentName,
        String classGroupName,
        String label,
        BigDecimal amount,
        LocalDate dueDate,
        Instant submittedAt
) {}
