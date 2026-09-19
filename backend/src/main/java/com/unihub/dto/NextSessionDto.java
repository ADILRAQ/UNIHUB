package com.unihub.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Lightweight projection for the "next upcoming session" dashboard hero block.
 *
 * <p>{@code meetUrl} is the resolved Meet link (per-session override when present,
 * otherwise the course link). {@code null} when the course has no Meet link configured.
 */
public record NextSessionDto(
        Long sessionId,
        String courseName,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        String meetUrl,
        Long courseId
) {}
