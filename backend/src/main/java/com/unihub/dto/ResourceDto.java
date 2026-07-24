package com.unihub.dto;

import java.time.Instant;

/**
 * API representation of a course {@code Resource}.
 */
public record ResourceDto(
        Long id,
        Long moduleId,
        String name,
        String contentType,
        long sizeBytes,
        Long uploadedById,
        String uploadedByName,
        Instant createdAt
) {}
