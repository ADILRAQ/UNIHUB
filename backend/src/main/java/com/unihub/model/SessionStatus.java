package com.unihub.model;

/**
 * Lifecycle state of a {@link Session}. Persisted as a string (matches
 * {@link UserRole}/{@link UserStatus}) and mirrored by the {@code status} CHECK
 * constraint on the {@code sessions} table.
 */
public enum SessionStatus {
    /** Normal, taking place as planned. */
    SCHEDULED,
    /** Cancelled outright; the occurrence does not happen. */
    CANCELLED,
    /** Moved to this date/time from {@code original_date}; the series is otherwise intact. */
    RESCHEDULED
}
