package com.unihub.dto;

import java.time.Instant;
import java.time.OffsetDateTime;

/**
 * API representation of an {@code Assignment}. When the caller is a student the
 * submission-related fields are populated; for teachers/admins they remain null.
 */
public record AssignmentDto(
        Long id,
        Long courseId,
        String title,
        String description,
        OffsetDateTime dueAt,
        Instant createdAt,
        /** null for teachers/admins; "SUBMITTED", "LATE_SUBMITTED", or "MISSING" for students. */
        String mySubmissionStatus,
        /** The instant the student submitted, or null. */
        Instant mySubmittedAt
) {}
