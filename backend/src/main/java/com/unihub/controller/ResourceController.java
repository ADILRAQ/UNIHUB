package com.unihub.controller;

import com.unihub.dto.ResourceDto;
import com.unihub.dto.ResourceSearchResult;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.ResourceService;
import com.unihub.service.StorageService;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

/**
 * Resource upload / download / search endpoints (UNIH-34).
 *
 * <ul>
 *   <li>Upload / delete — TEACHER or ADMIN; ownership scoped in service.</li>
 *   <li>Download / list / search — any authenticated user; visibility scoped in service.</li>
 * </ul>
 */
@RestController
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @PostMapping("/api/modules/{moduleId}/resources")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public ResourceDto uploadResource(@PathVariable Long moduleId,
                                       @RequestParam("file") MultipartFile file,
                                       @AuthenticationPrincipal AuthenticatedUser caller) {
        return resourceService.uploadResource(moduleId, file, caller.userId(), caller.role());
    }

    @GetMapping("/api/modules/{moduleId}/resources")
    @PreAuthorize("isAuthenticated()")
    public List<ResourceDto> listResources(@PathVariable Long moduleId,
                                            @AuthenticationPrincipal AuthenticatedUser caller) {
        return resourceService.getResourcesByModule(moduleId, caller.userId(), caller.role());
    }

    @GetMapping("/api/resources/{resourceId}/download")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StreamingResponseBody> downloadResource(
            @PathVariable Long resourceId,
            @AuthenticationPrincipal AuthenticatedUser caller) {

        ResourceService.DownloadResult result =
                resourceService.download(resourceId, caller.userId(), caller.role());

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

    @DeleteMapping("/api/resources/{resourceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    public void deleteResource(@PathVariable Long resourceId,
                                @AuthenticationPrincipal AuthenticatedUser caller) {
        resourceService.deleteResource(resourceId, caller.userId(), caller.role());
    }

    @GetMapping("/api/resources/search")
    @PreAuthorize("isAuthenticated()")
    public List<ResourceSearchResult> searchResources(
            @RequestParam(required = false) String q,
            @AuthenticationPrincipal AuthenticatedUser caller) {
        return resourceService.search(q, caller.userId(), caller.role());
    }

    private MediaType parseMediaType(String contentType) {
        try {
            return MediaType.parseMediaType(contentType);
        } catch (Exception e) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
