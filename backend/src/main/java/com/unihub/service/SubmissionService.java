package com.unihub.service;

import com.unihub.dto.SubmissionDto;
import com.unihub.dto.SubmissionStatusDto;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.model.Assignment;
import com.unihub.model.Submission;
import com.unihub.model.User;
import com.unihub.model.UserClassGroup;
import com.unihub.repository.SubmissionRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Student homework submission use cases (UNIH-35).
 * Upsert logic: a second submission replaces the existing one.
 */
@Service
public class SubmissionService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final UserClassGroupRepository userClassGroupRepository;
    private final StorageService storageService;
    private final AssignmentService assignmentService;

    public SubmissionService(SubmissionRepository submissionRepository,
                              UserRepository userRepository,
                              UserClassGroupRepository userClassGroupRepository,
                              StorageService storageService,
                              AssignmentService assignmentService) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.userClassGroupRepository = userClassGroupRepository;
        this.storageService = storageService;
        this.assignmentService = assignmentService;
    }

    // -------------------------------------------------------------------------
    // Submit / resubmit
    // -------------------------------------------------------------------------

    @Transactional
    public SubmissionDto submit(Long assignmentId, MultipartFile file, Long studentId) {
        Assignment assignment = assignmentService.requireAssignment(assignmentId);

        // Verify student is enrolled in the course's class group
        if (!userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                studentId, assignment.getCourse().getClassGroup().getId())) {
            throw new AccessDeniedException("You are not enrolled in this course.");
        }

        StorageService.assertSize(file, StorageService.MAX_RESOURCE_BYTES);

        boolean late = OffsetDateTime.now().isAfter(assignment.getDueAt());

        Optional<Submission> existing =
                submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);

        String key = storageService.upload(file, "submissions");

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));

        if (existing.isPresent()) {
            // Resubmission: delete old MinIO object, update the row
            Submission sub = existing.get();
            storageService.delete(sub.getStorageKey());
            sub.setStorageKey(key);
            sub.setContentType(resolveContentType(file));
            sub.setOriginalName(resolveOriginalName(file));
            sub.setSubmittedAt(Instant.now());
            sub.setLate(late);
            return toDto(submissionRepository.save(sub));
        } else {
            Submission sub = new Submission();
            sub.setAssignment(assignment);
            sub.setStudent(student);
            sub.setStorageKey(key);
            sub.setContentType(resolveContentType(file));
            sub.setOriginalName(resolveOriginalName(file));
            sub.setSubmittedAt(Instant.now());
            sub.setLate(late);
            return toDto(submissionRepository.save(sub));
        }
    }

    // -------------------------------------------------------------------------
    // Reads
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public Optional<SubmissionDto> getMySubmission(Long assignmentId, Long studentId) {
        // Verify assignment exists
        assignmentService.requireAssignment(assignmentId);
        return submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<SubmissionStatusDto> getAllSubmissions(Long assignmentId, Long callerId,
                                                       String callerRole) {
        Assignment assignment = assignmentService.requireAssignment(assignmentId);

        // Caller must be the teacher of the course or ADMIN
        if (!ROLE_ADMIN.equals(callerRole)) {
            if (!ROLE_TEACHER.equals(callerRole)
                    || !assignment.getCourse().getTeacher().getId().equals(callerId)) {
                throw new AccessDeniedException(
                        "Only the course teacher or an admin can view all submissions.");
            }
        }

        Long classGroupId = assignment.getCourse().getClassGroup().getId();

        // All students enrolled in this class group
        List<User> students = userClassGroupRepository
                .findStudentsByClassGroupId(classGroupId).stream()
                .map(UserClassGroup::getUser)
                .toList();

        // All submissions for this assignment indexed by studentId
        Map<Long, Submission> submissionByStudent = submissionRepository
                .findByAssignmentId(assignmentId).stream()
                .collect(Collectors.toMap(s -> s.getStudent().getId(), Function.identity()));

        return students.stream()
                .map(student -> {
                    Submission sub = submissionByStudent.get(student.getId());
                    if (sub == null) {
                        return new SubmissionStatusDto(
                                student.getId(), student.getFullName(), "MISSING", null);
                    }
                    String status = sub.isLate() ? "LATE_SUBMITTED" : "SUBMITTED";
                    return new SubmissionStatusDto(
                            student.getId(), student.getFullName(), status, toDto(sub));
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public DownloadResult downloadSubmission(Long submissionId, Long callerId, String callerRole) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Submission " + submissionId + " not found."));

        Assignment assignment = submission.getAssignment();
        if (!ROLE_ADMIN.equals(callerRole)) {
            if (!ROLE_TEACHER.equals(callerRole)
                    || !assignment.getCourse().getTeacher().getId().equals(callerId)) {
                throw new AccessDeniedException(
                        "Only the course teacher or an admin can download submissions.");
            }
        }

        StorageService.StorageObject obj = storageService.download(submission.getStorageKey());
        return new DownloadResult(obj, submission.getOriginalName());
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private SubmissionDto toDto(Submission s) {
        return new SubmissionDto(
                s.getId(),
                s.getAssignment().getId(),
                s.getStudent().getId(),
                s.getStudent().getFullName(),
                s.getOriginalName(),
                s.getContentType(),
                0L, // size not stored; kept for API compatibility
                s.getSubmittedAt(),
                s.isLate());
    }

    private String resolveContentType(MultipartFile file) {
        return file.getContentType() != null ? file.getContentType() : "application/octet-stream";
    }

    private String resolveOriginalName(MultipartFile file) {
        return file.getOriginalFilename() != null ? file.getOriginalFilename() : file.getName();
    }

    public record DownloadResult(StorageService.StorageObject storageObject, String originalName) {}
}
