package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/auth/change-password}. Minimum-length strength is
 * enforced at the DTO boundary; the "must differ from the current password" rule is a
 * business rule enforced in the service.
 */
public record ChangePasswordRequest(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 8, message = "must be at least 8 characters") String newPassword) {
}
