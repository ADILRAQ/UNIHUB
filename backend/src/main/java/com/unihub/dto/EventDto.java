package com.unihub.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * One-off event projection (exam / deadline / event). {@code startTime}/{@code endTime} are
 * null for all-day entries. A null {@code classGroupId} means department-wide; {@code courseId}
 * is optional.
 */
public record EventDto(
        Long id,
        String title,
        String type,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        Long courseId,
        String courseName,
        Long classGroupId,
        String classGroupName,
        String description,
        Instant createdAt) {
}
