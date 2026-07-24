package com.unihub.dto;

import java.time.OffsetDateTime;

/**
 * Request body for patching an assignment. All fields are optional.
 */
public record UpdateAssignmentRequest(
        String title,
        String description,
        OffsetDateTime dueAt
) {}
