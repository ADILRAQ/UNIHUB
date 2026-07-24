package com.unihub.repository;

import com.unihub.model.CourseModule;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {

    List<CourseModule> findByCourseIdOrderByDisplayOrderAsc(Long courseId);
}
