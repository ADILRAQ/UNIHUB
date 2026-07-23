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
        return new CommentDto(
                comment.getId(),
                comment.getAnnouncement().getId(),
                comment.getAuthor().getId(),
                comment.getAuthor().getFullName(),
                comment.getContent(),
                comment.getCreatedAt());
    }
}
