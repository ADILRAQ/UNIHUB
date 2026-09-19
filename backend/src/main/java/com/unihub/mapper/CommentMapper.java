package com.unihub.mapper;

import com.unihub.dto.CommentDto;
import com.unihub.model.AnnouncementComment;

/**
 * Entity-to-DTO conversions for announcement comments (UNIH-25).
 *
 * <p>All lazy associations ({@code announcement}, {@code author}) must be resolved
 * inside a transactional service method before calling this helper.
 */
public final class CommentMapper {

    private CommentMapper() {
    }

    /**
     * Maps an {@link AnnouncementComment} to a {@link CommentDto}.
     *
     * @param comment the entity (lazy associations already resolved within a session)
     */
    public static CommentDto toDto(AnnouncementComment comment) {
        String fullName = comment.getAuthor().getFullName();
        return new CommentDto(
                comment.getId(),
                comment.getAnnouncement().getId(),
                comment.getAuthor().getId(),
                fullName,
                initials(fullName),
                comment.getContent(),
                comment.getCreatedAt());
    }

    /**
     * Derives two-letter initials from a full name.
     * "Amina Belkacem" → "AB", "John" → "J", {@code null}/blank → "?".
     */
    static String initials(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return "?";
        }
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, 1).toUpperCase();
        }
        return (parts[0].substring(0, 1) + parts[parts.length - 1].substring(0, 1)).toUpperCase();
    }
}
