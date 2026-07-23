package com.unihub.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for {@code PATCH /api/sessions/{id}/reschedule}. The engine rejects moving an
 * occurrence onto a date the course normally meets (400) — a make-up class goes to an off
 * day; to clear a normal day, cancel it instead.
 */
public record RescheduleSessionRequest(
        @NotNull LocalDate newDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @Size(max = 255) String room,
        String note) {
}
