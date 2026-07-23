package com.unihub.dto;

import com.unihub.model.EventType;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for {@code PATCH /api/events/{id}}. Every field is optional — only non-null
 * fields are applied. Re-pointing {@code courseId}/{@code classGroupId} is not supported here
 * to keep ownership scoping simple; those associations are fixed at creation.
 */
public record UpdateEventRequest(
        @Size(max = 255) String title,
        EventType type,
        LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        String description) {
}
