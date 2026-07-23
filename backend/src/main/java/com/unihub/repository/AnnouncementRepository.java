package com.unihub.repository;

import com.unihub.model.Announcement;
import java.util.Collection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

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
 * {@link Pageable}; these methods don't bake in a sort so tests stay sort-agnostic.
 */
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    /**
     * Feed query for a user who belongs to one or more class groups.
     * Returns department-wide announcements (classGroupId IS NULL) plus those
     * scoped to any group in {@code groupIds}.
     */
    Page<Announcement> findByClassGroupIdIsNullOrClassGroupIdIn(
            Collection<Long> groupIds, Pageable pageable);

    /**
     * Feed query scoped to a single class group.
     * Returns department-wide announcements plus those targeted at {@code groupId}.
     */
    Page<Announcement> findByClassGroupIdIsNullOrClassGroupId(
            Long groupId, Pageable pageable);
}
