package com.unihub.dto;

import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Weekly schedule-template projection. {@code dayOfWeek} serializes as its
 * {@link DayOfWeek} name (e.g. {@code "MONDAY"}).
 */
public record ScheduleTemplateDto(
        Long id,
        Long courseId,
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        LocalDate startDate,
        LocalDate endDate,
        boolean active,
        Instant createdAt) {
}
