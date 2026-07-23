package com.unihub.controller;

import com.unihub.dto.AnnouncementDto;
import com.unihub.dto.CreateAnnouncementRequest;
import com.unihub.dto.PagedResponse;
import com.unihub.dto.PinRequest;
import com.unihub.dto.UpdateAnnouncementRequest;
import com.unihub.dto.UrgentRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.AnnouncementService;
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
 * Announcements API (UNIH-24).
 *
 * <p>Role enforcement:
 * <ul>
 *   <li>Feed/single-item reads — any authenticated user (visibility scoped in service).</li>
 *   <li>Create / update / delete — TEACHER or ADMIN; service further restricts teachers
 *       to groups they belong to and rejects student callers with 403.</li>
 *   <li>Pin — ADMIN only.</li>
 *   <li>Urgent — TEACHER or ADMIN (service restricts teachers to own announcements).</li>
 * </ul>
 *
 * <p>Business logic lives entirely in {@link AnnouncementService}; this class handles
 * only HTTP binding and RBAC at the URL level.
 */
@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;

    public AnnouncementController(AnnouncementService announcementService) {
        this.announcementService = announcementService;
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

    /**
     * Returns a single announcement by id. Visibility enforced in service (403 if not visible).
     */
    @GetMapping("/{id}")
    public AnnouncementDto getOne(@PathVariable Long id,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return announcementService.getOne(id, caller);
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
     * Sets the pinned flag. ADMIN only.
     */
    @PatchMapping("/{id}/pin")
    @PreAuthorize("hasRole('ADMIN')")
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
