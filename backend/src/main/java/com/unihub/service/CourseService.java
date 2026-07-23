package com.unihub.service;

import com.unihub.dto.CourseDto;
import com.unihub.dto.CreateCourseRequest;
import com.unihub.dto.UpdateCourseRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.ClassGroup;
import com.unihub.model.Course;
import com.unihub.model.User;
import com.unihub.model.UserRole;
import com.unihub.repository.ClassGroupRepository;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.UserClassGroupRepository;
import com.unihub.repository.UserRepository;
import com.unihub.security.AuthenticatedUser;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Course administration and reads. Course metadata (create/update/delete, teacher & group
 * assignment) is ADMIN-only — enforced at the controller boundary; teachers manage the
 * <em>timetable</em> of courses assigned to them, not the courses themselves. List/get reads
 * are scoped to the caller here: admins see everything, teachers their own courses, students
 * the courses of the class groups they belong to.
 */
@Service
public class CourseService {

    private static final String ROLE_ADMIN = "ADMIN";
    private static final String ROLE_TEACHER = "TEACHER";

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final ClassGroupRepository classGroupRepository;
    private final UserClassGroupRepository userClassGroupRepository;

    public CourseService(CourseRepository courseRepository,
                         UserRepository userRepository,
                         ClassGroupRepository classGroupRepository,
                         UserClassGroupRepository userClassGroupRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.classGroupRepository = classGroupRepository;
        this.userClassGroupRepository = userClassGroupRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseDto> listCourses(AuthenticatedUser caller) {
        List<Course> courses = switch (caller.role()) {
            case ROLE_ADMIN -> courseRepository.findAll();
            case ROLE_TEACHER -> courseRepository.findByTeacher_Id(caller.userId());
            default -> {
                List<Long> groupIds = userClassGroupRepository.findGroupIdsByUserId(caller.userId());
                yield groupIds.isEmpty() ? List.of() : courseRepository.findByClassGroup_IdIn(groupIds);
            }
        };
        return courses.stream()
                .sorted(Comparator.comparing(Course::getName, String.CASE_INSENSITIVE_ORDER))
                .map(SchedulingMapper::toCourseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CourseDto getCourse(Long id, AuthenticatedUser caller) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + id + " not found"));
        if (!isVisibleTo(course, caller)) {
            // Out of the caller's scope: 404 rather than 403 — reads don't reveal existence
            // of courses the caller cannot see.
            throw new ResourceNotFoundException("Course " + id + " not found");
        }
        return SchedulingMapper.toCourseDto(course);
    }

    private boolean isVisibleTo(Course course, AuthenticatedUser caller) {
        return switch (caller.role()) {
            case ROLE_ADMIN -> true;
            case ROLE_TEACHER -> course.getTeacher().getId().equals(caller.userId());
            default -> userClassGroupRepository.existsByUser_IdAndClassGroup_Id(
                    caller.userId(), course.getClassGroup().getId());
        };
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request) {
        User teacher = requireTeacher(request.teacherId());
        ClassGroup group = requireGroup(request.classGroupId());

        Course course = new Course();
        course.setName(request.name().trim());
        course.setTeacher(teacher);
        course.setClassGroup(group);
        course.setMeetLink(normalizeMeetLink(request.meetLink()));
        return SchedulingMapper.toCourseDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(Long id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + id + " not found"));

        if (request.name() != null) {
            String trimmed = request.name().trim();
            if (trimmed.isEmpty()) {
                throw new BadRequestException("Course name must not be blank.");
            }
            course.setName(trimmed);
        }
        if (request.teacherId() != null) {
            course.setTeacher(requireTeacher(request.teacherId()));
        }
        if (request.classGroupId() != null) {
            course.setClassGroup(requireGroup(request.classGroupId()));
        }
        if (request.meetLink() != null) {
            // Empty string clears the link; any other value sets it.
            course.setMeetLink(normalizeMeetLink(request.meetLink()));
        }
        return SchedulingMapper.toCourseDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + id + " not found"));
        courseRepository.delete(course);
    }

    private User requireTeacher(Long teacherId) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new BadRequestException("Teacher " + teacherId + " not found."));
        if (teacher.getRole() != UserRole.TEACHER) {
            throw new BadRequestException("User " + teacherId + " is not a TEACHER.");
        }
        return teacher;
    }

    private ClassGroup requireGroup(Long classGroupId) {
        return classGroupRepository.findById(classGroupId)
                .orElseThrow(() -> new BadRequestException("Class group " + classGroupId + " not found."));
    }

    /** Trim; an empty/blank value becomes null so a cleared link is stored as NULL. */
    private String normalizeMeetLink(String meetLink) {
        if (meetLink == null) {
            return null;
        }
        String trimmed = meetLink.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
