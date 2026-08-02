package com.unihub.service;

import com.unihub.dto.CreateModuleRequest;
import com.unihub.dto.ModuleDto;
import com.unihub.dto.UpdateModuleRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Course;
import com.unihub.model.CourseModule;
import com.unihub.repository.CourseModuleRepository;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.ResourceRepository;
import com.unihub.repository.UserClassGroupRepository;
import java.util.List;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD for course modules (topic folders). Visibility is scoped by role:
 * students must belong to the course's class group; teachers must own the course.
 */
@Service
public class ModuleService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final CourseModuleRepository moduleRepository;
    private final CourseRepository courseRepository;
    private final ResourceRepository resourceRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final StorageService storageService;

    public ModuleService(CourseModuleRepository moduleRepository,
                         CourseRepository courseRepository,
                         ResourceRepository resourceRepository,
                         UserClassGroupRepository userClassGroupRepository,
                         StorageService storageService) {
        this.moduleRepository = moduleRepository;
        this.courseRepository = courseRepository;
        this.resourceRepository = resourceRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.storageService = storageService;
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<ModuleDto> getModulesByCourse(Long courseId, Long callerId, String callerRole) {
        Course course = requireCourse(courseId);
        assertCanReadCourse(course, callerId, callerRole);

        List<CourseModule> modules = moduleRepository.findByCourseIdOrderByDisplayOrderAsc(courseId);
        List<Long> moduleIds = modules.stream().map(CourseModule::getId).toList();

        // Batch resource count per module
        List<com.unihub.model.Resource> resources = moduleIds.isEmpty()
                ? List.of()
                : resourceRepository.findByModuleIdIn(moduleIds);

        return modules.stream()
                .map(m -> {
                    long count = resources.stream().filter(r -> r.getModule().getId().equals(m.getId())).count();
                    return toDto(m, (int) count);
                })
                .toList();
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    @Transactional
    public ModuleDto createModule(Long courseId, CreateModuleRequest req,
                                   Long callerId, String callerRole) {
        Course course = requireCourse(courseId);
        assertCanWriteCourse(course, callerId, callerRole);

        CourseModule module = new CourseModule();
        module.setCourse(course);
        module.setTitle(req.title().trim());
        module.setDisplayOrder(req.displayOrder());

        return toDto(moduleRepository.save(module), 0);
    }

    @Transactional
    public ModuleDto updateModule(Long moduleId, UpdateModuleRequest req,
                                   Long callerId, String callerRole) {
        CourseModule module = requireModule(moduleId);
        assertCanWriteCourse(module.getCourse(), callerId, callerRole);

        if (req.title() != null) {
            String trimmed = req.title().trim();
            if (trimmed.isEmpty()) {
                throw new BadRequestException("Title must not be blank.");
            }
            module.setTitle(trimmed);
        }
        if (req.displayOrder() != null) {
            module.setDisplayOrder(req.displayOrder());
        }

        int resourceCount = resourceRepository.findByModuleId(moduleId).size();
        return toDto(moduleRepository.save(module), resourceCount);
    }

    @Transactional
    public void deleteModule(Long moduleId, Long callerId, String callerRole) {
        CourseModule module = requireModule(moduleId);
        assertCanWriteCourse(module.getCourse(), callerId, callerRole);

        // Delete all MinIO objects for resources in this module first
        List<com.unihub.model.Resource> resources = resourceRepository.findByModuleId(moduleId);
        resources.forEach(r -> storageService.delete(r.getStorageKey()));

        // JPA cascade will delete resource rows via ON DELETE CASCADE in DB
        moduleRepository.delete(module);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private void assertCanReadCourse(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        // STUDENT: must be in the course's class group
        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                callerId, course.getClassGroup().getId())) {
            throw new AccessDeniedException("You are not enrolled in this course.");
        }
    }

    private void assertCanWriteCourse(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        throw new AccessDeniedException("Students cannot manage course modules.");
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + courseId + " not found."));
    }

    CourseModule requireModule(Long moduleId) {
        return moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Module " + moduleId + " not found."));
    }

    private ModuleDto toDto(CourseModule m, int resourceCount) {
        return new ModuleDto(
                m.getId(),
                m.getCourse().getId(),
                m.getTitle(),
                m.getDisplayOrder(),
                m.getCreatedAt(),
                resourceCount);
    }
}
