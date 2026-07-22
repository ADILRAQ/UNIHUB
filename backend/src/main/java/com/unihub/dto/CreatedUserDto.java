package com.unihub.dto;

/**
 * A single account created by a CSV bulk import, returned once in the import response so
 * the caller can hand the credentials to the new user.
 *
 * <p>{@code temporaryPassword} is the <strong>only</strong> place the plaintext temp
 * password ever exists outside the user's memory — it is BCrypt-hashed before persistence
 * and there is no endpoint that returns it again.
 */
public record CreatedUserDto(
        String email,
        String fullName,
        String role,
        String classGroup,
        String temporaryPassword) {
}
