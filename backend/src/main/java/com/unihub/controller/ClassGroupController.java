package com.unihub.controller;

import com.unihub.dto.ClassGroupDto;
import com.unihub.dto.ClassGroupRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.ClassGroupService;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * Class-group management. List is open to ADMIN and TEACHER (teacher sees only their own
 * groups); write operations (create, rename, delete, teacher assignment) remain ADMIN-only.
 * Business logic lives in {@link ClassGroupService}.
 */
@Tag(name = "User Management")
@RestController
@RequestMapping("/api/class-groups")
public class ClassGroupController {

    private final ClassGroupService classGroupService;

    public ClassGroupController(ClassGroupService classGroupService) {
        this.classGroupService = classGroupService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public List<ClassGroupDto> listGroups(@AuthenticationPrincipal AuthenticatedUser caller) {
        return classGroupService.listGroups(caller);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ClassGroupDto createGroup(@Valid @RequestBody ClassGroupRequest request) {
        return classGroupService.createGroup(request.name());
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public ClassGroupDto renameGroup(@PathVariable Long id,
                                     @Valid @RequestBody ClassGroupRequest request) {
        return classGroupService.renameGroup(id, request.name());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void deleteGroup(@PathVariable Long id) {
        classGroupService.deleteGroup(id);
    }

    @PostMapping("/{id}/teachers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void assignTeacher(@PathVariable Long id, @PathVariable Long userId) {
        classGroupService.assignTeacher(id, userId);
    }

    @DeleteMapping("/{id}/teachers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void revokeTeacher(@PathVariable Long id, @PathVariable Long userId) {
        classGroupService.revokeTeacher(id, userId);
    }
}
