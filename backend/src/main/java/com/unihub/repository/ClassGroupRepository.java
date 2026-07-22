package com.unihub.repository;

import com.unihub.model.ClassGroup;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassGroupRepository extends JpaRepository<ClassGroup, Long> {

    Optional<ClassGroup> findByName(String name);
}
