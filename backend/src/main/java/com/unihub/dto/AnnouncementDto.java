package com.unihub.dto;

import java.time.Instant;

/**
 * Announcement projection returned at the API boundary.
 *
 * <p>{@code classGroupId} / {@code classGroupName} are {@code null} for department-wide
 * announcements. {@code editedAt} is {@code null} when the body/title has never been
 * changed after creation. {@code read} indicates whether the calling user has already
 * opened this announcement.
 */
public record AnnouncementDto(
        Long id,
        Long authorId,
        String authorName,
        Long classGroupId,
        String classGroupName,
        String title,
        String bodyHtml,
        boolean pinned,
        boolean urgent,
        Instant createdAt,
        Instant updatedAt,
        Instant editedAt,
        int commentCount,
        boolean read) {
}
