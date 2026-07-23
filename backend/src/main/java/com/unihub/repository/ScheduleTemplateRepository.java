package com.unihub.repository;

import com.unihub.model.ScheduleTemplate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, Long> {

    List<ScheduleTemplate> findByCourse_Id(Long courseId);

    List<ScheduleTemplate> findByActiveTrue();
}
