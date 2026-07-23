package com.unihub.repository;

import com.unihub.model.AnnouncementRead;
import com.unihub.model.AnnouncementReadId;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Data-access layer for {@link AnnouncementRead} (read receipts).
 */
public interface AnnouncementReadRepository
        extends JpaRepository<AnnouncementRead, AnnouncementReadId> {

    /**
     * Counts how many of the given announcement ids the user has already read.
     * Used by the service to derive an unread count:
     * {@code unread = ids.size() - countByUserIdAndAnnouncementIdIn(userId, ids)}.
     */
    long countByUserIdAndAnnouncementIdIn(Long userId, Collection<Long> announcementIds);
}
