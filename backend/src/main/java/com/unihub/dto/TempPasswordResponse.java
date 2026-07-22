package com.unihub.dto;

/**
 * Response body for the admin/teacher regenerate-temp-password endpoint. The plaintext
 * {@code temporaryPassword} is shown exactly once to the caller and is never logged or
 * stored in the clear (only its BCrypt hash is persisted).
 */
public record TempPasswordResponse(String email, String temporaryPassword) {
}
