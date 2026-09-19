package com.unihub.dto;

import java.time.Instant;

/**
 * API representation of a course {@code Resource} — either a FILE upload or a LINK bookmark.
 * <p>
 * {@code type} is always present ("FILE" or "LINK").
 * For FILE resources: {@code contentType} and {@code sizeBytes} are populated; {@code url} is null.
 * For LINK resources: {@code url} is populated; {@code contentType} is null and {@code sizeBytes} is 0.
 */
public record ResourceDto(
        Long id,
        Long moduleId,
        String name,
        String type,
        String contentType,
        String url,
        long sizeBytes,
        Long uploadedById,
        String uploadedByName,
        Instant createdAt
) {}
