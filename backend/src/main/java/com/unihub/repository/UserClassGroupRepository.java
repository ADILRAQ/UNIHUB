package com.unihub.repository;

import com.unihub.model.UserClassGroup;
import com.unihub.model.UserClassGroupId;
import com.unihub.model.UserRole;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserClassGroupRepository extends JpaRepository<UserClassGroup, UserClassGroupId> {

    List<UserClassGroup> findByUser_Id(Long userId);

    List<UserClassGroup> findByUser_IdAndUser_Role(Long userId, UserRole role);

    boolean existsByUser_IdAndClassGroup_Id(Long userId, Long classGroupId);

    long countByClassGroup_Id(Long classGroupId);
}
