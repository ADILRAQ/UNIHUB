package com.unihub.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * A single, calendar-ready entry in the merged {@code /api/schedule} feed — either a class
 * {@code SESSION} or a one-off {@code EVENT}, discriminated by {@code kind}. The feed is one
 * flat list sorted chronologically (by {@code date}, then {@code startTime} with all-day /
 * no-time entries first within a day).
 *
 * <p>Fields not relevant to a kind are null: {@code meetLink}/{@code status}/{@code originalDate}
 * are session-only; {@code eventType} is event-only. {@code meetLink} on a session is the
 * <em>resolved</em> link (session override, else course link). Cancelled sessions still appear
 * here with {@code status = CANCELLED} and their {@code changeNote}.
 */
public record ScheduleItemDto(
        ScheduleItemKind kind,
        Long id,
        LocalDate date,
        LocalTime startTime,
        LocalTime endTime,
        String title,
        Long courseId,
        String courseName,
        String room,
        String meetLink,
        String status,
        LocalDate originalDate,
        String changeNote,
        String eventType,
        Long classGroupId,
        String classGroupName) {
}
