package com.unihub.dto;

import java.time.Instant;

/**
 * Comment on an announcement returned at the API boundary (UNIH-25).
 *
 * <p>{@code content} is plain text — never HTML. {@code authorName} and
 * {@code authorInitials} are resolved server-side so the UI can render the
 * avatar chip without an extra user lookup.
 */
public record CommentDto(
        Long id,
        Long announcementId,
        Long authorId,
        String authorName,
        String authorInitials,
        String content,
        Instant createdAt) {
}
