package com.unihub.dto;

/**
 * Response body for {@code GET /api/announcements/unread-count} (UNIH-25).
 * The count is the number of announcements visible to the caller that have
 * no entry in {@code announcement_reads} for that user.
 */
public record UnreadCountDto(long count) {
}
