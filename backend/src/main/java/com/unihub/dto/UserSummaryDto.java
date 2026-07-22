package com.unihub.dto;

/**
 * Compact user projection for the admin list view. Deliberately omits security-sensitive
 * fields (password hash) and the temp-password lifecycle details carried by
 * {@link UserDetailDto}.
 */
public record UserSummaryDto(
        Long id,
        String email,
        String fullName,
        String role,
        String status) {
}
