package com.unihub.dto;

import com.unihub.model.UserStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for {@code PATCH /api/users/{id}/status}. {@code status} is bound directly
 * to the {@link UserStatus} enum, so an unknown value fails deserialization / validation.
 */
public record UpdateUserStatusRequest(
        @NotNull UserStatus status) {
}
