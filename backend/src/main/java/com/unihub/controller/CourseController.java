package com.unihub.controller;

import com.unihub.dto.CourseDto;
import com.unihub.dto.CreateCourseRequest;
import com.unihub.dto.UpdateCourseRequest;
import com.unihub.security.AuthenticatedUser;
import com.unihub.service.CourseService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * Courses API. Reads are open to any authenticated caller and scoped in the service (admin/teacher:
 * all; student: their groups'). Course metadata writes — create, update (including teacher/group
 * reassignment), delete — require ADMIN or TEACHER. When a TEACHER creates a course, the service
 * automatically assigns them as the teacher. Business logic lives in {@link CourseService}.
 */
@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public List<CourseDto> listCourses(@AuthenticationPrincipal AuthenticatedUser caller) {
        return courseService.listCourses(caller);
    }

    @GetMapping("/{id}")
    public CourseDto getCourse(@PathVariable Long id,
                               @AuthenticationPrincipal AuthenticatedUser caller) {
        return courseService.getCourse(id, caller);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseDto createCourse(@Valid @RequestBody CreateCourseRequest request,
                                  @AuthenticationPrincipal AuthenticatedUser caller) {
        return courseService.createCourse(request, caller);
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public CourseDto updateCourse(@PathVariable Long id,
                                  @Valid @RequestBody UpdateCourseRequest request) {
        return courseService.updateCourse(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    public void deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
    }
}
