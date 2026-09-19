package com.unihub.service;

import com.unihub.dto.ResourceDto;
import com.unihub.dto.ResourceSearchResult;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Course;
import com.unihub.model.CourseModule;
import com.unihub.model.Resource;
import com.unihub.model.ResourceType;
import com.unihub.model.User;
import com.unihub.repository.CourseModuleRepository;
import com.unihub.repository.ResourceRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Upload, download, delete, and search for course resources.
 * Ownership and visibility checks mirror those in {@link ModuleService}.
 */
@Service
public class ResourceService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final ResourceRepository resourceRepository;
    private final CourseModuleRepository moduleRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final StorageService storageService;
    private final ModuleService moduleService;

    public ResourceService(ResourceRepository resourceRepository,
                           CourseModuleRepository moduleRepository,
                           UserRepository userRepository,
                           UserClassGroupRepository userClassGroupRepository,
                           StorageService storageService,
                           ModuleService moduleService) {
        this.resourceRepository = resourceRepository;
        this.moduleRepository = moduleRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.storageService = storageService;
        this.moduleService = moduleService;
    }

    // -------------------------------------------------------------------------
    // Upload (file)
    // -------------------------------------------------------------------------

    @Transactional
    public ResourceDto uploadResource(Long moduleId, MultipartFile file,
                                       Long callerId, String callerRole) {
        CourseModule module = moduleService.requireModule(moduleId);
        assertCanWrite(module.getCourse(), callerId, callerRole);

        StorageService.assertSize(file, StorageService.MAX_RESOURCE_BYTES);

        String key = storageService.upload(file, "resources");

        User uploader = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Resource resource = new Resource();
        resource.setModule(module);
        resource.setType(ResourceType.FILE);
        resource.setName(file.getOriginalFilename() != null
                ? file.getOriginalFilename() : file.getName());
        resource.setContentType(file.getContentType() != null
                ? file.getContentType() : "application/octet-stream");
        resource.setStorageKey(key);
        resource.setSizeBytes(file.getSize());
        resource.setUploadedBy(uploader);

        return toDto(resourceRepository.save(resource));
    }

    // -------------------------------------------------------------------------
    // Add link resource
    // -------------------------------------------------------------------------

    /**
     * Creates a LINK-type resource that points to an external URL. No file is stored in MinIO.
     *
     * @param moduleId   the module to attach the link to
     * @param title      display name for the link
     * @param url        the external URL
     * @param callerId   the authenticated caller's user id
     * @param callerRole the authenticated caller's role name
     */
    @Transactional
    public ResourceDto addLinkResource(Long moduleId, String title, String url,
                                        Long callerId, String callerRole) {
        CourseModule module = moduleService.requireModule(moduleId);
        assertCanWrite(module.getCourse(), callerId, callerRole);

        User uploader = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        Resource resource = new Resource();
        resource.setModule(module);
        resource.setType(ResourceType.LINK);
        resource.setName(title);
        resource.setUrl(url);
        resource.setSizeBytes(0L);
        resource.setUploadedBy(uploader);

        return toDto(resourceRepository.save(resource));
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ResourceDto> getResourcesByModule(Long moduleId, Long callerId, String callerRole) {
        CourseModule module = moduleService.requireModule(moduleId);
        assertCanRead(module.getCourse(), callerId, callerRole);

        return resourceRepository.findByModuleId(moduleId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadResult download(Long resourceId, Long callerId, String callerRole) {
        Resource resource = requireResource(resourceId);
        assertCanRead(resource.getModule().getCourse(), callerId, callerRole);

        StorageService.StorageObject obj = storageService.download(resource.getStorageKey());
        return new DownloadResult(obj, resource.getName());
    }

    @Transactional(readOnly = true)
    public List<ResourceSearchResult> search(String q, Long callerId, String callerRole) {
        // Collect accessible module IDs based on caller scope
        List<Long> accessibleModuleIds = getAccessibleModuleIds(callerId, callerRole);
        if (accessibleModuleIds.isEmpty()) {
            return List.of();
        }

        List<Resource> matches = (q == null || q.isBlank())
                ? resourceRepository.findByModuleIdIn(accessibleModuleIds)
                : resourceRepository.findByModuleIdInAndNameContainingIgnoreCase(accessibleModuleIds, q);

        return matches.stream()
                .map(r -> new ResourceSearchResult(
                        r.getId(),
                        r.getModule().getId(),
                        r.getName(),
                        r.getType() != null ? r.getType().name() : ResourceType.FILE.name(),
                        r.getContentType(),
                        r.getUrl(),
                        r.getSizeBytes(),
                        r.getUploadedBy().getId(),
                        r.getUploadedBy().getFullName(),
                        r.getCreatedAt(),
                        r.getModule().getTitle(),
                        r.getModule().getCourse().getName()))
                .toList();
    }

    // -------------------------------------------------------------------------
    // Delete
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteResource(Long resourceId, Long callerId, String callerRole) {
        Resource resource = requireResource(resourceId);
        assertCanWrite(resource.getModule().getCourse(), callerId, callerRole);

        storageService.delete(resource.getStorageKey());
        resourceRepository.delete(resource);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private List<Long> getAccessibleModuleIds(Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return moduleRepository.findAll().stream().map(CourseModule::getId).toList();
        }

        List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(callerId);
        if (groupIds.isEmpty()) {
            return List.of();
        }

        // STUDENT: only modules from courses in the student's class groups
        return moduleRepository.findAll().stream()
                .filter(m -> groupIds.contains(m.getCourse().getClassGroup().getId()))
                .map(CourseModule::getId)
                .toList();
    }

    private void assertCanRead(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                callerId, course.getClassGroup().getId())) {
            throw new AccessDeniedException("You are not enrolled in this course.");
        }
    }

    private void assertCanWrite(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        throw new AccessDeniedException("Students cannot manage course resources.");
    }

    private Resource requireResource(Long resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource " + resourceId + " not found."));
    }

    private ResourceDto toDto(Resource r) {
        return new ResourceDto(
                r.getId(),
                r.getModule().getId(),
                r.getName(),
                r.getType() != null ? r.getType().name() : ResourceType.FILE.name(),
                r.getContentType(),
                r.getUrl(),
                r.getSizeBytes(),
                r.getUploadedBy().getId(),
                r.getUploadedBy().getFullName(),
                r.getCreatedAt());
    }

    /** Pairs a MinIO stream with the original filename for download responses. */
    public record DownloadResult(StorageService.StorageObject storageObject, String originalName) {}
}
