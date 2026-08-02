package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;

/**
 * Request body for creating a new assignment.
 */
public record CreateAssignmentRequest(
        @NotBlank String title,
        String description,
        @NotNull OffsetDateTime dueAt
) {}
