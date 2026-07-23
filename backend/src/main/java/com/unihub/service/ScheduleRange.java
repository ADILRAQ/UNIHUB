package com.unihub.service;

import com.unihub.exception.BadRequestException;
import java.time.LocalDate;

/**
 * Shared validation for the {@code from}/{@code to} date range used by the schedule and event
 * feeds. Rejects an inverted range and an absurdly wide one (more than a year), both as a
 * clean 400 via {@link BadRequestException}.
 */
final class ScheduleRange {

    /** Guards against unbounded scans; a calendar never needs more than a year at once. */
    private static final long MAX_DAYS = 366;

    private ScheduleRange() {
    }

    static void validate(LocalDate from, LocalDate to) {
        if (from == null || to == null) {
            throw new BadRequestException("Both 'from' and 'to' dates are required.");
        }
        if (to.isBefore(from)) {
            throw new BadRequestException("'from' must be on or before 'to'.");
        }
        if (from.plusDays(MAX_DAYS).isBefore(to)) {
            throw new BadRequestException("Date range must not exceed " + MAX_DAYS + " days.");
        }
    }
}
