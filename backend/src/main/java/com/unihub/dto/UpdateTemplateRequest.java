package com.unihub.dto;

import jakarta.validation.constraints.Size;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for {@code PATCH /api/templates/{id}}. Every field is optional — only
 * non-null fields are applied, then the session series is reconciled via
 * {@code regenerateSessions} (future auto rows only; past and hand-modified occurrences are
 * preserved). Time/date ordering is re-validated in the service after the merge.
 */
public record UpdateTemplateRequest(
        DayOfWeek dayOfWeek,
        LocalTime startTime,
        LocalTime endTime,
        @Size(max = 255) String room,
        LocalDate startDate,
        LocalDate endDate,
        Boolean active) {
}
