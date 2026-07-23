package com.unihub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for {@code POST /api/courses/{courseId}/templates}. {@code dayOfWeek} accepts
 * a {@link DayOfWeek} name ({@code "MONDAY"}..{@code "SUNDAY"}). The end-after-start and
 * end-date-not-before-start-date ordering rules are checked in the service (a clean 400).
 * {@code active} defaults to true when omitted (null).
 */
public record CreateTemplateRequest(
        @NotNull DayOfWeek dayOfWeek,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Size(max = 255) String room,
        @NotNull LocalDate startDate,
        @NotNull LocalDate endDate,
        Boolean active) {
}
