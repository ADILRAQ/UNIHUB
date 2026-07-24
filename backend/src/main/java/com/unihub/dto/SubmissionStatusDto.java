package com.unihub.dto;

/**
 * Per-student submission status row returned in the teacher's roster view.
 * {@code status} is one of: "SUBMITTED", "LATE_SUBMITTED", "MISSING".
 */
public record SubmissionStatusDto(
        Long studentId,
        String studentName,
        String status,
        SubmissionDto submission
) {}
