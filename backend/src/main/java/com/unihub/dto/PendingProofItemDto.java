package com.unihub.dto;

import java.math.BigDecimal;
import java.time.Instant;

/**
 * Enhanced proof queue item for the admin "pending proofs" table view.
 *
 * <p>Adds {@code installmentNumber} (the period order 1–3), {@code classGroup} (the student's
 * class group display name), and {@code proofFileUrl} (the API path to stream the proof image)
 * on top of the existing {@link ProofQueueItemDto} shape returned by {@code GET /api/payments/queue}.
 */
public record PendingProofItemDto(
        Long installmentId,
        String studentName,
        Long studentId,
        String classGroup,
        int installmentNumber,
        BigDecimal amount,
        Instant submittedAt,
        String proofFileUrl
) {}
