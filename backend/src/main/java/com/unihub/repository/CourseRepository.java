package com.unihub.repository;

import com.unihub.model.Course;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, Long> {

    List<Course> findByTeacher_Id(Long teacherId);

    List<Course> findByClassGroup_Id(Long classGroupId);
}
