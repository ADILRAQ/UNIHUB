package com.unihub.model;

/**
 * Kind of one-off calendar {@link Event}. Persisted as a string (matches
 * {@link UserRole}/{@link UserStatus}) and mirrored by the {@code type} CHECK
 * constraint on the {@code events} table.
 */
public enum EventType {
    EXAM,
    DEADLINE,
    EVENT
}
