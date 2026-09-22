package com.unihub.dto;

import com.unihub.model.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for creating a single account (the single-user counterpart to the CSV bulk
 * import). The account is always provisioned with a server-generated temporary password —
 * this DTO never carries a password.
 *
 * <p>{@code classGroupId} is optional at the type level but constrained by authorization:
 * an ADMIN may omit it (a user with no cohort yet), whereas a TEACHER must supply one (any
 * group). It is validated (existence) in the service, not here.
 */
public record CreateUserRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotNull UserRole role,
        Long classGroupId) {
}
