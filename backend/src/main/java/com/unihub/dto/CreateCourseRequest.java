package com.unihub.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Request body for {@code POST /api/courses} (ADMIN only). The teacher must be a
 * {@code TEACHER}-role user and the class group must exist — both enforced in the service
 * (a friendly 400) rather than by bean validation, since they are data-existence checks.
 * {@code meetLink} is optional.
 */
public record CreateCourseRequest(
        @NotBlank @Size(max = 255) String name,
        @NotNull Long teacherId,
        @NotNull Long classGroupId,
        @Size(max = 1024) String meetLink) {
}
