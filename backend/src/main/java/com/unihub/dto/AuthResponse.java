package com.unihub.dto;

/**
 * Response body for a successful login: the signed JWT plus the caller-facing profile
 * fields the frontend needs immediately (so it need not decode the token to render).
 */
public record AuthResponse(
        String token,
        Long userId,
        String email,
        String fullName,
        String role,
        boolean mustChangePassword) {
}
