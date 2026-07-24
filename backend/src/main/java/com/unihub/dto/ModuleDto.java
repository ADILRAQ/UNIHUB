package com.unihub.dto;

import java.time.Instant;

/**
 * API representation of a {@code CourseModule}.
 */
public record ModuleDto(
        Long id,
        Long courseId,
        String title,
        int displayOrder,
        Instant createdAt,
        int resourceCount
) {}
