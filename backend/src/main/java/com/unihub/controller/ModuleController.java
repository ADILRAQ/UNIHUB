package com.unihub.controller;

import com.unihub.dto.CreateModuleRequest;
import com.unihub.dto.ModuleDto;
import com.unihub.dto.UpdateModuleRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.ModuleService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * Course module management (UNIH-34).
 *
 * <ul>
 *   <li>Create/update/delete — TEACHER or ADMIN; ownership scoped in service.</li>
 *   <li>List — any authenticated user; visibility scoped in service.</li>
 * </ul>
 */
@Tag(name = "Resources")
@RestController
public class ModuleController {

    private final ModuleService moduleService;

    public ModuleController(ModuleService moduleService) {
        this.moduleService = moduleService;
    }

    @PostMapping("/api/courses/{courseId}/modules")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ModuleDto createModule(@PathVariable Long courseId,
                                   @Valid @RequestBody CreateModuleRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return moduleService.createModule(courseId, request, caller.userId(), caller.role());
    }

    @GetMapping("/api/courses/{courseId}/modules")
    @PreAuthorize("isAuthenticated()")
    public List<ModuleDto> getModules(@PathVariable Long courseId,
                                       @AuthenticationPrincipal AuthenticatedUser caller) {
        return moduleService.getModulesByCourse(courseId, caller.userId(), caller.role());
    }

    @PatchMapping("/api/modules/{moduleId}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ModuleDto updateModule(@PathVariable Long moduleId,
                                   @RequestBody UpdateModuleRequest request,
                                   @AuthenticationPrincipal AuthenticatedUser caller) {
        return moduleService.updateModule(moduleId, request, caller.userId(), caller.role());
    }

    @DeleteMapping("/api/modules/{moduleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public void deleteModule(@PathVariable Long moduleId,
                              @AuthenticationPrincipal AuthenticatedUser caller) {
        moduleService.deleteModule(moduleId, caller.userId(), caller.role());
    }
}
