package com.unihub.controller;

import com.unihub.dto.PagedResponse;
import com.unihub.dto.UpdateUserStatusRequest;
import com.unihub.dto.UserDetailDto;
import com.unihub.dto.UserSummaryDto;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.UserAdminService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin user-administration endpoints. Every method is ADMIN-only (class-level
 * {@code @PreAuthorize}); a caller with another role gets a 403 via the security
 * access-denied handler. Business logic lives in {@link UserAdminService}.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
public class UserAdminController {

    private final UserAdminService userAdminService;

    public UserAdminController(UserAdminService userAdminService) {
        this.userAdminService = userAdminService;
    }

    @GetMapping
    public PagedResponse<UserSummaryDto> listUsers(
            @RequestParam(required = false) UserRole role,
            @RequestParam(required = false) UserStatus status,
            @RequestParam(required = false) Long classGroupId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {
        return userAdminService.listUsers(role, status, classGroupId, search, pageable);
    }

    @GetMapping("/{id}")
    public UserDetailDto getUser(@PathVariable Long id) {
        return userAdminService.getUser(id);
    }

    @PatchMapping("/{id}/status")
    public UserSummaryDto updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return userAdminService.updateStatus(id, request.status(), caller.userId());
    }
}
