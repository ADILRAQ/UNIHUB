package com.unihub.dto;

import java.time.Instant;

/**
 * API representation of a student {@code Submission}.
 */
public record SubmissionDto(
        Long id,
        Long assignmentId,
        Long studentId,
        String studentName,
        String originalName,
        String contentType,
        long sizeBytes,
        Instant submittedAt,
        boolean late
) {}
