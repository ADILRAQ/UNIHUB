package com.unihub.controller;

import com.unihub.dto.CreateTemplateRequest;
import com.unihub.dto.ScheduleTemplateDto;
import com.unihub.dto.UpdateTemplateRequest;
import com.unihub.service.ScheduleTemplateService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RestController;

/**
 * Weekly schedule templates. Access is ADMIN or the teacher who owns the course
 * ({@code @courseAccess.ownsCourse}/{@code ownsTemplate}) — a teacher editing another
 * teacher's course/template gets a 403. Creating a template materialises its sessions
 * immediately; editing one reconciles the future series. Logic lives in
 * {@link ScheduleTemplateService}.
 *
 * <p>Collection routes are nested under the course ({@code /api/courses/{courseId}/templates});
 * item routes are flat ({@code /api/templates/{id}}) since a template id is globally unique.
 */
@Tag(name = "Calendar & Scheduling")
@RestController
public class ScheduleTemplateController {

    private final ScheduleTemplateService templateService;

    public ScheduleTemplateController(ScheduleTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping("/api/courses/{courseId}/templates")
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsCourse(authentication, #courseId)")
    public List<ScheduleTemplateDto> listTemplates(@PathVariable Long courseId) {
        return templateService.listTemplates(courseId);
    }

    @PostMapping("/api/courses/{courseId}/templates")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsCourse(authentication, #courseId)")
    public ScheduleTemplateDto createTemplate(@PathVariable Long courseId,
                                              @Valid @RequestBody CreateTemplateRequest request) {
        return templateService.createTemplate(courseId, request);
    }

    @PatchMapping("/api/templates/{id}")
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsTemplate(authentication, #id)")
    public ScheduleTemplateDto updateTemplate(@PathVariable Long id,
                                              @Valid @RequestBody UpdateTemplateRequest request) {
        return templateService.updateTemplate(id, request);
    }

    @DeleteMapping("/api/templates/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN') or @courseAccess.ownsTemplate(authentication, #id)")
    public void deleteTemplate(@PathVariable Long id) {
        templateService.deleteTemplate(id);
    }
}
