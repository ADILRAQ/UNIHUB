package com.unihub.dto;

import java.time.Instant;

/**
 * Course projection returned at the API boundary. Flattens the (lazy) teacher and class
 * group associations into ids + display names so no JPA entity is ever serialized.
 *
 * <p>{@code moduleCount} is the number of content modules in this course — used by the
 * course card in the UI to show a quick module count without a separate request.
 */
public record CourseDto(
        Long id,
        String name,
        Long teacherId,
        String teacherName,
        Long classGroupId,
        String classGroupName,
        String meetLink,
        int moduleCount,
        Instant createdAt) {
}
