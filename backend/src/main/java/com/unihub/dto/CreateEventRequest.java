package com.unihub.dto;

import com.unihub.model.EventType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Request body for {@code POST /api/events}. {@code courseId} and {@code classGroupId} are
 * optional (null {@code classGroupId} = department-wide). A TEACHER may only create an event
 * bound to a course they own; the existence of referenced course/group is checked in the
 * service. {@code startTime}/{@code endTime} are optional (all-day entries omit them).
 */
public record CreateEventRequest(
        @NotBlank @Size(max = 255) String title,
        @NotNull EventType type,
        @NotNull LocalDate eventDate,
        LocalTime startTime,
        LocalTime endTime,
        Long courseId,
        Long classGroupId,
        String description) {
}
