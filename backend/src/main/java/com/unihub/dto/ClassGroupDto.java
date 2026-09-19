package com.unihub.dto;

import java.time.Instant;

/**
 * Class-group projection for the admin list/CRUD responses. {@code memberCount} is
 * computed from {@code user_class_groups} rather than navigated from the entity.
 */
public record ClassGroupDto(
        Long id,
        String name,
        long memberCount,
        Long teacherId,
        String teacherName,
        Instant createdAt) {
}
