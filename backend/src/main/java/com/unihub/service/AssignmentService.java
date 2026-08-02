package com.unihub.service;

import com.unihub.dto.AssignmentDto;
import com.unihub.dto.CreateAssignmentRequest;
import com.unihub.dto.UpdateAssignmentRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Assignment;
import com.unihub.model.Course;
import com.unihub.model.Submission;
import com.unihub.repository.AssignmentRepository;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.SubmissionRepository;
import com.unihub.repository.UserClassGroupRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Assignment CRUD for the course homework feature (UNIH-35).
 */
@Service
public class AssignmentService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";
    private static final String ROLE_STUDENT = "STUDENT";

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final SubmissionRepository submissionRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final StorageService storageService;

    public AssignmentService(AssignmentRepository assignmentRepository,
                              CourseRepository courseRepository,
                              SubmissionRepository submissionRepository,
                              UserClassGroupRepository userClassGroupRepository,
                              StorageService storageService) {
        this.assignmentRepository = assignmentRepository;
        this.courseRepository = courseRepository;
        this.submissionRepository = submissionRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.storageService = storageService;
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsForCourse(Long courseId, Long callerId,
                                                        String callerRole) {
        Course course = requireCourse(courseId);
        assertCanReadCourse(course, callerId, callerRole);

        List<Assignment> assignments = assignmentRepository.findByCourseIdOrderByDueAtAsc(courseId);

        return assignments.stream()
                .map(a -> toDto(a, callerId, callerRole))
                .toList();
    }

    @Transactional(readOnly = true)
    public AssignmentDto getAssignment(Long assignmentId, Long callerId, String callerRole) {
        Assignment assignment = requireAssignment(assignmentId);
        assertCanReadCourse(assignment.getCourse(), callerId, callerRole);
        return toDto(assignment, callerId, callerRole);
    }

    // -------------------------------------------------------------------------
    // Writes
    // -------------------------------------------------------------------------

    @Transactional
    public AssignmentDto createAssignment(Long courseId, CreateAssignmentRequest req,
                                           Long callerId, String callerRole) {
        Course course = requireCourse(courseId);
        assertCanWriteCourse(course, callerId, callerRole);

        Assignment assignment = new Assignment();
        assignment.setCourse(course);
        assignment.setTitle(req.title().trim());
        assignment.setDescription(req.description());
        assignment.setDueAt(req.dueAt());

        return toDto(assignmentRepository.save(assignment), callerId, callerRole);
    }

    @Transactional
    public AssignmentDto updateAssignment(Long assignmentId, UpdateAssignmentRequest req,
                                           Long callerId, String callerRole) {
        Assignment assignment = requireAssignment(assignmentId);
        assertCanWriteCourse(assignment.getCourse(), callerId, callerRole);

        if (req.title() != null) {
            String trimmed = req.title().trim();
            if (trimmed.isEmpty()) {
                throw new BadRequestException("Title must not be blank.");
            }
            assignment.setTitle(trimmed);
        }
        if (req.description() != null) {
            assignment.setDescription(req.description());
        }
        if (req.dueAt() != null) {
            assignment.setDueAt(req.dueAt());
        }

        return toDto(assignmentRepository.save(assignment), callerId, callerRole);
    }

    @Transactional
    public void deleteAssignment(Long assignmentId, Long callerId, String callerRole) {
        Assignment assignment = requireAssignment(assignmentId);
        assertCanWriteCourse(assignment.getCourse(), callerId, callerRole);

        // Delete all submission files from MinIO
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        submissions.forEach(s -> storageService.delete(s.getStorageKey()));

        // DB cascade removes submission rows
        assignmentRepository.delete(assignment);
    }

    // -------------------------------------------------------------------------
    // Package-level access for SubmissionService
    // -------------------------------------------------------------------------

    Assignment requireAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Assignment " + assignmentId + " not found."));
    }

    void assertTeacherOrAdminForAssignment(Assignment assignment, Long callerId, String callerRole) {
        assertCanWriteCourse(assignment.getCourse(), callerId, callerRole);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private AssignmentDto toDto(Assignment a, Long callerId, String callerRole) {
        String submissionStatus = null;
        java.time.Instant submittedAt = null;

        if (ROLE_STUDENT.equals(callerRole)) {
            Optional<Submission> sub = submissionRepository.findByAssignmentIdAndStudentId(
                    a.getId(), callerId);
            if (sub.isPresent()) {
                Submission s = sub.get();
                submissionStatus = s.isLate() ? "LATE_SUBMITTED" : "SUBMITTED";
                submittedAt = s.getSubmittedAt();
            } else {
                submissionStatus = "MISSING";
            }
        }

        return new AssignmentDto(
                a.getId(),
                a.getCourse().getId(),
                a.getTitle(),
                a.getDescription(),
                a.getDueAt(),
                a.getCreatedAt(),
                submissionStatus,
                submittedAt);
    }

    private void assertCanReadCourse(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                callerId, course.getClassGroup().getId())) {
            throw new AccessDeniedException("You are not enrolled in this course.");
        }
    }

    private void assertCanWriteCourse(Course course, Long callerId, String callerRole) {
        if (ROLE_ADMIN.equals(callerRole) || ROLE_TEACHER.equals(callerRole)) {
            return;
        }
        throw new AccessDeniedException("Students cannot manage assignments.");
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + courseId + " not found."));
    }
}
