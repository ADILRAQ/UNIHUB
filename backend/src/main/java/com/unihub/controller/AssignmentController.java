package com.unihub.controller;

import com.unihub.dto.AssignmentDto;
import com.unihub.dto.CreateAssignmentRequest;
import com.unihub.dto.SubmissionDto;
import com.unihub.dto.SubmissionStatusDto;
import com.unihub.dto.UpdateAssignmentRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.AssignmentService;
import com.unihub.service.StorageService;
import com.unihub.service.SubmissionService;
import jakarta.validation.Valid;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/**
 * Assignment and submission endpoints (UNIH-35).
 *
 * <ul>
 *   <li>Create / update / delete assignment — TEACHER or ADMIN; service enforces ownership.</li>
 *   <li>Get assignments for a course — any authenticated user; service enforces visibility.</li>
 *   <li>Submit — STUDENT only; service verifies enrollment.</li>
 *   <li>View submissions / download — TEACHER or ADMIN; service enforces course ownership.</li>
 * </ul>
 */
@Tag(name = "Assignments")
@RestController
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final SubmissionService submissionService;

    public AssignmentController(AssignmentService assignmentService,
                                 SubmissionService submissionService) {
        this.assignmentService = assignmentService;
        this.submissionService = submissionService;
    }

    // =========================================================================
    // Assignment CRUD
    // =========================================================================

    @PostMapping("/api/courses/{courseId}/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public AssignmentDto createAssignment(@PathVariable Long courseId,
                                           @Valid @RequestBody CreateAssignmentRequest request,
                                           @AuthenticationPrincipal AuthenticatedUser caller) {
        return assignmentService.createAssignment(courseId, request, caller.userId(), caller.role());
    }

    @GetMapping("/api/courses/{courseId}/assignments")
    @PreAuthorize("isAuthenticated()")
    public List<AssignmentDto> getAssignments(@PathVariable Long courseId,
                                               @AuthenticationPrincipal AuthenticatedUser caller) {
        return assignmentService.getAssignmentsForCourse(courseId, caller.userId(), caller.role());
    }

    @PatchMapping("/api/assignments/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public AssignmentDto updateAssignment(@PathVariable Long id,
                                           @RequestBody UpdateAssignmentRequest request,
                                           @AuthenticationPrincipal AuthenticatedUser caller) {
        return assignmentService.updateAssignment(id, request, caller.userId(), caller.role());
    }

    @DeleteMapping("/api/assignments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public void deleteAssignment(@PathVariable Long id,
                                  @AuthenticationPrincipal AuthenticatedUser caller) {
        assignmentService.deleteAssignment(id, caller.userId(), caller.role());
    }

    // =========================================================================
    // Submission endpoints
    // =========================================================================

    @GetMapping("/api/assignments/{id}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public List<SubmissionStatusDto> getAllSubmissions(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return submissionService.getAllSubmissions(id, caller.userId(), caller.role());
    }

    @PostMapping("/api/assignments/{id}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public SubmissionDto submit(@PathVariable Long id,
                                 @RequestParam("file") MultipartFile file,
                                 @AuthenticationPrincipal AuthenticatedUser caller) {
        return submissionService.submit(id, file, caller.userId());
    }

    @GetMapping("/api/assignments/{id}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDto> getMySubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        Optional<SubmissionDto> sub = submissionService.getMySubmission(id, caller.userId());
        return sub.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/submissions/{id}/download")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResponseEntity<StreamingResponseBody> downloadSubmission(
            @PathVariable Long id,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        SubmissionService.DownloadResult result =
                submissionService.downloadSubmission(id, caller.userId(), caller.role());

        StorageService.StorageObject obj = result.storageObject();

        StreamingResponseBody body = outputStream -> {
            try (var stream = obj.stream()) {
                stream.transferTo(outputStream);
            } catch (IOException e) {
                throw new RuntimeException("Error streaming file: " + e.getMessage(), e);
            }
        };

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + result.originalName() + "\"")
                .header(HttpHeaders.CONTENT_LENGTH, String.valueOf(obj.size()))
                .contentType(parseMediaType(obj.contentType()))
                .body(body);
    }

    private MediaType parseMediaType(String contentType) {
        try {
            return MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
