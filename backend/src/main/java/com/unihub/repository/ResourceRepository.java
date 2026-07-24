package com.unihub.repository;

import com.unihub.model.Resource;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByModuleId(Long moduleId);

    List<Resource> findByModuleIdIn(List<Long> moduleIds);

    List<Resource> findByModuleIdInAndNameContainingIgnoreCase(List<Long> moduleIds, String q);
}
