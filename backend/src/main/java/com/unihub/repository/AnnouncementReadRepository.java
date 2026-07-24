package com.unihub.repository;

import com.unihub.model.AnnouncementRead;
import com.unihub.model.AnnouncementReadId;
import java.util.Collection;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /**
     * Returns the subset of the given announcement ids that have been read by the user.
     * Used to populate the {@code read} field on {@link com.unihub.dto.AnnouncementDto}
     * for each item in a page without issuing N+1 queries.
     */
    @Query("SELECT ar.id.announcementId FROM AnnouncementRead ar "
            + "WHERE ar.id.userId = :userId AND ar.id.announcementId IN :announcementIds")
    Set<Long> findReadAnnouncementIds(@Param("userId") Long userId,
                                      @Param("announcementIds") Collection<Long> announcementIds);

    /**
     * Returns {@code true} when the user has already read the given announcement.
     * Equivalent to {@code existsById(new AnnouncementReadId(announcementId, userId))}
     * but avoids constructing the composite key at the call-site.
     */
    @Query("SELECT CASE WHEN COUNT(ar) > 0 THEN true ELSE false END "
            + "FROM AnnouncementRead ar "
            + "WHERE ar.announcement.id = :announcementId AND ar.user.id = :userId")
    boolean existsByAnnouncementIdAndUserId(@Param("announcementId") Long announcementId,
                                            @Param("userId") Long userId);

    /**
     * Removes the read receipt for the given (announcement, user) pair.
     * Idempotent: no error if the row does not exist.
     */
    @Modifying
    @Query("DELETE FROM AnnouncementRead ar "
            + "WHERE ar.announcement.id = :announcementId AND ar.user.id = :userId")
    void deleteByAnnouncementIdAndUserId(@Param("announcementId") Long announcementId,
                                         @Param("userId") Long userId);
}
