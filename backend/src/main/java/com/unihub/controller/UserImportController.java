package com.unihub.controller;

import com.unihub.dto.ImportResultResponse;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.UserImportService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * CSV bulk-import endpoint (UNIH-19). Open to ADMIN and TEACHER (a STUDENT gets a 403 via
 * the security access-denied handler); the finer-grained teacher-scoping — which roles and
 * which groups a teacher may import into — is enforced in {@link UserImportService}, since
 * it is per-row data logic, not a coarse URL boundary.
 *
 * <p>Separate from {@code UserAdminController} (which is class-level ADMIN-only) so the two
 * can coexist under {@code /api/users} with different authorization.
 */
@Tag(name = "User Management")
@RestController
public class UserImportController {

    private final UserImportService userImportService;

    public UserImportController(UserImportService userImportService) {
        this.userImportService = userImportService;
    }

    @PostMapping(value = "/api/users/import", consumes = "multipart/form-data")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ImportResultResponse importUsers(@RequestParam("file") MultipartFile file,
                                            @AuthenticationPrincipal AuthenticatedUser caller) {
        return userImportService.importUsers(file, caller);
    }
}
