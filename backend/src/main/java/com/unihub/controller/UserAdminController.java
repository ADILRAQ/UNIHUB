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
 * Admin user-administration endpoints. Every method is ADMIN-only (class-level
 * {@code @PreAuthorize}); a caller with another role gets a 403 via the security
 * access-denied handler. Business logic lives in {@link UserAdminService}.
 */
@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
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
     * counterpart to CSV bulk import), returned once in the response. Overrides the class-level
     * ADMIN-only rule to also admit TEACHERs: an ADMIN may create a STUDENT or TEACHER in any
     * (or no) group, while a TEACHER may create only a STUDENT into a group they own — the
     * finer scoping is enforced in {@link UserProvisioningService#createSingleUser}, since it is
     * data logic rather than a coarse URL boundary (mirroring the CSV import).
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
        return userAdminService.updateStatus(id, request.status(), caller.userId());
    }

    /**
     * Regenerates a temporary password for a user, shown once in the response. Overrides the
     * class-level ADMIN-only rule: an ADMIN may reset anyone, while a TEACHER may reset only a
     * STUDENT they share a class group with (checked by {@code @classGroupAccess.managesStudent}).
     */
    @PatchMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN') or (hasRole('TEACHER') and @classGroupAccess.managesStudent(authentication, #id))")
    public TempPasswordResponse resetPassword(@PathVariable Long id) {
        return userAdminService.resetPassword(id);
    }
}
