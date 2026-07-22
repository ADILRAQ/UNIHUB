package com.unihub.dto;

import java.time.Instant;
import java.util.List;

/**
 * Full user detail for {@code GET /api/users/{id}}: the summary fields plus the
 * temp-password lifecycle flags, audit timestamps, and the class groups this user
 * belongs to (as {@link ClassGroupRef}s).
 */
public record UserDetailDto(
        Long id,
        String email,
        String fullName,
        String role,
        String status,
        boolean mustChangePassword,
        Instant tempPasswordExpiresAt,
        Instant createdAt,
        Instant updatedAt,
        List<ClassGroupRef> classGroups) {
}
