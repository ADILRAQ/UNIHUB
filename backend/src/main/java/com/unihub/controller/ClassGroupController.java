package com.unihub.controller;

import com.unihub.dto.ClassGroupDto;
import com.unihub.dto.ClassGroupRequest;
import com.unihub.service.ClassGroupService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Admin class-group management: CRUD plus teacher assignment. Every method is ADMIN-only
 * (class-level {@code @PreAuthorize}); a non-admin caller gets a 403. Business logic lives
 * in {@link ClassGroupService}.
 */
@RestController
@RequestMapping("/api/class-groups")
@PreAuthorize("hasRole('ADMIN')")
public class ClassGroupController {

    private final ClassGroupService classGroupService;

    public ClassGroupController(ClassGroupService classGroupService) {
        this.classGroupService = classGroupService;
    }

    @GetMapping
    public List<ClassGroupDto> listGroups() {
        return classGroupService.listGroups();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClassGroupDto createGroup(@Valid @RequestBody ClassGroupRequest request) {
        return classGroupService.createGroup(request.name());
    }

    @PatchMapping("/{id}")
    public ClassGroupDto renameGroup(@PathVariable Long id,
                                     @Valid @RequestBody ClassGroupRequest request) {
        return classGroupService.renameGroup(id, request.name());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(@PathVariable Long id) {
        classGroupService.deleteGroup(id);
    }

    @PostMapping("/{id}/teachers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void assignTeacher(@PathVariable Long id, @PathVariable Long userId) {
        classGroupService.assignTeacher(id, userId);
    }

    @DeleteMapping("/{id}/teachers/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeTeacher(@PathVariable Long id, @PathVariable Long userId) {
        classGroupService.revokeTeacher(id, userId);
    }
}
