package com.unihub.repository;

import com.unihub.model.Announcement;
import java.util.Collection;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

/**
 * Data-access layer for {@link Announcement}.
 *
 * <p>Feed query strategy:
 * <ul>
 *   <li>{@link #findByClassGroupIdIsNullOrClassGroupIdIn} — used for students and
 *       teachers whose membership spans multiple groups: returns department-wide
 *       announcements (classGroupId IS NULL) OR those targeting any of the caller's
 *       groups.</li>
 *   <li>{@link #findByClassGroupIdIsNullOrClassGroupId} — convenience variant when
 *       the caller belongs to exactly one group (avoids wrapping in a singleton list
 *       at the call-site).</li>
 * </ul>
 *
 * <p>Ordering (pinned first, then newest) is applied by the caller via
 * {@link Pageable}; methods without baked-in ORDER BY stay sort-agnostic.
 *
 * <p>Urgent-only variants mirror the visibility scoping rules but add the urgent
 * filter at the DB level (not in-memory) to avoid over-fetching.
 */
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    // -------------------------------------------------------------------------
    // Multi-group feed (students / teachers belonging to multiple groups)
    // -------------------------------------------------------------------------

    /**
     * Feed query for a user who belongs to one or more class groups.
     * Returns department-wide announcements (classGroupId IS NULL) plus those
     * scoped to any group in {@code groupIds}.
     */
    Page<Announcement> findByClassGroupIdIsNullOrClassGroupIdIn(
            Collection<Long> groupIds, Pageable pageable);

    /**
     * Urgent-only variant of the multi-group feed.
     */
    @Query("SELECT a FROM Announcement a WHERE (a.classGroup IS NULL OR a.classGroup.id IN :groupIds) AND a.urgent = true")
    Page<Announcement> findUrgentFeedForGroups(
            @Param("groupIds") Collection<Long> groupIds, Pageable pageable);

    // -------------------------------------------------------------------------
    // Single-group feed (filter to one specific group + dept-wide)
    // -------------------------------------------------------------------------

    /**
     * Feed query scoped to a single class group.
     * Returns department-wide announcements plus those targeted at {@code groupId}.
     */
    Page<Announcement> findByClassGroupIdIsNullOrClassGroupId(
            Long groupId, Pageable pageable);

    /**
     * Urgent-only variant of the single-group feed.
     */
    @Query("SELECT a FROM Announcement a WHERE (a.classGroup IS NULL OR a.classGroup.id = :groupId) AND a.urgent = true")
    Page<Announcement> findUrgentFeedForGroup(
            @Param("groupId") Long groupId, Pageable pageable);

    // -------------------------------------------------------------------------
    // Dept-wide only (for users with no group membership)
    // -------------------------------------------------------------------------

    Page<Announcement> findByClassGroupIsNull(Pageable pageable);

    Page<Announcement> findByClassGroupIsNullAndUrgentTrue(Pageable pageable);

    // -------------------------------------------------------------------------
    // Admin: all announcements (use JpaRepository#findAll(Pageable) for non-urgent)
    // -------------------------------------------------------------------------

    Page<Announcement> findByUrgentTrue(Pageable pageable);

    // -------------------------------------------------------------------------
    // Comment count helper
    // -------------------------------------------------------------------------

    @Query("SELECT COUNT(c) FROM AnnouncementComment c WHERE c.announcement.id = :announcementId")
    int countCommentsByAnnouncementId(@Param("announcementId") Long announcementId);

    // -------------------------------------------------------------------------
    // Unread-count helpers: projection queries returning IDs only (UNIH-25)
    // -------------------------------------------------------------------------

    /**
     * All announcement IDs — used by admins (who can see everything) for the
     * unread-count computation.
     */
    @Query("SELECT a.id FROM Announcement a")
    List<Long> findAllIds();

    /**
     * IDs of announcements that are either department-wide ({@code classGroup IS NULL})
     * or targeted at one of the caller's groups — the visibility scope for students
     * and teachers who belong to at least one group.
     */
    @Query("SELECT a.id FROM Announcement a "
            + "WHERE a.classGroup IS NULL OR a.classGroup.id IN :groupIds")
    List<Long> findVisibleIdsByGroupIds(@Param("groupIds") Collection<Long> groupIds);

    /**
     * IDs of department-wide announcements only — used when the caller belongs to
     * no class group (visibility reduces to dept-wide only in that case).
     */
    @Query("SELECT a.id FROM Announcement a WHERE a.classGroup IS NULL")
    List<Long> findDeptWideIds();
}
