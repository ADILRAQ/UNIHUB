package com.unihub.dto;

import jakarta.validation.constraints.Size;

/**
 * Request body for {@code PATCH /api/courses/{id}} (ADMIN only). Every field is optional —
 * only non-null fields are applied. To <em>clear</em> the Meet link, pass an empty string
 * ({@code ""}); a null {@code meetLink} leaves it unchanged.
 */
public record UpdateCourseRequest(
        @Size(max = 255) String name,
        Long teacherId,
        Long classGroupId,
        @Size(max = 1024) String meetLink) {
}
