package com.unihub.service;

import com.unihub.dto.CreateTemplateRequest;
import com.unihub.dto.ScheduleTemplateDto;
import com.unihub.dto.UpdateTemplateRequest;
import com.unihub.exception.BadRequestException;
import com.unihub.exception.ResourceNotFoundException;
import com.unihub.mapper.SchedulingMapper;
import com.unihub.model.Course;
import com.unihub.model.ScheduleTemplate;
import com.unihub.repository.CourseRepository;
import com.unihub.repository.ScheduleTemplateRepository;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Weekly schedule-template management. Creating a template immediately materialises its
 * sessions via the UNIH-29 engine; editing one reconciles the future series (past and
 * hand-modified occurrences are preserved). The generation engine is injected, never
 * reimplemented. Ownership (ADMIN or the owning teacher) is enforced at the controller
 * boundary via {@code @courseAccess}.
 */
@Service
public class ScheduleTemplateService {

    private final ScheduleTemplateRepository templateRepository;
    private final CourseRepository courseRepository;
    private final SessionGenerationService sessionGenerationService;

    public ScheduleTemplateService(ScheduleTemplateRepository templateRepository,
                                   CourseRepository courseRepository,
                                   SessionGenerationService sessionGenerationService) {
        this.templateRepository = templateRepository;
        this.courseRepository = courseRepository;
        this.sessionGenerationService = sessionGenerationService;
    }

    @Transactional(readOnly = true)
    public List<ScheduleTemplateDto> listTemplates(Long courseId) {
        requireCourse(courseId);
        return templateRepository.findByCourse_Id(courseId).stream()
                .sorted(Comparator.comparing(ScheduleTemplate::getDayOfWeek)
                        .thenComparing(ScheduleTemplate::getStartTime))
                .map(SchedulingMapper::toTemplateDto)
                .toList();
    }

    @Transactional
    public ScheduleTemplateDto createTemplate(Long courseId, CreateTemplateRequest request) {
        Course course = requireCourse(courseId);
        validateOrder(request.startTime(), request.endTime(), request.startDate(), request.endDate());

        ScheduleTemplate template = new ScheduleTemplate();
        template.setCourse(course);
        template.setDayOfWeek(request.dayOfWeek());
        template.setStartTime(request.startTime());
        template.setEndTime(request.endTime());
        template.setRoom(trimToNull(request.room()));
        template.setStartDate(request.startDate());
        template.setEndDate(request.endDate());
        template.setActive(request.active() == null || request.active());

        ScheduleTemplate saved = templateRepository.save(template);
        // Materialise the concrete sessions immediately so the calendar shows them at once.
        sessionGenerationService.generateSessions(saved);
        return SchedulingMapper.toTemplateDto(saved);
    }

    @Transactional
    public ScheduleTemplateDto updateTemplate(Long id, UpdateTemplateRequest request) {
        ScheduleTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template " + id + " not found"));

        if (request.dayOfWeek() != null) {
            template.setDayOfWeek(request.dayOfWeek());
        }
        if (request.startTime() != null) {
            template.setStartTime(request.startTime());
        }
        if (request.endTime() != null) {
            template.setEndTime(request.endTime());
        }
        if (request.room() != null) {
            template.setRoom(trimToNull(request.room()));
        }
        if (request.startDate() != null) {
            template.setStartDate(request.startDate());
        }
        if (request.endDate() != null) {
            template.setEndDate(request.endDate());
        }
        if (request.active() != null) {
            template.setActive(request.active());
        }
        validateOrder(template.getStartTime(), template.getEndTime(),
                template.getStartDate(), template.getEndDate());

        ScheduleTemplate saved = templateRepository.save(template);
        // Reconcile future auto rows to the edited template (UNIH-29): past & hand-modified
        // occurrences are left untouched.
        sessionGenerationService.regenerateSessions(saved);
        return SchedulingMapper.toTemplateDto(saved);
    }

    /**
     * Deletes a template. Its generated sessions are <em>kept</em>: the {@code template_id} FK
     * is {@code ON DELETE SET NULL} (V6), so those occurrences become standalone one-offs on
     * the calendar rather than disappearing. Cancel individual sessions first if you want them
     * gone.
     */
    @Transactional
    public void deleteTemplate(Long id) {
        ScheduleTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Template " + id + " not found"));
        templateRepository.delete(template);
    }

    private Course requireCourse(Long courseId) {
        return courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course " + courseId + " not found"));
    }

    private void validateOrder(LocalTime startTime, LocalTime endTime,
                               LocalDate startDate, LocalDate endDate) {
        if (!endTime.isAfter(startTime)) {
            throw new BadRequestException("End time must be after start time.");
        }
        if (endDate.isBefore(startDate)) {
            throw new BadRequestException("End date must not be before start date.");
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
