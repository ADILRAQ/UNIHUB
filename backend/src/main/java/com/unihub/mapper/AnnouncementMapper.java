package com.unihub.mapper;

import com.unihub.dto.AnnouncementDto;
import com.unihub.model.Announcement;

/**
 * Entity-to-DTO conversions for the announcements API (UNIH-24).
 * Pure static helpers matching the pattern in {@link SchedulingMapper} — no JPA entity
 * leaves the service boundary. All lazy associations ({@code author}, {@code classGroup})
 * must be resolved inside a transactional service method before calling these helpers.
 */
public final class AnnouncementMapper {

    private AnnouncementMapper() {
    }

    /**
     * Maps an {@link Announcement} to an {@link AnnouncementDto}.
     *
     * @param announcement  the entity (lazy associations already resolved)
     * @param commentCount  total comments on this announcement
     * @param read          whether the calling user has already read this announcement
     */
    public static AnnouncementDto toDto(Announcement announcement, int commentCount, boolean read) {
        return new AnnouncementDto(
                announcement.getId(),
                announcement.getAuthor().getId(),
                announcement.getAuthor().getFullName(),
                announcement.getClassGroup() != null ? announcement.getClassGroup().getId() : null,
                announcement.getClassGroup() != null ? announcement.getClassGroup().getName() : null,
                announcement.getTitle(),
                announcement.getBodyHtml(),
                announcement.isPinned(),
                announcement.isUrgent(),
                announcement.getCreatedAt(),
                announcement.getUpdatedAt(),
                announcement.getEditedAt(),
                commentCount,
                read);
    }
}
