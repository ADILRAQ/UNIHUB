package com.unihub.dto;

import java.time.Instant;

/**
 * Comment on an announcement returned at the API boundary (UNIH-25).
 *
 * <p>{@code content} is plain text — never HTML. {@code authorName} is the
 * commenter's full name resolved server-side so callers need not make a
 * separate user lookup.
 */
public record CommentDto(
        Long id,
        Long announcementId,
        Long authorId,
        String authorName,
        String content,
        Instant createdAt) {
}
