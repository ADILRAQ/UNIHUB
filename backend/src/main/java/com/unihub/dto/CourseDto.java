package com.unihub.dto;

import java.time.Instant;

/**
 * Course projection returned at the API boundary. Flattens the (lazy) teacher and class
 * group associations into ids + display names so no JPA entity is ever serialized.
 */
public record CourseDto(
        Long id,
        String name,
        Long teacherId,
        String teacherName,
        Long classGroupId,
        String classGroupName,
        String meetLink,
        Instant createdAt) {
}
