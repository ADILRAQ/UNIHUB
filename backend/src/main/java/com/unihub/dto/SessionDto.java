package com.unihub.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Single-session projection. {@code meetLink} is the <em>resolved</em> link
 * ({@code session.meetLink} when set, else the course link) so the frontend's Join button
 * always has a URL. {@code status} is the {@link com.unihub.model.SessionStatus} name;
 * {@code originalDate} and {@code changeNote} surface reschedule/cancel context.
 */
public record SessionDto(
        Long id,
        Long courseId,
        String courseName,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        String meetLink,
        String status,
        LocalDate originalDate,
        String changeNote) {
}
