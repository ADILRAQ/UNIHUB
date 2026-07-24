package com.unihub.controller;

import com.unihub.dto.CreateUserRequest;
import com.unihub.dto.CreatedUserDto;
import com.unihub.dto.PagedResponse;
import com.unihub.dto.TempPasswordResponse;
import com.unihub.dto.UpdateUserStatusRequest;
import com.unihub.dto.UserDetailDto;
import com.unihub.dto.UserSummaryDto;
import com.unihub.model.UserRole;
import com.unihub.model.UserStatus;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.UserAdminService;
import com.unihub.service.UserProvisioningService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
 * User-administration endpoints. Every method requires ADMIN or TEACHER (class-level
 * {@code @PreAuthorize}), with extra service-layer guards for the two operations where
 * a TEACHER may not target an ADMIN account (status update and password reset). Business
 * logic lives in {@link UserAdminService}.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
public class UserAdminController {

    private final UserAdminService userAdminService;
    private final UserProvisioningService userProvisioningService;

    public UserAdminController(UserAdminService userAdminService,
                              UserProvisioningService userProvisioningService) {
        this.userAdminService = userAdminService;
        this.userProvisioningService = userProvisioningService;
    }

    /**
     * Creates a single account with a server-generated temporary password (the single-user
     * counterpart to CSV bulk import), returned once in the response. ADMIN or TEACHER;
     * creating an ADMIN account is rejected (400) — enforced in
     * {@link UserProvisioningService#createSingleUser}.
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CreatedUserDto createUser(@Valid @RequestBody CreateUserRequest request,
                                     @AuthenticationPrincipal AuthenticatedUser caller) {
        return userProvisioningService.createSingleUser(request, caller);
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
        return userAdminService.updateStatus(id, request.status(), caller.userId(), caller.role());
    }

    /**
     * Regenerates a temporary password for a user, shown once in the response. ADMIN or TEACHER;
     * the service rejects a TEACHER caller who targets an ADMIN account (403).
     */
    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public TempPasswordResponse resetPassword(@PathVariable Long id,
                                              @AuthenticationPrincipal AuthenticatedUser caller) {
        return userAdminService.resetPassword(id, caller.role());
    }
}
