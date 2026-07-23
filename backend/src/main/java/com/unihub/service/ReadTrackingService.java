package com.unihub.service;

import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Announcement;
import com.unihub.model.AnnouncementRead;
import com.unihub.model.AnnouncementReadId;
import com.unihub.model.User;
import com.unihub.repository.AnnouncementReadRepository;
import com.unihub.repository.AnnouncementRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Read-receipt management for announcements (UNIH-25).
 *
 * <p>Two responsibilities:
 * <ol>
 *   <li>{@link #markRead} — idempotent upsert into {@code announcement_reads}.</li>
 *   <li>{@link #getUnreadCount} — the badge number: count of visible announcements
 *       that have no read receipt for the caller.</li>
 * </ol>
 *
 * <p>Visibility scoping mirrors {@link AnnouncementService}:
 * <ul>
 *   <li>ADMIN — all announcements.</li>
 *   <li>STUDENT/TEACHER — dept-wide + their own groups.</li>
 * </ul>
 */
@Service
public class ReadTrackingService {

    private static final String ROLE_ADMIN = "ADMIN";

    private final AnnouncementReadRepository readRepository;
    private final AnnouncementRepository announcementRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final UserRepository userRepository;
    private final AnnouncementService announcementService;

    public ReadTrackingService(AnnouncementReadRepository readRepository,
                               AnnouncementRepository announcementRepository,
                               UserClassGroupRepository userClassGroupRepository,
                               UserRepository userRepository,
                               AnnouncementService announcementService) {
        this.readRepository = readRepository;
        this.announcementRepository = announcementRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.userRepository = userRepository;
        this.announcementService = announcementService;
    }

    /**
     * Marks the given announcement as read for the caller. Idempotent: if a receipt
     * already exists, the operation is a no-op.
     *
     * <p>Delegates visibility enforcement to {@link AnnouncementService}: 404 if the
     * announcement does not exist, 403 if the caller cannot see it.
     *
     * @param announcementId the announcement to mark as read
     * @param caller         the authenticated user
     */
    @Transactional
    public void markRead(Long announcementId, AuthenticatedUser caller) {
        Announcement announcement = announcementService.requireVisibleAnnouncement(announcementId, caller);

        AnnouncementReadId readId = new AnnouncementReadId(announcementId, caller.userId());
        if (readRepository.existsById(readId)) {
            return; // Already marked — idempotent, nothing to do
        }

        User user = requireUser(caller.userId());
        AnnouncementRead read = new AnnouncementRead(announcement, user);
        readRepository.save(read);
    }

    /**
     * Returns the number of announcements visible to the caller that the caller
     * has not yet read.
     *
     * <p>Implementation: load the set of all visible announcement IDs, subtract
     * the subset that the caller has already read, return the difference.
     *
     * @param caller the authenticated user
     * @return unread announcement count (&ge; 0)
     */
    @Transactional(readOnly = true)
    public long getUnreadCount(AuthenticatedUser caller) {
        List<Long> visibleIds = loadVisibleIds(caller);
        if (visibleIds.isEmpty()) {
            return 0L;
        }
        long readCount = readRepository.countByUserIdAndAnnouncementIdIn(
                caller.userId(), visibleIds);
        return visibleIds.size() - readCount;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private List<Long> loadVisibleIds(AuthenticatedUser caller) {
        if (ROLE_ADMIN.equals(caller.role())) {
            return announcementRepository.findAllIds();
        }

        List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());
        if (groupIds.isEmpty()) {
            // User belongs to no groups — only dept-wide announcements are visible
            return announcementRepository.findDeptWideIds();
        }
        return announcementRepository.findVisibleIdsByGroupIds(groupIds);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found."));
    }
}
