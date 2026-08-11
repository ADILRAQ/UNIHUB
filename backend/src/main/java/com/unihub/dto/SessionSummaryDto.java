package com.unihub.dto;

import java.time.LocalDate;
import java.time.LocalTime;

/**
 * Lightweight session projection for list endpoints (e.g.
 * {@code GET /api/courses/{courseId}/sessions?past=true}).
 * The {@code hasRecap} flag tells the frontend whether to enable the "view recap" button
 * without fetching every recap's full payload.
 */
public record SessionSummaryDto(

        Long id,
        Long courseId,
        String courseName,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String room,
        String status,

        /**
         * {@code true} when a teacher has saved at least one recap update for this session
         * (i.e. {@code recap_updated_at} is not null). Does not guarantee any specific content
         * is present — the teacher may have cleared all fields after an initial save.
         */
        boolean hasRecap
) {
}
