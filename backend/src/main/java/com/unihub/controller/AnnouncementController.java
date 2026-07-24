package com.unihub.controller;

import com.unihub.dto.AnnouncementDto;
import com.unihub.dto.CommentDto;
import com.unihub.dto.CreateAnnouncementRequest;
import com.unihub.dto.CreateCommentRequest;
import com.unihub.dto.PagedResponse;
import com.unihub.dto.PinRequest;
import com.unihub.dto.UnreadCountDto;
import com.unihub.dto.UpdateAnnouncementRequest;
import com.unihub.dto.UrgentRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.AnnouncementService;
import com.unihub.service.CommentService;
import com.unihub.service.ReadTrackingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Announcements API (UNIH-24 / UNIH-25).
 *
 * <p>Role enforcement:
 * <ul>
 *   <li>Feed/single-item reads — any authenticated user (visibility scoped in service).</li>
 *   <li>Create / update / delete announcement — TEACHER or ADMIN; service further restricts
 *       teachers to groups they belong to and rejects student callers with 403.</li>
 *   <li>Pin — ADMIN only.</li>
 *   <li>Urgent — TEACHER or ADMIN (service restricts teachers to own announcements).</li>
 *   <li>Comments (list/add/delete) and read tracking — any authenticated user; visibility
 *       and authorship are enforced in the service layer.</li>
 * </ul>
 *
 * <p>IMPORTANT: {@code @GetMapping("/unread-count")} is declared BEFORE
 * {@code @GetMapping("/{id}")} so Spring MVC's exact-path-wins rule is explicit
 * in the source and the literal segment is never mistaken for a path variable.
 *
 * <p>Business logic lives entirely in the service layer; this class handles only
 * HTTP binding and RBAC at the URL level.
 */
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final CommentService commentService;
    private final ReadTrackingService readTrackingService;

    public AnnouncementController(AnnouncementService announcementService,
                                  CommentService commentService,
                                  ReadTrackingService readTrackingService) {
        this.announcementService = announcementService;
        this.commentService = commentService;
        this.readTrackingService = readTrackingService;
    }

    /**
     * Returns the caller-scoped announcement feed, paginated and optionally filtered.
     *
     * @param page          zero-based page index (default 0)
     * @param size          page size, capped at 100 in the service (default 20)
     * @param classGroupId  when supplied, limits results to this group + dept-wide
     * @param urgent        when true, only urgent announcements are returned
     * @param unread        when true, announcements already read by the caller are excluded
     */
    @GetMapping
    public PagedResponse<AnnouncementDto> getFeed(
            @AuthenticationPrincipal AuthenticatedUser caller,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) Long classGroupId,
            @RequestParam(defaultValue = "false") boolean urgent,
            @RequestParam(defaultValue = "false") boolean unread) {
        return announcementService.getFeed(caller, classGroupId, urgent, unread, page, size);
    }

    // =========================================================================
    // UNIH-25: unread-count — declared BEFORE /{id} to prevent routing
    // ambiguity (Spring MVC prefers literal segments over path variables, but
    // explicit ordering makes the intent clear).
    // =========================================================================

    /**
     * Returns the number of announcements visible to the caller that have not
     * yet been marked as read. Used as the notification badge count.
     */
    @GetMapping("/unread-count")
    public UnreadCountDto getUnreadCount(@AuthenticationPrincipal AuthenticatedUser caller) {
        return new UnreadCountDto(readTrackingService.getUnreadCount(caller));
    }

    // =========================================================================
    // Single announcement — /{id} variants
    // =========================================================================

    /**
     * Returns a single announcement by id. Visibility enforced in service (403 if not visible).
     */
    @GetMapping("/{id}")
    public AnnouncementDto getOne(@PathVariable Long id,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.getOne(id, caller);
    }

    // =========================================================================
    // UNIH-25: read tracking
    // =========================================================================

    /**
     * Marks the announcement as read for the calling user. Idempotent — repeated
     * calls on the same announcement are safe. Returns 204 No Content.
     * 404 if the announcement does not exist; 403 if not visible to the caller.
     */
    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable Long id,
                         @AuthenticationPrincipal AuthenticatedUser caller) {
        readTrackingService.markRead(id, caller);
    }

    // =========================================================================
    // UNIH-25: comments
    // =========================================================================

    /**
     * Returns the paginated comment list for the given announcement, oldest first
     * (page size 20). 403 if the announcement is not visible to the caller.
     *
     * @param page zero-based page index (default 0)
     */
    @GetMapping("/{id}/comments")
    public PagedResponse<CommentDto> listComments(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser caller,
            @RequestParam(defaultValue = "0") int page) {
        return commentService.listComments(id, caller, page);
    }

    /**
     * Adds a plain-text comment to the announcement.
     * Any authenticated user may comment if they can see the announcement.
     * 403 if the announcement is not visible to the caller.
     * 400 if content is blank or exceeds 2000 characters.
     */
    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentDto addComment(@PathVariable Long id,
                                  @Valid @RequestBody CreateCommentRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser caller) {
        return commentService.addComment(id, request, caller);
    }

    /**
     * Deletes a comment. Allowed for the comment's author, the announcement's
     * author, or any admin. 404 if not found or not on this announcement.
     */
    @DeleteMapping("/{id}/comments/{cid}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable Long id,
                               @PathVariable Long cid,
                               @AuthenticationPrincipal AuthenticatedUser caller) {
        commentService.deleteComment(id, cid, caller);
    }

    /**
     * Creates a new announcement. TEACHER or ADMIN; service enforces ownership scoping.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public AnnouncementDto create(@Valid @RequestBody CreateAnnouncementRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.create(request, caller);
    }

    /**
     * Patches title and/or body. TEACHER or ADMIN; service enforces authorship.
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public AnnouncementDto update(@PathVariable Long id,
                                   @Valid @RequestBody UpdateAnnouncementRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.update(id, request, caller);
    }

    /**
     * Deletes an announcement. TEACHER or ADMIN; service enforces authorship.
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal AuthenticatedUser caller) {
        announcementService.delete(id, caller);
    }

    /**
     * Sets the pinned flag. ADMIN or TEACHER.
     */
    @PatchMapping("/{id}/pin")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public AnnouncementDto pin(@PathVariable Long id,
                                @RequestBody PinRequest request,
                                @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.pin(id, request.pinned(), caller);
    }

    /**
     * Sets the urgent flag. TEACHER or ADMIN; service restricts teachers to own announcements.
     */
    @PatchMapping("/{id}/urgent")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public AnnouncementDto setUrgent(@PathVariable Long id,
                                      @RequestBody UrgentRequest request,
                                      @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.setUrgent(id, request.urgent(), caller);
    }
}
