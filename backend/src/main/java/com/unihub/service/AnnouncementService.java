package com.unihub.service;

import com.unihub.dto.AnnouncementDto;
import com.unihub.dto.CreateAnnouncementRequest;
import com.unihub.dto.PagedResponse;
import com.unihub.dto.UpdateAnnouncementRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.AnnouncementMapper;
import com.unihub.model.Announcement;
import com.unihub.model.AnnouncementReadId;
import com.unihub.model.ClassGroup;
import com.unihub.model.User;
import com.unihub.repository.AnnouncementReadRepository;
import com.unihub.repository.AnnouncementRepository;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Announcements CRUD with caller-scoped visibility, HTML sanitization, and read tracking.
 *
 * <p>Visibility rules:
 * <ul>
 *   <li><b>ADMIN / TEACHER</b> — see every announcement; may create dept-wide or for any
 *       group; may pin and update urgency on any announcement.</li>
 *   <li><b>STUDENT</b> — reads announcements for their own groups plus dept-wide; cannot
 *       create, update, delete, or pin.</li>
 * </ul>
 *
 * <p>HTML input is sanitized by {@link HtmlSanitizer} before every CREATE or UPDATE so
 * no raw client HTML is ever persisted.
 */
@Service
public class AnnouncementService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    /** Feed ordering: pinned announcements first, then newest-first within each bucket. */
    private static final Sort FEED_SORT =
            Sort.by(Sort.Order.desc("pinned"), Sort.Order.desc("createdAt"));

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementReadRepository announcementReadRepository;
    private final UserRepository userRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final HtmlSanitizer htmlSanitizer;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               AnnouncementReadRepository announcementReadRepository,
                               UserRepository userRepository,
                               ClassGroupRepository classGroupRepository,
                               UserClassGroupRepository userClassGroupRepository,
                               HtmlSanitizer htmlSanitizer) {
        this.announcementRepository = announcementRepository;
        this.announcementReadRepository = announcementReadRepository;
        this.userRepository = userRepository;
        this.classGroupRepository = classGroupRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.htmlSanitizer = htmlSanitizer;
    }

    // -------------------------------------------------------------------------
    // Feed / single-item reads
    // -------------------------------------------------------------------------

    /**
     * Returns the paginated announcement feed visible to the caller, with optional filters.
     *
     * <p>When {@code unreadOnly} is {@code true}, already-read items are removed from
     * the page content in memory after the DB query. This means the page's
     * {@code totalElements} reflects the full (unfiltered) count — an acknowledged
     * trade-off per the story specification.
     *
     * @param caller        the authenticated user
     * @param filterGroupId when non-null, limits results to this group + dept-wide
     * @param urgentOnly    when true, only urgent announcements are included
     * @param unreadOnly    when true, already-read items are excluded from the content list
     * @param page          zero-based page index
     * @param size          number of items per page (capped at 100)
     */
    @Transactional(readOnly = true)
    public PagedResponse<AnnouncementDto> getFeed(AuthenticatedUser caller, Long filterGroupId,
                                                   boolean urgentOnly, boolean unreadOnly,
                                                   int page, int size) {
        int clampedSize = Math.min(size, 100);
        Pageable pageable = PageRequest.of(page, clampedSize, FEED_SORT);

        Page<Announcement> announcementPage = loadFeedPage(caller, filterGroupId, urgentOnly, pageable);

        // Batch-fetch read receipts for all IDs on this page in one query.
        List<Long> pageIds = announcementPage.getContent().stream()
                .map(Announcement::getId)
                .toList();
        Set<Long> readIds = pageIds.isEmpty()
                ? Set.of()
                : announcementReadRepository.findReadAnnouncementIds(caller.userId(), pageIds);

        // Map to DTO; comment counts are fetched individually (acceptable N+1 for page sizes ≤ 100).
        List<AnnouncementDto> dtos = announcementPage.getContent().stream()
                .map(a -> {
                    boolean isRead = readIds.contains(a.getId());
                    int commentCount = announcementRepository.countCommentsByAnnouncementId(a.getId());
                    return AnnouncementMapper.toDto(a, commentCount, isRead);
                })
                .filter(dto -> !unreadOnly || !dto.read())
                .toList();

        return new PagedResponse<>(
                dtos,
                announcementPage.getNumber(),
                announcementPage.getSize(),
                announcementPage.getTotalElements(),
                announcementPage.getTotalPages());
    }

    /**
     * Returns one announcement by id, enforcing caller visibility. 403 if not visible.
     */
    @Transactional(readOnly = true)
    public AnnouncementDto getOne(Long id, AuthenticatedUser caller) {
        Announcement announcement = requireAnnouncement(id);
        if (!isVisible(announcement, caller)) {
            throw new AccessDeniedException("You do not have access to this announcement.");
        }
        boolean isRead = announcementReadRepository.existsById(new AnnouncementReadId(id, caller.userId()));
        int commentCount = announcementRepository.countCommentsByAnnouncementId(id);
        return AnnouncementMapper.toDto(announcement, commentCount, isRead);
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    /**
     * Creates a new announcement. Students are rejected (403). ADMIN and TEACHER may post
     * dept-wide (no {@code classGroupId}) or for any specific group.
     */
    @Transactional
    public AnnouncementDto create(CreateAnnouncementRequest request, AuthenticatedUser caller) {
        if (!ROLE_ADMIN.equals(caller.role()) && !ROLE_TEACHER.equals(caller.role())) {
            throw new AccessDeniedException("Only teachers and admins can create announcements.");
        }

        User author = requireUser(caller.userId());
        ClassGroup classGroup = request.classGroupId() != null
                ? requireGroup(request.classGroupId()) : null;

        String sanitizedBody = htmlSanitizer.sanitize(request.body());

        Announcement announcement = new Announcement();
        announcement.setAuthor(author);
        announcement.setClassGroup(classGroup);
        announcement.setTitle(request.title().trim());
        announcement.setBodyHtml(sanitizedBody);
        announcement.setPinned(request.pinned());
        announcement.setUrgent(request.urgent());

        return AnnouncementMapper.toDto(announcementRepository.save(announcement), 0, false);
    }

    /**
     * Patches title and/or body. Only the original author or an admin may update.
     * Sets {@code editedAt} to signal the frontend that content was changed after posting.
     */
    @Transactional
    public AnnouncementDto update(Long id, UpdateAnnouncementRequest request, AuthenticatedUser caller) {
        Announcement announcement = requireAnnouncement(id);
        requireAuthorOrAdmin(announcement, caller);

        boolean changed = false;

        if (request.title() != null) {
            String trimmed = request.title().trim();
            if (trimmed.isEmpty()) {
                throw new BadRequestException("Title must not be blank.");
            }
            announcement.setTitle(trimmed);
            changed = true;
        }

        if (request.body() != null) {
            announcement.setBodyHtml(htmlSanitizer.sanitize(request.body()));
            changed = true;
        }

        if (changed) {
            // editedAt marks that the content was modified after original posting.
            // updatedAt is managed by @UpdateTimestamp on save.
            announcement.setEditedAt(Instant.now());
        }

        Announcement saved = announcementRepository.save(announcement);
        int commentCount = announcementRepository.countCommentsByAnnouncementId(id);
        boolean isRead = announcementReadRepository.existsById(new AnnouncementReadId(id, caller.userId()));
        return AnnouncementMapper.toDto(saved, commentCount, isRead);
    }

    /**
     * Deletes an announcement. Only the author or an admin may delete.
     */
    @Transactional
    public void delete(Long id, AuthenticatedUser caller) {
        Announcement announcement = requireAnnouncement(id);
        requireAuthorOrAdmin(announcement, caller);
        announcementRepository.delete(announcement);
    }

    /**
     * Sets the {@code pinned} flag. ADMIN or TEACHER.
     */
    @Transactional
    public AnnouncementDto pin(Long id, boolean pinned, AuthenticatedUser caller) {
        if (!ROLE_ADMIN.equals(caller.role()) && !ROLE_TEACHER.equals(caller.role())) {
            throw new AccessDeniedException("Only teachers and admins can pin announcements.");
        }
        Announcement announcement = requireAnnouncement(id);
        announcement.setPinned(pinned);
        Announcement saved = announcementRepository.save(announcement);
        int commentCount = announcementRepository.countCommentsByAnnouncementId(id);
        boolean isRead = announcementReadRepository.existsById(new AnnouncementReadId(id, caller.userId()));
        return AnnouncementMapper.toDto(saved, commentCount, isRead);
    }

    /**
     * Sets the {@code urgent} flag. Admin always allowed; teacher only on their own announcements.
     */
    @Transactional
    public AnnouncementDto setUrgent(Long id, boolean urgent, AuthenticatedUser caller) {
        Announcement announcement = requireAnnouncement(id);
        if (!ROLE_ADMIN.equals(caller.role())) {
            if (!ROLE_TEACHER.equals(caller.role())) {
                throw new AccessDeniedException("Only teachers and admins can change urgency.");
            }
            if (!announcement.getAuthor().getId().equals(caller.userId())) {
                throw new AccessDeniedException(
                        "You can only change urgency on your own announcements.");
            }
        }
        announcement.setUrgent(urgent);
        Announcement saved = announcementRepository.save(announcement);
        int commentCount = announcementRepository.countCommentsByAnnouncementId(id);
        boolean isRead = announcementReadRepository.existsById(new AnnouncementReadId(id, caller.userId()));
        return AnnouncementMapper.toDto(saved, commentCount, isRead);
    }

    // -------------------------------------------------------------------------
    // Shared helpers used by sibling services (UNIH-25)
    // -------------------------------------------------------------------------

    /**
     * Returns the announcement identified by {@code id} after verifying the caller
     * can see it. Throws 404 if the announcement does not exist; 403 if it exists
     * but is not within the caller's visibility scope.
     *
     * <p>Intended for use by {@link CommentService} and {@link ReadTrackingService}
     * so visibility logic stays in one place.
     */
    @Transactional(readOnly = true)
    public Announcement requireVisibleAnnouncement(Long id, AuthenticatedUser caller) {
        Announcement announcement = requireAnnouncement(id);
        if (!isVisible(announcement, caller)) {
            throw new AccessDeniedException("You do not have access to this announcement.");
        }
        return announcement;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Selects the right repository query based on the caller's role, group memberships, and
     * optional filters.
     */
    private Page<Announcement> loadFeedPage(AuthenticatedUser caller, Long filterGroupId,
                                             boolean urgentOnly, Pageable pageable) {
        if (ROLE_ADMIN.equals(caller.role()) || ROLE_TEACHER.equals(caller.role())) {
            if (filterGroupId != null) {
                return urgentOnly
                        ? announcementRepository.findUrgentFeedForGroup(filterGroupId, pageable)
                        : announcementRepository.findByClassGroupIdIsNullOrClassGroupId(filterGroupId, pageable);
            }
            return urgentOnly
                    ? announcementRepository.findByUrgentTrue(pageable)
                    : announcementRepository.findAll(pageable);
        }

        // STUDENT: scoped to their own groups + dept-wide.
        List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());

        if (filterGroupId != null) {
            if (!groupIds.contains(filterGroupId)) {
                throw new AccessDeniedException("You are not a member of group " + filterGroupId + ".");
            }
            return urgentOnly
                    ? announcementRepository.findUrgentFeedForGroup(filterGroupId, pageable)
                    : announcementRepository.findByClassGroupIdIsNullOrClassGroupId(filterGroupId, pageable);
        }

        if (groupIds.isEmpty()) {
            return urgentOnly
                    ? announcementRepository.findByClassGroupIsNullAndUrgentTrue(pageable)
                    : announcementRepository.findByClassGroupIsNull(pageable);
        }

        return urgentOnly
                ? announcementRepository.findUrgentFeedForGroups(groupIds, pageable)
                : announcementRepository.findByClassGroupIdIsNullOrClassGroupIdIn(groupIds, pageable);
    }

    private boolean isVisible(Announcement announcement, AuthenticatedUser caller) {
        if (ROLE_ADMIN.equals(caller.role()) || ROLE_TEACHER.equals(caller.role())) {
            return true;
        }
        if (announcement.getClassGroup() == null) {
            // Dept-wide: visible to all authenticated users.
            return true;
        }
        return userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                caller.userId(), announcement.getClassGroup().getId());
    }

    private void requireAuthorOrAdmin(Announcement announcement, AuthenticatedUser caller) {
        boolean isAuthor = announcement.getAuthor().getId().equals(caller.userId());
        if (!isAuthor && !ROLE_ADMIN.equals(caller.role()) && !ROLE_TEACHER.equals(caller.role())) {
            throw new AccessDeniedException(
                    "Only the author or an admin can modify this announcement.");
        }
    }

    private Announcement requireAnnouncement(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement " + id + " not found."));
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User " + userId + " not found."));
    }

    private ClassGroup requireGroup(Long groupId) {
        return classGroupRepository.findById(groupId)
                .orElseThrow(() -> new BadRequestException("Class group " + groupId + " not found."));
    }
}
