package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

// Note: @NotNull kept for classGroupId; teacherId is intentionally un-annotated (optional for
// TEACHER callers, required for ADMIN — enforced in CourseService).

/**
 * Request body for {@code POST /api/courses} (ADMIN or TEACHER). The class group must exist —
 * enforced in the service (a friendly 400) rather than by bean validation. {@code teacherId}
 * is required when the caller is ADMIN (enforced in service); when the caller is a TEACHER
 * the service ignores {@code teacherId} and uses the caller's own id. {@code meetLink} is
 * optional.
 */
public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String name,
        Long teacherId,
        @NotNull Long classGroupId,
        @Size(max = 1024) String meetLink) {
}
